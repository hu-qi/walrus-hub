/**
 * Client-side LLM API Module
 * Handles direct browser-to-LLM API calls for metadata generation
 */

import OpenAI from 'openai';
import { LLMConfig } from './llm-config';

export interface GenerateMetadataParams {
  modelName: string;
  llmConfig: LLMConfig;
}

export interface GeneratedMetadata {
  description: string;
  tags: string[];
}

export class LLMClient {
  /**
   * Generate metadata for a model using streaming LLM API
   * @param params - Model name and LLM configuration
   * @param onChunk - Callback for each chunk of streamed data
   */
  static async generateMetadata(
    params: GenerateMetadataParams,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const { modelName, llmConfig } = params;

    if (!modelName || modelName.trim() === '') {
      throw new Error('Model name is required');
    }

    if (!llmConfig.apiKey || !llmConfig.baseURL || !llmConfig.model) {
      throw new Error('Invalid LLM configuration');
    }

    // Create OpenAI client with user's configuration
    const client = new OpenAI({
      apiKey: llmConfig.apiKey,
      baseURL: llmConfig.baseURL,
      dangerouslyAllowBrowser: true, // Required for browser usage
    });

    const prompt = `
You are an expert AI model librarian. 
Generate a concise technical description (2-3 sentences) and a list of 5-8 relevant tags for an AI model named "${modelName}".
Format the output exactly as follows:
Description: [Your description here]
Tags: [tag1, tag2, tag3]
Do not include any other text or markdown formatting.
`;

    try {
      const response = await client.chat.completions.create({
        model: llmConfig.model,
        messages: [
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: 4096,
        stream: true,
      });

      // Stream the response
      let buffer = '';
      for await (const chunk of response) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          buffer += content;
          onChunk(buffer);
        }
      }
    } catch (error: any) {
      // Enhanced error handling
      if (error.status === 401) {
        throw new Error('Invalid API Key. Please check your configuration.');
      } else if (error.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else if (error.status === 403) {
        throw new Error('Access forbidden. Please check your API Key permissions.');
      } else if (error.message?.includes('CORS')) {
        throw new Error('CORS error. This LLM provider may not support browser requests.');
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        throw new Error('Network error. Please check your internet connection.');
      } else {
        throw new Error(error.message || 'Failed to generate metadata');
      }
    }
  }

  /**
   * Parse the stream buffer to extract description and tags
   * @param buffer - The accumulated stream buffer
   * @returns Parsed metadata with description and tags
   */
  static parseStreamBuffer(buffer: string): GeneratedMetadata {
    let description = '';
    let tags: string[] = [];

    const tagsIndex = buffer.indexOf('Tags:');
    if (tagsIndex !== -1) {
      // Both sections present
      description = buffer.substring(0, tagsIndex).replace('Description:', '').trim();
      const tagsString = buffer.substring(tagsIndex + 5).replace(/[\[\]]/g, '').trim();
      
      // Parse tags (comma-separated)
      if (tagsString) {
        tags = tagsString
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0);
      }
    } else {
      // Only description so far
      description = buffer.replace('Description:', '').trim();
    }

    return { description, tags };
  }
}
