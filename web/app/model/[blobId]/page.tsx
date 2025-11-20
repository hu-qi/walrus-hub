"use client";

import { useSuiClientQuery, useCurrentAccount, ConnectButton } from "@mysten/dapp-kit";
import { PACKAGE_ID, MODULE_NAME } from "@/lib/contracts";
import { downloadBlob } from "@/lib/walrus";
import { Model } from "@/lib/types";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useMemo } from "react";
import confetti from "canvas-confetti";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";

export default function ModelDetailPage() {
    const params = useParams();
    const blobId = params.blobId as string;
    const account = useCurrentAccount();
    const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
    const [copiedField, setCopiedField] = useState<string | null>(null);

    // Query ModelRegistered events from the blockchain
    const { data: eventsData, isPending, error } = useSuiClientQuery("queryEvents", {
        query: {
            MoveEventType: `${PACKAGE_ID}::${MODULE_NAME}::ModelRegistered`,
        },
        order: "descending",
    });

    // Query ModelDownloaded events for download counts
    const { data: downloadEventsData } = useSuiClientQuery("queryEvents", {
        query: {
            MoveEventType: `${PACKAGE_ID}::${MODULE_NAME}::ModelDownloaded`,
        },
    }, {
        refetchInterval: 10000,
    });

    // Find the specific model by blob ID
    const modelEvent = eventsData?.data?.find((event: any) =>
        event.parsedJson?.blob_id === blobId
    );

    const model: Model | undefined = modelEvent ? {
        blobId: (modelEvent.parsedJson as any).blob_id,
        name: (modelEvent.parsedJson as any).name,
        description: (modelEvent.parsedJson as any).description,
        tags: (modelEvent.parsedJson as any).tags || [],
        uploader: (modelEvent.parsedJson as any).uploader,
        timestamp: modelEvent.timestampMs ? parseInt(modelEvent.timestampMs as string) : undefined,
    } : undefined;

    // Calculate download count for this model
    const downloadCount = useMemo(() => {
        if (!downloadEventsData?.data || !blobId) return 0;
        return downloadEventsData.data.filter((event: any) =>
            event.parsedJson?.blob_id === blobId
        ).length;
    }, [downloadEventsData, blobId]);

    const copyToClipboard = async (text: string, field: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedField(field);
            toast.success("Copied to clipboard!", { position: "top-center" });
            setTimeout(() => setCopiedField(null), 2000);
        } catch (error) {
            toast.error("Failed to copy", { position: "top-center" });
        }
    };

    if (isPending) {
        return (
            <div className="max-w-4xl mx-auto py-12 px-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (error || !model) {
        return (
            <div className="max-w-4xl mx-auto py-12 px-6">
                <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6 transition-colors">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Home
                </Link>
                <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-2">Model Not Found</h2>
                    <p className="text-red-600">
                        {error ? `Error: ${error.message}` : "The model you're looking for doesn't exist."}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-12 px-6">
            {/* Breadcrumb */}
            <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8 transition-colors group">
                <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Models
            </Link>

            {/* Model Header */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 mb-8 border border-blue-100">
                <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {model.name}
                </h1>
                {model.tags && model.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {model.tags.map((tag) => (
                            <span key={tag} className="px-4 py-1.5 bg-white/80 backdrop-blur-sm text-blue-600 text-sm font-medium rounded-full border border-blue-200 shadow-sm">
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
                {model.timestamp && (
                    <p className="text-sm text-gray-600">
                        Uploaded on {new Date(model.timestamp).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </p>
                )}
            </div>

            {/* Model Details */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                {/* Description */}
                <div className="p-8 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {model.description || "No description provided."}
                    </p>
                </div>

                {/* Technical Details */}
                <div className="p-8 space-y-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Technical Details</h2>

                    {/* Blob ID */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">Blob ID</label>
                        <div className="flex items-center gap-2">
                            <a
                                href={`https://walruscan.com/${process.env.NEXT_PUBLIC_NETWORK || 'testnet'}/blob/${model.blobId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 bg-gray-50 px-4 py-3 rounded-lg text-sm font-mono text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 break-all transition-all group flex items-center gap-2"
                            >
                                <span className="flex-1">{model.blobId}</span>
                                <svg className="w-4 h-4 flex-shrink-0 opacity-60 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </a>
                            <button
                                onClick={() => copyToClipboard(model.blobId, 'blobId')}
                                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
                                title="Copy Blob ID"
                            >
                                {copiedField === 'blobId' ? (
                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Uploader */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">Uploader Address</label>
                        <div className="flex items-center gap-2">
                            <a
                                href={`https://suiscan.xyz/${process.env.NEXT_PUBLIC_NETWORK || 'testnet'}/account/${model.uploader}/activity`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 bg-gray-50 px-4 py-3 rounded-lg text-sm font-mono text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 break-all transition-all group flex items-center gap-2"
                            >
                                <span className="flex-1">{model.uploader}</span>
                                <svg className="w-4 h-4 flex-shrink-0 opacity-60 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </a>
                            <button
                                onClick={() => copyToClipboard(model.uploader, 'uploader')}
                                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
                                title="Copy Uploader Address"
                            >
                                {copiedField === 'uploader' ? (
                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Download Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Download Model</h2>
                <p className="text-gray-600 mb-6">
                    Download the model weights stored on Walrus decentralized storage.
                </p>
                {account ? (
                    <button
                        onClick={async () => {
                            const toastId = toast.loading("Preparing download...", {
                                position: "top-center"
                            });
                            try {
                                // Record download on blockchain
                                const tx = new Transaction();
                                tx.moveCall({
                                    target: `${PACKAGE_ID}::${MODULE_NAME}::record_download`,
                                    arguments: [tx.pure.string(model.blobId)],
                                });

                                await new Promise((resolve, reject) => {
                                    signAndExecuteTransaction({
                                        transaction: tx,
                                    }, {
                                        onSuccess: () => resolve(undefined),
                                        onError: (error) => reject(error),
                                    });
                                });

                                toast.loading("Starting download...", { id: toastId });

                                // Download the blob
                                await downloadBlob(model.blobId, `${model.name}.blob`);

                                // Trigger confetti on success
                                confetti({
                                    particleCount: 100,
                                    spread: 70,
                                    origin: { y: 0.6 }
                                });

                                toast.success("Download started!", {
                                    id: toastId,
                                    position: "top-center"
                                });
                            } catch (error: any) {
                                console.error("Download failed:", error);
                                toast.error("Download failed: " + error.message, {
                                    id: toastId,
                                    position: "top-center"
                                });
                            }
                        }}
                        className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download Model Weights ({downloadCount})
                    </button>
                ) : (
                    <div className="inline-block">
                        <ConnectButton
                            connectText="Connect Wallet to Download"
                            className="!text-sm !font-medium !text-white !bg-blue-600 !rounded-lg !px-6 !py-3 hover:!bg-blue-700 !transition-all !shadow-sm"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
