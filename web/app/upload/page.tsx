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
        <div className="max-w-2xl mx-auto py-12 px-6">
            <h1 className="text-3xl font-bold mb-8">Upload Model</h1>
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
    );
}
