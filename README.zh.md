# Walrus Model Hub

一个基于 Walrus 去中心化存储和 Sui 区块链的 AI 模型共享平台。

## 项目简介

Walrus Model Hub 是一个去中心化的 AI 模型托管和共享平台,结合了:
- **Walrus**: 去中心化存储网络,用于存储模型文件
- **Sui 区块链**: 用于模型元数据管理和所有权追踪
- **Next.js**: 现代化的 Web 前端界面

## 项目结构

```
walrus/
├── walrus_model_hub/     # Sui Move 智能合约
│   ├── sources/          # Move 源代码
│   ├── tests/            # 合约测试
│   └── Move.toml         # Move 项目配置
├── web/                  # Next.js 前端应用
│   ├── app/              # Next.js 应用页面
│   ├── components/       # React 组件
│   ├── lib/              # 工具库
│   └── public/           # 静态资源
```

## 功能特性

- ✅ **模型上传**: 将 AI 模型文件上传到 Walrus 去中心化存储
- ✅ **元数据管理**: 在 Sui 区块链上记录模型信息(名称、描述、标签等)
- ✅ **模型浏览**: 查看所有已上传的模型及其详细信息
- ✅ **钱包集成**: 支持 Sui 钱包连接和持久化
- ✅ **实时更新**: 上传后自动刷新模型列表

## 快速开始

### 1. 安装 Walrus

```bash
curl -sSf https://install.wal.app | sh -s -- -n testnet
```

### 2. 部署智能合约

```bash
cd walrus_model_hub
sui client publish --gas-budget 100000000
```

记录部署后的 Package ID 和 Registry Object ID。

### 3. 配置前端

在 `web/lib/config.ts` 中更新合约配置:

```typescript
export const CONTRACT_CONFIG = {
  packageId: "YOUR_PACKAGE_ID",
  registryId: "YOUR_REGISTRY_ID",
  network: "testnet"
};
```

### 4. 启动前端应用

```bash
cd web
npm install
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 技术栈

### 智能合约
- **Sui Move**: 智能合约开发语言
- **Sui Framework**: Sui 区块链框架

### 前端
- **Next.js 16**: React 框架
- **TypeScript**: 类型安全
- **Tailwind CSS**: 样式框架
- **@mysten/dapp-kit**: Sui 钱包集成
- **@mysten/sui**: Sui SDK
- **React Query**: 数据获取和缓存
- **React Hot Toast**: 通知组件

## 开发指南

### 智能合约开发

```bash
cd walrus_model_hub

# 构建合约
sui move build

# 运行测试
sui move test

# 发布合约
sui client publish --gas-budget 100000000
```

### 前端开发

```bash
cd web

# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 代码检查
npm run lint
```

## 配置说明

### Walrus 配置

在前端应用中配置 Walrus Publisher 和 Aggregator 端点:

```typescript
const WALRUS_CONFIG = {
  publisher: "https://publisher.walrus-testnet.walrus.space",
  aggregator: "https://aggregator.walrus-testnet.walrus.space"
};
```

### Sui 网络配置

默认使用 Sui Testnet,可在配置文件中修改:

```typescript
const SUI_NETWORK = "testnet"; // 或 "mainnet", "devnet"
```

## 常见问题

### 1. 模型上传失败

- 检查 Walrus 端点是否可用
- 确认文件大小是否超过限制
- 验证钱包是否有足够的 SUI 代币

### 2. 模型列表不更新

- 应用已实现自动轮询机制
- 上传成功后会自动刷新列表

### 3. 钱包连接断开

- 应用已实现钱包持久化
- 刷新页面后会自动重连

## 贡献指南

欢迎提交 Issue 和 Pull Request!

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

本项目采用 MIT 许可证。

## 相关链接

- [Walrus 官网](https://walrus.site)
- [Sui 官网](https://sui.io)
- [Sui 文档](https://docs.sui.io)
- [Next.js 文档](https://nextjs.org/docs)

## 联系方式

如有问题或建议,请通过 Issue 联系我们。
