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
│   │   ├── upload/            # Model upload page with AI generation
│   │   └── model/             # Model detail page (query param routing)
│   ├── components/            # Reusable React components
│   ├── lib/
│   │   ├── contracts.ts       # Contract addresses (auto-generated)
│   │   ├── walrus.ts          # Walrus storage integration
│   │   ├── types.ts           # TypeScript type definitions
│   │   └── utils.ts           # Utility functions
│   ├── public/
│   │   └── ws-resources.json  # Walrus Sites routing config
│   ├── sites-config.yaml      # Walrus Sites testnet config
│   ├── sites-config-mainnet.yaml  # Walrus Sites mainnet config
│   └── package.json           # NPM scripts including deploy commands
├── deploy.sh                  # Smart contract deployment script
└── DEPLOYMENT.md              # Walrus Sites deployment guide
```

## 🌐 Live Site

**Deployed on Walrus Sites (Mainnet)**:
- 🔗 **Primary URL**: https://walrus-hub.wal.app
- 🔗 **Alternative URL**: https://3ydv4lw2dz9hlqsywlaj80zyu96p7ywhe4ncipfauv698hhn5b.walrus.site
- 📦 **SuiNS Name**: `walrus-hub.sui`
- 🆔 **Site Object ID**: `0x9eb048881748acad77c1e61485e0cc202e0ab7baac4427c86a2bd1dbebf9706f`

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ and npm
- Sui CLI installed and configured
- Sui wallet with SUI and WAL tokens
- Walrus CLI (for deployment)

### 1. Install Walrus CLI

**Testnet:**
```bash
curl -sSf https://install.wal.app | sh -s -- -n testnet
```

**Mainnet:**
```bash
curl -sSf https://install.wal.app | sh
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

### 3. Local Development

```bash
cd web
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to access the application.

### 4. Deploy to Walrus Sites

**Deploy to Mainnet:**
```bash
cd web
npm run deploy:mainnet
```

**Deploy to Testnet:**
```bash
cd web
npm run deploy:testnet
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions and SuiNS configuration.

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
- **`app/upload/page.tsx`**: Upload page with client-side AI metadata generation and confetti on success
- **`app/model/page.tsx`**: Model detail page with query parameter routing, download button and explorer links

### AI Metadata Generation

The AI metadata generation feature runs **client-side** using OpenAI-compatible APIs. Users can:

- Configure their own API keys via the settings panel
- Use default system configuration (GLM-4.5-Flash)
- Generate descriptions and tags with real-time streaming
- See typing effects as content is generated

This design ensures the feature works on static hosting platforms like Walrus Sites.

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

### ✅ Completed Features

- ✨ **Walrus Sites Deployment** - Fully decentralized hosting on Walrus with SuiNS integration
- 🤖 **AI-Powered Metadata Generation** - Client-side GLM-4.5-Flash integration with streaming
- ⛓️ **Blockchain Download Tracking** - Real-time statistics via Sui events
- 🎨 **Interactive UX** - Confetti animations, toast notifications, wallet persistence

### 🔮 Upcoming Features

#### 1. User Profile Center
- Personal dashboard for uploaded models
- User statistics and activity tracking
- Model management interface
- Download history and analytics

#### 2. Hugging Face Integration
- Import models directly from [Hugging Face](https://huggingface.co/)
- Sync model metadata and tags
- One-click deployment from Hugging Face to Walrus
- Cross-platform model discovery

#### 3. Custom Domain Support
- Bring-your-own-domain functionality
- SSL certificate management
- DNS configuration guides

Contributions and suggestions are always welcome!

## 📧 Support

- **Issues**: Report bugs or request features via [GitHub Issues](../../issues)
- **Discussions**: Join conversations in [GitHub Discussions](../../discussions)
- **Documentation**: Check [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment details

## 🙏 Acknowledgments

We would like to express our gratitude to the following individuals and communities for their support and contributions:

- **[Google Antigravity](https://antigravity.google/)、[Kiro](https://kiro.dev/)** - Advanced AI coding assistant that powered the development of this project
- **[SUI Chinese Community](https://x.com/SuiNetworkCN)** - For community support and ecosystem promotion
- **[HOH Water Molecule Community](https://x.com/0xHOH)** - For technical guidance and community engagement
- **[uvd](https://x.com/wangtxxl)** - For valuable insights and feedback

---

Built with ❤️ using Walrus, Sui, and Next.js
