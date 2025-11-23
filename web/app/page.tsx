"use client";

import { useSuiClientQuery, useCurrentAccount, ConnectButton, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { PACKAGE_ID, MODULE_NAME } from "@/lib/contracts";
import { downloadBlob } from "@/lib/walrus";
import { Model } from "@/lib/types";
import { toast } from "react-hot-toast";
import { formatRelativeTime } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import confetti from "canvas-confetti";

const ITEMS_PER_PAGE = 6;

export default function Home() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [showThumbsUp, setShowThumbsUp] = useState(false);
  const router = useRouter();

  const account = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  // Query ModelRegistered events from the blockchain
  const { data: eventsData, isPending, error } = useSuiClientQuery("queryEvents", {
    query: {
      MoveEventType: `${PACKAGE_ID}::${MODULE_NAME}::ModelRegistered`,
    },
    order: "descending",
  }, {
    refetchInterval: 10000,
  });

  // Query ModelDownloaded events for download counts
  const { data: downloadEventsData } = useSuiClientQuery("queryEvents", {
    query: {
      MoveEventType: `${PACKAGE_ID}::${MODULE_NAME}::ModelDownloaded`,
    },
  }, {
    refetchInterval: 10000,
  });

  // Parse events into model objects
  const allModels: Model[] = eventsData?.data?.map((event: any) => {
    const parsedJson = event.parsedJson;
    return {
      blobId: parsedJson.blob_id,
      name: parsedJson.name,
      description: parsedJson.description,
      tags: parsedJson.tags || [],
      uploader: parsedJson.uploader,
      timestamp: event.timestampMs ? parseInt(event.timestampMs as string) : undefined,
    };
  }) || [];

  // Calculate download counts from events
  const downloadCounts = useMemo(() => {
    if (!downloadEventsData?.data) return {};

    return downloadEventsData.data.reduce((acc: Record<string, number>, event: any) => {
      const blobId = event.parsedJson.blob_id;
      acc[blobId] = (acc[blobId] || 0) + 1;
      return acc;
    }, {});
  }, [downloadEventsData]);

  // Search filtering
  const filteredModels = allModels.filter((model) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    const nameMatch = model.name.toLowerCase().includes(query);
    const descMatch = model.description?.toLowerCase().includes(query);
    const tagsMatch = model.tags?.some(tag => tag.toLowerCase().includes(query));
    const uploaderMatch = model.uploader.toLowerCase().includes(query);

    return nameMatch || descMatch || tagsMatch || uploaderMatch;
  });

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Pagination calculations (applied to filtered results)
  const totalPages = Math.ceil(filteredModels.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentModels = filteredModels.slice(startIndex, endIndex);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };


  if (isPending) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-6 text-center">
        <p className="text-gray-600">Loading models...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-6">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Decentralized Model Hub
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Host and share AI models with immutable storage on Walrus and decentralized registry on Sui.
          </p>
        </div>
        <div className="text-center text-red-600">
          <p>Error loading models: {error.message}</p>
          <p className="text-sm text-gray-500 mt-2">Make sure the contract is deployed and PACKAGE_ID is correct.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-6">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Decentralized Model Hub
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Host and share AI models with immutable storage on Walrus and decentralized registry on Sui.
        </p>
      </div>

      {/* Search Bar */}
      {allModels.length > 0 && (
        <div className="max-w-3xl mx-auto mb-12">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by model name, description, tags, or uploader..."
              className="block w-full pl-12 pr-12 py-4 text-gray-900 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-gray-700 text-gray-400 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="mt-3 text-sm text-gray-600 text-center">
              Found {filteredModels.length} model{filteredModels.length !== 1 ? 's' : ''} matching "{searchQuery}"
            </p>
          )}
        </div>
      )}

      {allModels.length === 0 ? (
        <div className="text-center text-gray-600 py-12">
          <p className="text-lg mb-4">No models uploaded yet.</p>
          <div
            onClick={() => {
              setShowThumbsUp(true);
              setTimeout(() => {
                router.push('/upload');
              }, 1000);
            }}
            className="inline-block cursor-pointer hover:scale-105 transition-transform duration-200 relative"
          >
            <p className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Be the first to upload a model!
            </p>
            {showThumbsUp && (
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 flex gap-2 pointer-events-none">
                <span className="text-3xl animate-float-up" style={{ animationDelay: '0s' }}>👍</span>
                <span className="text-3xl animate-float-up" style={{ animationDelay: '0.2s', marginTop: '-10px' }}>👍</span>
                <span className="text-3xl animate-float-up" style={{ animationDelay: '0.4s' }}>👍</span>
              </div>
            )}
          </div>
        </div>
      ) : filteredModels.length === 0 ? (
        <div className="text-center text-gray-600">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-lg mb-2">No models found</p>
          <p className="text-sm mb-4">Try adjusting your search terms</p>
          <button
            onClick={handleClearSearch}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Clear search
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {currentModels.map((model, i) => {
              // Generate consistent color for avatar based on model name
              const colorIndex = model.name.charCodeAt(0) % 6;
              const gradients = [
                'from-blue-400 to-purple-500',
                'from-green-400 to-teal-500',
                'from-orange-400 to-red-500',
                'from-pink-400 to-rose-500',
                'from-indigo-400 to-blue-500',
                'from-yellow-400 to-orange-500',
              ];

              return (
                <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-xl hover:border-blue-300 hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
                  <div className="p-5">
                    {/* Header with Avatar and Model Info */}
                    <div className="flex items-start gap-3 mb-4">
                      {/* Model Avatar */}
                      <div className={`flex-shrink-0 w-14 h-14 rounded-lg bg-gradient-to-br ${gradients[colorIndex]} flex items-center justify-center shadow-md`}>
                        <span className="text-2xl font-bold text-white">
                          {model.name[0]?.toUpperCase() || 'M'}
                        </span>
                      </div>

                      {/* Model Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                          {model.name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1">
                          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="text-xs font-mono text-gray-600 truncate">
                            {model.uploader.slice(0, 22)}...
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed h-10">
                      {model.description}
                    </p>

                    {/* Tags with overflow handling */}
                    <div className="h-[72px] mb-4">
                      {model.tags && model.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {model.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-md max-w-[120px]">
                              <svg className="w-3 h-3 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                              </svg>
                              <span className="truncate">{tag}</span>
                            </span>
                          ))}
                          {model.tags.length > 3 && (
                            <span className="inline-flex items-center px-2.5 py-1 bg-gray-50 text-gray-500 text-xs font-medium rounded-md">
                              +{model.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Metadata Footer */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 pb-4 border-b border-gray-100">
                      <div className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{model.timestamp ? formatRelativeTime(model.timestamp) : 'Recently'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span>{downloadCounts[model.blobId] || 0} downloads</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Link
                        href={`/model?id=${model.blobId}`}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View
                      </Link>
                      {account ? (
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
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
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all cursor-pointer"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download
                        </button>
                      ) : (
                        <div className="flex-1 [&>button]:w-full [&>button]:justify-center">
                          <ConnectButton
                            connectText="Connect"
                            className="!text-sm !font-medium !text-gray-700 !bg-white !border !border-gray-300 !rounded-lg !px-4 !py-2.5 hover:!bg-gray-50 hover:!border-gray-400 !transition-all"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>

              <span className="text-sm text-gray-600">
                Page <span className="font-medium text-gray-900">{currentPage}</span> of <span className="font-medium text-gray-900">{totalPages}</span>
              </span>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300"
              >
                Next
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
