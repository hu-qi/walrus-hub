module walrus_model_hub::model_hub {
    use std::string::{String};
    use sui::table::{Self, Table};
    use sui::event;

    // Errors
    const EModelAlreadyExists: u64 = 0;

    // Structs
    public struct Model has store, drop {
        name: String,
        description: String,
        blob_id: String,
        uploader: address,
        tags: vector<String>,
    }

    public struct Registry has key {
        id: UID,
        models: Table<String, Model>, // Key: blob_id
    }

    // Events
    public struct ModelRegistered has copy, drop {
        blob_id: String,
        name: String,
        description: String,
        tags: vector<String>,
        uploader: address,
    }

    public struct ModelDownloaded has copy, drop {
        blob_id: String,
        downloader: address,
    }

    fun init(ctx: &mut TxContext) {
        let registry = Registry {
            id: object::new(ctx),
            models: table::new(ctx),
        };
        transfer::share_object(registry);
    }

    public entry fun register_model(
        registry: &mut Registry,
        name: String,
        description: String,
        blob_id: String,
        tags: vector<String>,
        ctx: &mut TxContext
    ) {
        assert!(!table::contains(&registry.models, blob_id), EModelAlreadyExists);

        let model = Model {
            name,
            description,
            blob_id: blob_id,
            uploader: tx_context::sender(ctx),
            tags,
        };

        event::emit(ModelRegistered {
            blob_id: blob_id,
            name: model.name,
            description: model.description,
            tags: model.tags,
            uploader: model.uploader,
        });

        table::add(&mut registry.models, blob_id, model);
    }

    public entry fun record_download(
        blob_id: String,
        ctx: &mut TxContext
    ) {
        event::emit(ModelDownloaded {
            blob_id,
            downloader: tx_context::sender(ctx),
        });
    }
}
