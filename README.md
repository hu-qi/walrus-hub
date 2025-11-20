# Walrus Model Hub

A decentralized AI model sharing platform built on Walrus storage and Sui blockchain.

[中文文档](./README.zh.md)

## Overview

Walrus Model Hub is a decentralized AI model hosting and sharing platform that combines:
- **Walrus**: Decentralized storage network for model files
- **Sui Blockchain**: For model metadata management and ownership tracking
- **Next.js**: Modern web frontend interface

## Project Structure

```
walrus/
├── walrus_model_hub/     # Sui Move smart contracts
│   ├── sources/          # Move source code
│   ├── tests/            # Contract tests
│   └── Move.toml         # Move project configuration
├── web/                  # Next.js frontend application
│   ├── app/              # Next.js app pages
│   ├── components/       # React components
│   ├── lib/              # Utility libraries
│   └── public/           # Static assets
├── init.md               # Walrus installation guide
└── test_walrus_endpoints.sh  # Walrus endpoint testing script
```

## Features

- ✅ **Model Upload**: Upload AI model files to Walrus decentralized storage
- ✅ **Metadata Management**: Record model information (name, description, tags, etc.) on Sui blockchain
- ✅ **Model Browsing**: View all uploaded models and their details
- ✅ **Wallet Integration**: Support Sui wallet connection with persistence
- ✅ **Real-time Updates**: Automatic model list refresh after upload
- ✅ **User-friendly Notifications**: Toast notifications instead of native alerts

## Quick Start

### 1. Install Walrus

```bash
curl -sSf https://install.wal.app | sh -s -- -n testnet
```

### 2. Deploy Smart Contract

```bash
cd walrus_model_hub
sui client publish --gas-budget 100000000
```

Note the Package ID and Registry Object ID after deployment.

### 3. Configure Frontend

Update contract configuration in `web/lib/config.ts`:

```typescript
export const CONTRACT_CONFIG = {
  packageId: "YOUR_PACKAGE_ID",
  registryId: "YOUR_REGISTRY_ID",
  network: "testnet"
};
```

### 4. Start Frontend Application

```bash
cd web
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

## Tech Stack

### Smart Contracts
- **Sui Move**: Smart contract development language
- **Sui Framework**: Sui blockchain framework

### Frontend
- **Next.js 16**: React framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling framework
- **@mysten/dapp-kit**: Sui wallet integration
- **@mysten/sui**: Sui SDK
- **React Query**: Data fetching and caching
- **React Hot Toast**: Notification component

## Development Guide

### Smart Contract Development

```bash
cd walrus_model_hub

# Build contract
sui move build

# Run tests
sui move test

# Publish contract
sui client publish --gas-budget 100000000
```

### Frontend Development

```bash
cd web

# Install dependencies
npm install

# Development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Configuration

### Walrus Configuration

Configure Walrus Publisher and Aggregator endpoints in the frontend application:

```typescript
const WALRUS_CONFIG = {
  publisher: "https://publisher.walrus-testnet.walrus.space",
  aggregator: "https://aggregator.walrus-testnet.walrus.space"
};
```

### Sui Network Configuration

Default uses Sui Testnet, can be modified in configuration files:

```typescript
const SUI_NETWORK = "testnet"; // or "mainnet", "devnet"
```

## Troubleshooting

### 1. Model Upload Failure

- Check if Walrus endpoints are available
- Verify file size doesn't exceed limits
- Ensure wallet has sufficient SUI tokens

### 2. Model List Not Updating

- Application has implemented automatic polling mechanism
- List will auto-refresh after successful upload

### 3. Wallet Connection Lost

- Application has implemented wallet persistence
- Will auto-reconnect after page refresh

## Contributing

Issues and Pull Requests are welcome!

1. Fork this repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Related Links

- [Walrus Official Site](https://walrus.site)
- [Sui Official Site](https://sui.io)
- [Sui Documentation](https://docs.sui.io)
- [Next.js Documentation](https://nextjs.org/docs)

## Contact

For questions or suggestions, please contact us through Issues.
