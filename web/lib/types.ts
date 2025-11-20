export interface Model {
    blobId: string;
    name: string;
    description?: string;
    uploader: string;
    tags?: string[];
    timestamp?: number;
}

export interface ModelEvent {
    parsedJson: {
        blob_id: string;
        name: string;
        description?: string;
        uploader: string;
        tags?: string[];
    };
    timestampMs?: string;
}

export interface ModelDownloadEvent {
    parsedJson: {
        blob_id: string;
        downloader: string;
    };
}
