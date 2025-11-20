// Verified working aggregator endpoints (tested 2025-11-20)
export const WALRUS_AGGREGATORS = [
    "https://aggregator.walrus-testnet.walrus.space",
    "https://sui-walrus-tn-aggregator.bwarelabs.com",
    "https://walrus-testnet-aggregator.nodes.guru",
    "https://wal-aggregator-testnet.staketab.org",
    "https://walrus-testnet-aggregator.stakingdefenseleague.com",
    "https://walrus-testnet-aggregator.chainbase.online",
    "https://walrus-testnet-aggregator.stakely.io",
    "https://aggregator.testnet.walrus.atalma.io",
    "https://walrus-aggregator-testnet.cetus.zone",
    "https://walrus-testnet.blockscope.net",
];

// Verified working publisher endpoints (tested 2025-11-20)
export const WALRUS_PUBLISHERS = [
    "https://publisher.walrus-testnet.walrus.space",
    "https://sui-walrus-testnet-publisher.bwarelabs.com",
    "https://walrus-testnet-publisher.nodes.guru",
    "https://wal-publisher-testnet.staketab.org",
    "https://walrus-testnet-publisher.stakingdefenseleague.com",
    "https://walrus-testnet-publisher.chainbase.online",
    "https://walrus-testnet-publisher.stakely.io",
    "https://publisher.testnet.walrus.atalma.io",
    "http://walrus-publisher-testnet.cetus.zone:9001",
    "https://walrus-testnet.blockscope.net:11444",
];

export interface WalrusUploadResponse {
    newlyCreated?: {
        blobObject: {
            blobId: string;
            storage: any;
            encoding: any;
        };
    };
    alreadyCertified?: {
        blobId: string;
        event: any;
    };
}

export async function uploadBlob(file: File): Promise<string> {
    let lastError: Error | null = null;

    console.log(`[Walrus] Starting upload for file: ${file.name} (${file.size} bytes)`);

    // Try each publisher until one succeeds
    for (let i = 0; i < WALRUS_PUBLISHERS.length; i++) {
        const publisherUrl = WALRUS_PUBLISHERS[i];
        console.log(`[Walrus] Attempting upload to publisher ${i + 1}/${WALRUS_PUBLISHERS.length}: ${publisherUrl}`);

        try {
            const response = await fetch(`${publisherUrl}/v1/blobs?epochs=1`, {
                method: "PUT",
                body: file,
                headers: {
                    "Content-Type": "application/octet-stream",
                },
            });

            console.log(`[Walrus] Response from ${publisherUrl}: ${response.status} ${response.statusText}`);

            if (!response.ok) {
                const errorText = await response.text().catch(() => "Unable to read error");
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const data: WalrusUploadResponse = await response.json();
            console.log(`[Walrus] Parsed response:`, data);

            const blobId =
                data.newlyCreated?.blobObject?.blobId ||
                data.alreadyCertified?.blobId;

            if (!blobId) {
                throw new Error("No blob ID in response");
            }

            console.log(`[Walrus] ✅ Upload successful! Blob ID: ${blobId}`);
            return blobId;
        } catch (error: any) {
            console.error(`[Walrus] ❌ Failed to upload to ${publisherUrl}:`, error);
            lastError = error;
            continue;
        }
    }

    console.error(`[Walrus] All ${WALRUS_PUBLISHERS.length} publishers failed`);
    throw new Error(
        `All publishers failed. Last error: ${lastError?.message || "Unknown"}`
    );
}

export function getBlobUrl(blobId: string): string {
    return `${WALRUS_AGGREGATORS[0]}/v1/blobs/${blobId}`;
}

export async function downloadBlob(blobId: string, filename: string): Promise<void> {
    console.log(`[Walrus] Starting download for blob: ${blobId}`);

    for (let i = 0; i < WALRUS_AGGREGATORS.length; i++) {
        const aggregatorUrl = WALRUS_AGGREGATORS[i];
        console.log(`[Walrus] Attempting download from aggregator ${i + 1}/${WALRUS_AGGREGATORS.length}: ${aggregatorUrl}`);

        try {
            const response = await fetch(`${aggregatorUrl}/v1/blobs/${blobId}`);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            console.log(`[Walrus] ✅ Download successful!`);
            return;
        } catch (error: any) {
            console.error(`[Walrus] ❌ Failed to download from ${aggregatorUrl}:`, error);
            continue;
        }
    }

    throw new Error("All aggregators failed to download the blob.");
}
