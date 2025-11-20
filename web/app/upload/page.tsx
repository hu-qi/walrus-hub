"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useSignAndExecuteTransaction, useCurrentAccount } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { uploadBlob } from "@/lib/walrus";
import { PACKAGE_ID, REGISTRY_ID, MODULE_NAME } from "@/lib/contracts";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";

export default function UploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [tags, setTags] = useState("");
    const [loading, setLoading] = useState(false);
    const account = useCurrentAccount();
    const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [isGenerating, setIsGenerating] = useState(false);

    // LLM configuration (optional)
    const [showAdvancedConfig, setShowAdvancedConfig] = useState(false);
    const [llmModel, setLlmModel] = useState("");
    const [llmApiKey, setLlmApiKey] = useState("");
    const [llmBaseURL, setLlmBaseURL] = useState("");



    const handleGenerateMetadata = async () => {
        if (!name) {
            toast.error("Please enter a model name first", { position: "top-center" });
            return;
        }

        setIsGenerating(true);
        const toastId = toast.loading("Generating metadata with AI...", { position: "top-center" });

        try {
            // Prepare LLM config if user provided any custom values
            const llmConfig: any = {};
            if (llmModel) llmConfig.model = llmModel;
            if (llmApiKey) llmConfig.apiKey = llmApiKey;
            if (llmBaseURL) llmConfig.baseURL = llmBaseURL;

            const response = await fetch("/api/generate-metadata", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    modelName: name,
                    ...(Object.keys(llmConfig).length > 0 && { llmConfig })
                }),
            });

            if (!response.ok) {
                throw new Error(await response.text());
            }

            if (!response.body) {
                throw new Error("No response body");
            }

            // Clear existing fields
            setDescription("");
            setTags("");

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            // Stream buffers: what we've received vs what we've displayed
            let streamBuffer = "";
            let displayedDescLength = 0;
            let displayedTagsLength = 0;
            let isStreamComplete = false;
            let animationFrameId: number | null = null;

            // Start the reading process
            const readStream = async () => {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) {
                        isStreamComplete = true;
                        break;
                    }

                    const chunk = decoder.decode(value, { stream: true });
                    streamBuffer += chunk;
                }
            };

            // Start typing animation with RAF for smooth updates
            const startTypingAnimation = () => {
                let lastTimestamp = performance.now();

                const animate = (currentTimestamp: number) => {
                    const deltaTime = currentTimestamp - lastTimestamp;

                    // Dynamic speed: type faster if there's a backlog
                    // Base speed: ~50 chars per second
                    // Speed up to ~200 chars per second if there's a large backlog
                    const parsedData = parseStreamBuffer(streamBuffer);
                    const descBacklog = parsedData.description.length - displayedDescLength;
                    const tagsBacklog = parsedData.tags.length - displayedTagsLength;
                    const totalBacklog = descBacklog + tagsBacklog;

                    // Calculate chars to type this frame based on backlog
                    // More backlog = faster typing (to catch up)
                    const baseCharsPerSecond = 50;
                    const maxCharsPerSecond = 200;
                    const backlogThreshold = 100; // Start speeding up after 100 chars backlog

                    let charsPerSecond = baseCharsPerSecond;
                    if (totalBacklog > backlogThreshold) {
                        const speedMultiplier = Math.min(totalBacklog / backlogThreshold, 4);
                        charsPerSecond = Math.min(baseCharsPerSecond * speedMultiplier, maxCharsPerSecond);
                    }

                    const charsToType = Math.ceil((charsPerSecond * deltaTime) / 1000);

                    // Type description characters
                    if (displayedDescLength < parsedData.description.length) {
                        displayedDescLength = Math.min(
                            displayedDescLength + charsToType,
                            parsedData.description.length
                        );
                        setDescription(parsedData.description.slice(0, displayedDescLength));
                    }

                    // Type tags characters (only after description is complete)
                    if (displayedDescLength >= parsedData.description.length &&
                        displayedTagsLength < parsedData.tags.length) {
                        displayedTagsLength = Math.min(
                            displayedTagsLength + charsToType,
                            parsedData.tags.length
                        );
                        setTags(parsedData.tags.slice(0, displayedTagsLength));
                    }

                    lastTimestamp = currentTimestamp;

                    // Continue animation if there's more to type or stream is still running
                    if (displayedDescLength < parsedData.description.length ||
                        displayedTagsLength < parsedData.tags.length ||
                        !isStreamComplete) {
                        animationFrameId = requestAnimationFrame(animate);
                    } else {
                        // Animation complete
                        animationFrameId = null;
                    }
                };

                animationFrameId = requestAnimationFrame(animate);
            };

            // Helper to parse the stream buffer
            const parseStreamBuffer = (buffer: string) => {
                let description = "";
                let tags = "";

                const tagsIndex = buffer.indexOf("Tags:");
                if (tagsIndex !== -1) {
                    // Both sections present
                    description = buffer.substring(0, tagsIndex).replace("Description:", "").trim();
                    tags = buffer.substring(tagsIndex + 5).replace(/[\[\]]/g, "").trim();
                } else {
                    // Only description so far
                    description = buffer.replace("Description:", "").trim();
                }

                return { description, tags };
            };

            // Start both processes concurrently
            startTypingAnimation();
            await readStream();

            // Wait for typing animation to complete
            await new Promise<void>((resolve) => {
                const checkComplete = () => {
                    if (!animationFrameId && isStreamComplete) {
                        resolve();
                    } else {
                        setTimeout(checkComplete, 100);
                    }
                };
                checkComplete();
            });

            toast.success("Metadata generated successfully!", { id: toastId });

        } catch (error: any) {
            console.error("Generation failed:", error);
            toast.error("Failed to generate metadata", { id: toastId });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !account) return;

        setLoading(true);
        try {
            // 1. Upload to Walrus
            const blobId = await uploadBlob(file);
            console.log("Blob ID:", blobId);

            // 2. Register on Sui
            const tx = new Transaction();
            tx.moveCall({
                target: `${PACKAGE_ID}::${MODULE_NAME}::register_model`,
                arguments: [
                    tx.object(REGISTRY_ID),
                    tx.pure.string(name),
                    tx.pure.string(description),
                    tx.pure.string(blobId),
                    tx.pure.vector("string", tags.split(",").map(t => t.trim())),
                ],
            });

            signAndExecuteTransaction(
                { transaction: tx },
                {
                    onSuccess: async (result) => {
                        console.log("Transaction successful:", result);
                        await queryClient.invalidateQueries({ queryKey: ["queryEvents"] });
                        toast.success("Model registered successfully!", {
                            position: "top-center"
                        });

                        // Trigger confetti
                        confetti({
                            particleCount: 150,
                            spread: 70,
                            origin: { y: 0.6 }
                        });

                        // Delay redirect slightly to show confetti
                        setTimeout(() => {
                            router.push("/");
                        }, 1000);

                    },
                    onError: (error) => {
                        console.error("Transaction failed:", error);
                        const errorMessage = error.message || "";
                        if (errorMessage.includes("MoveAbort") && errorMessage.includes("register_model") && errorMessage.includes(", 0)")) {
                            toast.error("Upload failed: This file has already been registered. Please upload a different file.", {
                                position: "top-center"
                            });
                        } else {
                            toast.error("Transaction failed: " + errorMessage, {
                                position: "top-center"
                            });
                        }
                    },
                }
            );
        } catch (error: any) {
            console.error("Upload failed:", error);
            toast.error("Upload failed: " + error.message, {
                position: "top-center"
            });
        } finally {
            setLoading(false);
        }
    };

    if (!account) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <h1 className="text-2xl font-bold mb-4">Connect Wallet to Upload</h1>
                <p className="text-gray-600">You need to connect your Sui wallet to upload models.</p>
            </div>
        );
    }

    return (
        <>
            {/* LLM Config Modal */}
            {showAdvancedConfig && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/15 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-white/20 ring-1 ring-black/5">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">LLM Configuration</h3>
                                <p className="text-xs text-gray-600 mt-0.5">Configure your AI model settings</p>
                            </div>
                            <button
                                onClick={() => setShowAdvancedConfig(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="px-6 py-5 space-y-4">
                            <p className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                                💡 Leave fields blank to use system defaults
                            </p>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Base URL
                                </label>
                                <input
                                    type="text"
                                    value={llmBaseURL}
                                    onChange={(e) => setLlmBaseURL(e.target.value)}
                                    placeholder="https://api.openai.com/v1"
                                    className="w-full px-4 py-2.5 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    API Key
                                </label>
                                <input
                                    type="password"
                                    value={llmApiKey}
                                    onChange={(e) => setLlmApiKey(e.target.value)}
                                    placeholder="sk-..."
                                    className="w-full px-4 py-2.5 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Model Name
                                </label>
                                <input
                                    type="text"
                                    value={llmModel}
                                    onChange={(e) => setLlmModel(e.target.value)}
                                    placeholder="e.g. gpt-4, claude-3-5-sonnet-20241022"
                                    className="w-full px-4 py-2.5 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setLlmModel("");
                                    setLlmApiKey("");
                                    setLlmBaseURL("");
                                }}
                                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                            >
                                Clear All
                            </button>
                            <button
                                onClick={() => setShowAdvancedConfig(false)}
                                className="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:shadow-lg transition-all"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="max-w-2xl mx-auto py-12 px-6">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold">Upload Model</h1>

                    {/* Settings Icon */}
                    <button
                        type="button"
                        onClick={() => setShowAdvancedConfig(true)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all group relative"
                        title="LLM Settings"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {(llmModel || llmApiKey || llmBaseURL) && (
                            <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                    </button>
                </div>
                <form onSubmit={handleUpload} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Model Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder="e.g. Llama-3-8B-Instruct"
                        />
                    </div>

                    <div className="flex justify-end -mt-4 mb-2">
                        <button
                            type="button"
                            onClick={handleGenerateMetadata}
                            disabled={isGenerating || !name}
                            className={`text-sm flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${isGenerating || !name
                                ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                                : "text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700"
                                }`}
                        >
                            {isGenerating ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    Auto-Generate with AI
                                </>
                            )}
                        </button>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            rows={4}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder="Describe your model..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma separated)</label>
                        <input
                            type="text"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder="nlp, llm, pytorch"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Model Weights File</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer relative">
                            <input
                                type="file"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                required
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            {file ? (
                                <p className="text-green-600 font-medium">{file.name}</p>
                            ) : (
                                <p className="text-gray-500">Click or drag file to upload</p>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 px-6 rounded-lg text-white font-medium text-lg transition-all ${loading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg hover:scale-[1.02]"
                            }`}
                    >
                        {loading ? "Uploading..." : "Upload to Walrus & Register"}
                    </button>
                </form>
            </div>
        </>
    );
}
