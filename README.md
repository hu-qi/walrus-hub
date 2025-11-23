# Walrus Model Hub

A decentralized AI model sharing platform built on Walrus storage and Sui blockchain, featuring AI-powered metadata generation and blockchain-verified download tracking.

[中文文档](./README.zh.md)

## Overview

Walrus Model Hub is a cutting-edge decentralized platform for hosting and sharing AI models, combining multiple advanced technologies:

- **Walrus**: Decentralized blob storage network for secure model file hosting
- **Sui Blockchain**: On-chain model registry and download tracking with event emission
- **Next.js 16**: Modern React-based web interface with server-side rendering
- **AI Integration**: GLM-4.5-Flash LLM for intelligent metadata generation

## ✨ Key Features

### 🤖 AI-Powered Metadata Generation
- **Smart Description**: Automatically generates detailed model descriptions using GLM-4.5-Flash
- **Intelligent Tagging**: AI suggests relevant tags based on model filename and content
- **Streaming Interface**: Real-time typing effect as metadata is generated
- **One-Click Enhancement**: Instantly improve your model documentation

### 📦 Decentralized Storage
- **Walrus Integration**: Store model files on decentralized blob storage
- **Permanent Access**: Models remain accessible via blob IDs
- **Network Resilience**: Distributed storage ensures high availability

### ⛓️ Blockchain-Verified Tracking
- **On-Chain Registry**: All models registered on Sui blockchain
- **Download Tracking**: Every download recorded as a blockchain transaction
- **Real-Time Statistics**: Live download counts updated from blockchain events
- **Ownership Proof**: Uploader addresses verified on-chain

### 🎨 Interactive User Experience
- **Confetti Animations**: Celebrate successful uploads and downloads
- **Toast Notifications**: Modern, non-intrusive user feedback
- **Wallet Persistence**: Stay connected across page refreshes
- **Auto-Refresh**: Model list updates automatically after uploads

### 🔗 Explorer Integration
- **Walruscan Links**: Direct access to blob details on Walruscan explorer
- **Suiscan Links**: View uploader addresses on Suiscan
- **Network-Aware URLs**: Automatically uses correct explorer for testnet/mainnet

## Project Structure

```
walrus/
├── walrus_model_hub/          # Sui Move smart contracts
│   ├── sources/
│   │   └── model_hub.move     # Core registry contract
│   ├── tests/                 # Contract test suite
│   └── Move.toml              # Move package configuration
├── web/                       # Next.js frontend application
│   ├── app/
│   │   ├── page.tsx           # Home page with model listing
│   │   ├── upload/            # Model upload page
│   │   ├── model/[blobId]/    # Model detail page
│   │   └── api/
│   │       └── generate-metadata/  # AI metadata generation endpoint
│   ├── components/            # Reusable React components
│   ├── lib/
│   │   ├── contracts.ts       # Contract addresses (auto-generated)
│   │   ├── walrus.ts          # Walrus storage integration
│   │   ├── types.ts           # TypeScript type definitions
│   │   └── utils.ts           # Utility functions
│   └── public/                # Static assets (logos, icons)
├── deploy.sh                  # Automated deployment script
└── DEPLOYMENT.md              # Deployment guide
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ and npm
- Sui CLI installed and configured
- Sui wallet with testnet SUI tokens
- OpenAI-compatible API access (for metadata generation)

### 1. Install Walrus CLI

```bash
curl -sSf https://install.wal.app | sh -s -- -n testnet
```

### 2. Deploy Smart Contract

Using the automated deployment script:

```bash
./deploy.sh
```

Or manually:

```bash
cd walrus_model_hub
sui client publish --gas-budget 100000000
```

The script will automatically update `web/lib/contracts.ts` with the new contract addresses.

### 3. Configure Environment Variables

Create a `.env.local` file in the `web/` directory:

```bash
# AI Metadata Generation (GLM-4.5-Flash via OpenAI SDK)
OPENAI_API_KEY=your_api_key_here
OPENAI_BASE_URL=https://open.bigmodel.cn/api/paas/v4/
```

> **Note**: The project uses GLM-4.5-Flash through the OpenAI-compatible API. You can obtain an API key from [Zhipu AI](https://open.bigmodel.cn/).

### 4. Start the Application

```bash
cd web
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to access the application.

## 🌐 Walrus Sites Deployment

The application is fully compatible with [Walrus Sites](https://docs.wal.app/walrus-sites/intro.html) - a decentralized static site hosting platform.

### Prerequisites

- Sui CLI installed and configured
- Sufficient SUI tokens for gas fees
- Walrus CLI installed
- site-builder tool installed

### Install site-builder

```bash
cargo install --git https://github.com/MystenLabs/walrus-sites site-builder
```

### Deploy to Walrus Sites

1. **Build the static site:**

```bash
cd web
npm run build
```

This creates a static export in the `web/out/` directory.

2. **Deploy using site-builder:**

```bash
site-builder publish web/out/
```

Or use the automated deployment script:

```bash
./deploy-walrus-site.sh
```

3. **Access your site:**

After deployment, you'll receive a Walrus Sites URL like:
```
https://<site-id>.wal.app
```

### Important Notes for Walrus Sites

- **No Server-Side Code**: The app runs entirely in the browser
- **User API Keys Required**: Users must provide their own LLM API keys for AI metadata generation
- **Client-Side Routing**: All routing and data fetching happens in the browser
- **Decentralized**: No backend servers required - fully decentralized!

### Configuring LLM API Key

Since Walrus Sites is a static hosting platform, users need to configure their own LLM API key:

1. Click the settings icon (⚙️) on the upload page
2. Enter your LLM configuration:
   - **API Key** (required): Your OpenAI-compatible API key
   - **Base URL** (optional): Default is `https://api.openai.com/v1`
   - **Model** (optional): Default is `gpt-3.5-turbo`
3. Click "Save & Close"

Your API key is stored locally in your browser and never sent to any server.

### Supported LLM Providers

The following providers support CORS and work with browser-based requests:

- OpenAI (GPT-3.5, GPT-4)
- Anthropic Claude
- GLM (Zhipu AI)
- Any OpenAI-compatible API with CORS enabled

## 🛠️ Tech Stack

### Smart Contracts
- **Sui Move**: Type-safe smart contract language
- **Sui Framework**: Core blockchain primitives and utilities

### Frontend
- **Next.js 16**: React framework with App Router
- **React 19**: Latest React features
- **TypeScript**: Full type safety
- **Tailwind CSS 4**: Utility-first styling

### Blockchain Integration
- **@mysten/dapp-kit**: Sui wallet connection and hooks
- **@mysten/sui**: Sui SDK for transactions and queries
- **@tanstack/react-query**: Efficient data fetching and caching

### AI & UX
- **OpenAI SDK**: LLM integration for metadata generation
- **canvas-confetti**: Celebration animations
- **react-hot-toast**: Toast notifications

## 📚 Development Guide

### Smart Contract Development

```bash
cd walrus_model_hub

# Build the contract
sui move build

# Run tests
sui move test

# Publish to testnet
sui client publish --gas-budget 100000000

# Publish to devnet
sui client publish --gas-budget 100000000 --network devnet
```

#### Contract Structure

The `model_hub.move` contract provides:

- **Registry Object**: Shared object storing all model metadata
- **Model Struct**: Stores name, description, blob_id, uploader, tags
- **Events**:
  - `ModelRegistered`: Emitted when a new model is uploaded
  - `ModelDownloaded`: Emitted when a model is downloaded

### Frontend Development

```bash
cd web

# Install dependencies
npm install

# Development mode with hot reload
npm run dev

# Type checking
npx tsc --noEmit

# Linting
npm run lint

# Production build
npm run build

# Start production server
npm start
```

#### Key Pages & Components

- **`app/page.tsx`**: Home page with searchable model gallery, pagination, download tracking
- **`app/upload/page.tsx`**: Upload page with AI metadata generation and confetti on success
- **`app/model/[blobId]/page.tsx`**: Model detail page with download button and explorer links
- **`app/api/generate-metadata/route.ts`**: Streaming API for AI-powered metadata generation

### API Endpoints

#### POST `/api/generate-metadata`

Generates model description and tags using AI.

**Request Body:**
```json
{
  "fileName": "llama-2-7b.gguf"
}
```

**Response:** Server-Sent Events (SSE) stream
```
data: {"description":"Partial description...","tags":["tag1"]}
data: {"description":"Complete description","tags":["tag1","tag2","tag3"]}
data: [DONE]
```

## ⚙️ Configuration

### Walrus Endpoints

The application uses the following Walrus testnet endpoints (configured in `web/lib/walrus.ts`):

```typescript
const WALRUS_CONFIG = {
  publisher: "https://publisher.walrus-testnet.walrus.space",
  aggregator: "https://aggregator.walrus-testnet.walrus.space"
};
```

### Network Configuration

Update the Sui network in wallet connection (`web/app/providers.tsx`):

```typescript
const networks = {
  testnet: { url: getFullnodeUrl('testnet') },
  mainnet: { url: getFullnodeUrl('mainnet') },
  devnet: { url: getFullnodeUrl('devnet') }
};
```

## 🔧 Troubleshooting

### Model Upload Fails

**Symptoms**: Upload button shows error or transaction fails

**Solutions**:
- Verify Walrus endpoints are accessible
- Check file size is under blob storage limits
- Ensure wallet has sufficient SUI for gas fees
- Confirm model with same blob_id doesn't already exist

### Metadata Generation Not Working

**Symptoms**: "Generate with AI" button doesn't produce results

**Solutions**:
- Verify `OPENAI_API_KEY` is set in `.env.local`
- Check `OPENAI_BASE_URL` points to GLM API endpoint
- Ensure API key has sufficient quota
- Check browser console for API errors

### Download Count Not Updating

**Symptoms**: Download statistics remain at 0

**Solutions**:
- Download tracking requires a wallet connection
- Each download records an on-chain transaction
- Wait a few seconds for blockchain confirmation
- Check that `record_download` transaction succeeded

### Wallet Disconnects on Refresh

**Symptoms**: Wallet connection lost after page reload

**Solutions**:
- Enable "auto-connect" in your Sui wallet settings
- The app implements wallet persistence via dapp-kit
- Clear browser cache if persistence fails

## 🎯 Usage Guide

### Uploading a Model

1. **Connect Wallet**: Click "Connect Wallet" and approve the connection
2. **Navigate to Upload**: Click "Upload Model" or go to `/upload`
3. **Fill Basic Info**: Enter model name
4. **Select File**: Choose your model file (any format supported)
5. **Generate Metadata** (Optional): Click "Generate with AI" for auto-description and tags
6. **Customize**: Edit AI-generated content or add your own
7. **Upload**: Click "Upload to Walrus" and approve transactions
8. **Celebrate**: Enjoy the confetti! 🎉

### Browsing Models

- **Search**: Use the search bar to filter by model name
- **Pagination**: Navigate through pages of models
- **View Details**: Click any model card to see full information
- **Download**: Click "Download Model Weights" to get the file
- **Explore**: Click blob ID or uploader address to view on explorers

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit with clear messages: `git commit -m 'Add amazing feature'`
5. Push to your fork: `git push origin feature/amazing-feature`
6. Open a Pull Request with a detailed description

### Development Guidelines

- Follow TypeScript best practices
- Maintain consistent code style (use ESLint)
- Add tests for smart contract changes
- Update documentation for new features
- Test on testnet before submitting PR

## 📄 License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) for details.

## 🔗 Related Resources

- [Walrus Documentation](https://docs.walrus.site)
- [Sui Documentation](https://docs.sui.io)
- [Walruscan Explorer (Testnet)](https://testnet.walruscan.com)
- [Suiscan Explorer (Testnet)](https://testnet.suiscan.xyz)
- [Next.js Documentation](https://nextjs.org/docs)
- [Sui dApp Kit](https://sdk.mystenlabs.com/dapp-kit)

## 🚀 Roadmap

We have exciting features planned for future releases:

### 1. Walrus Site Deployment
- Deploy the application as a decentralized website on [Walrus Sites](https://docs.walrus.site/walrus-sites/intro.html)
- Enable fully decentralized hosting with censorship resistance
- Integration with [SuiNS](https://suins.io/) for human-readable domain names

### 2. User Profile Center
- Personal dashboard for uploaded models
- User statistics and activity tracking
- Model management interface
- Download history and analytics

### 3. Hugging Face Integration
- Import models directly from [Hugging Face](https://huggingface.co/)
- Sync model metadata and tags
- One-click deployment from Hugging Face to Walrus
- Cross-platform model discovery

Stay tuned for updates! Contributions and suggestions are welcome.

## 📧 Support

- **Issues**: Report bugs or request features via [GitHub Issues](../../issues)
- **Discussions**: Join conversations in [GitHub Discussions](../../discussions)
- **Documentation**: Check [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment details

---

Built with ❤️ using Walrus, Sui, and Next.js
