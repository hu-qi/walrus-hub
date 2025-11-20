import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Default LLM configuration
const DEFAULT_CONFIG = {
    apiKey: "69be55d730b64d01ace31d0af07cfcb7.mzeIDXrIrFL8qpcN",
    baseURL: "https://api.z.ai/api/paas/v4/",
    model: "GLM-4.5-Flash",
};

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const {
            modelName,
            llmConfig
        } = await request.json();

        if (!modelName) {
            return NextResponse.json(
                { error: 'Model name is required' },
                { status: 400 }
            );
        }

        // Security: Only allow custom config if baseURL is provided
        // This prevents users from accidentally using other models without their own endpoint
        let apiKey: string;
        let baseURL: string;
        let model: string;

        if (llmConfig?.baseURL) {
            // User provided their own endpoint, allow custom config
            apiKey = llmConfig.apiKey || DEFAULT_CONFIG.apiKey;
            baseURL = llmConfig.baseURL;
            model = llmConfig.model || DEFAULT_CONFIG.model;
        } else {
            // No custom endpoint, force system defaults
            apiKey = DEFAULT_CONFIG.apiKey;
            baseURL = DEFAULT_CONFIG.baseURL;
            model = DEFAULT_CONFIG.model;
        }

        // Create client with appropriate config
        const client = new OpenAI({
            apiKey,
            baseURL,
        });

        const prompt = `
You are an expert AI model librarian. 
Generate a concise technical description (2-3 sentences) and a list of 5-8 relevant tags for an AI model named "${modelName}".
Format the output exactly as follows:
Description: [Your description here]
Tags: [tag1, tag2, tag3]
Do not include any other text or markdown formatting.
`;

        const response = await client.chat.completions.create({
            model,
            messages: [
                { role: "user", content: prompt }
            ],
            temperature: 0.7,
            top_p: 0.9,
            max_tokens: 4096,
            stream: true,
        });

        // Create a ReadableStream from the OpenAI stream
        const stream = new ReadableStream({
            async start(controller) {
                console.log("Stream started at:", new Date().toISOString());
                try {
                    for await (const chunk of response) {
                        const content = chunk.choices[0]?.delta?.content || '';
                        if (content) {
                            console.log("Chunk received at:", new Date().toISOString(), "Content:", content);
                            controller.enqueue(new TextEncoder().encode(content));
                        }
                    }
                } catch (e) {
                    console.error("Stream error:", e);
                    controller.error(e);
                } finally {
                    console.log("Stream closed at:", new Date().toISOString());
                    controller.close();
                }
            },
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache, no-transform',
                'Connection': 'keep-alive',
                'X-Content-Type-Options': 'nosniff',
            },
        });

    } catch (error: any) {
        console.error("Metadata generation failed:", JSON.stringify(error, null, 2));
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
