# Walrus Model Hub

一个基于 Walrus 去中心化存储和 Sui 区块链构建的 AI 模型共享平台，具备 AI 驱动的元数据生成和区块链验证的下载追踪功能。

[English Documentation](./README.md)

## 项目简介

Walrus Model Hub 是一个前沿的去中心化 AI 模型托管和共享平台，融合了多项先进技术：

- **Walrus**：去中心化 Blob 存储网络，用于安全的模型文件托管
- **Sui 区块链**：链上模型注册表和下载追踪，支持事件发射
- **Next.js 16**：现代化的 React 网页界面，支持服务端渲染
- **AI 集成**：使用 GLM-4.5-Flash 大语言模型实现智能元数据生成

## ✨ 核心功能

### 🤖 AI 驱动的元数据生成
- **智能描述**：使用 GLM-4.5-Flash 自动生成详细的模型描述
- **智能标签**：AI 根据模型文件名和内容建议相关标签
- **流式界面**：元数据生成时的实时打字效果
- **一键增强**：即刻提升您的模型文档质量

### 📦 去中心化存储
- **Walrus 集成**：在去中心化 Blob 存储上存储模型文件
- **永久访问**：通过 Blob ID 持续访问模型
- **网络弹性**：分布式存储确保高可用性

### ⛓️ 区块链验证追踪
- **链上注册表**：所有模型在 Sui 区块链上注册
- **下载追踪**：每次下载都记录为区块链交易
- **实时统计**：从区块链事件实时更新下载计数
- **所有权证明**：上传者地址在链上验证

### 🎨 交互式用户体验
- **烟花动画**：庆祝成功上传和下载
- **Toast 通知**：现代化、非侵入式的用户反馈
- **钱包持久化**：页面刷新后保持连接
- **自动刷新**：上传后模型列表自动更新

### 🔗 浏览器集成
- **Walruscan 链接**：直接访问 Walruscan 浏览器上的 Blob 详情
- **Suiscan 链接**：在 Suiscan 上查看上传者地址
- **网络感知 URL**：自动为测试网/主网使用正确的浏览器

## 项目结构

```
walrus/
├── walrus_model_hub/          # Sui Move 智能合约
│   ├── sources/
│   │   └── model_hub.move     # 核心注册表合约
│   ├── tests/                 # 合约测试套件
│   └── Move.toml              # Move 包配置
├── web/                       # Next.js 前端应用
│   ├── app/
│   │   ├── page.tsx           # 主页及模型列表
│   │   ├── upload/            # 模型上传页面（含 AI 生成）
│   │   └── model/             # 模型详情页面（查询参数路由）
│   ├── components/            # 可复用 React 组件
│   ├── lib/
│   │   ├── contracts.ts       # 合约地址（自动生成）
│   │   ├── walrus.ts          # Walrus 存储集成
│   │   ├── types.ts           # TypeScript 类型定义
│   │   └── utils.ts           # 工具函数
│   ├── public/
│   │   └── ws-resources.json  # Walrus Sites 路由配置
│   ├── sites-config.yaml      # Walrus Sites 测试网配置
│   ├── sites-config-mainnet.yaml  # Walrus Sites 主网配置
│   └── package.json           # NPM 脚本（包括部署命令）
├── deploy.sh                  # 智能合约部署脚本
└── DEPLOYMENT.md              # Walrus Sites 部署指南
```

## 🌐 在线访问

**已部署至 Walrus Sites 主网**：
- 🔗 **主要 URL**: https://walrus-hub.wal.app
- 🔗 **备用 URL**: https://3ydv4lw2dz9hlqsywlaj80zyu96p7ywhe4ncipfauv698hhn5b.walrus.site
- 📦 **SuiNS 域名**: `walrus-hub.sui`
- 🆔 **Site Object ID**: `0x9eb048881748acad77c1e61485e0cc202e0ab7baac4427c86a2bd1dbebf9706f`

## 🚀 快速开始

### 前置要求

- Node.js 20+ 和 npm
- 已安装并配置 Sui CLI
- 拥有 SUI 和 WAL 代币的 Sui 钱包
- Walrus CLI（用于部署）

### 1. 安装 Walrus CLI

**测试网：**
```bash
curl -sSf https://install.wal.app | sh -s -- -n testnet
```

**主网：**
```bash
curl -sSf https://install.wal.app | sh
```

### 2. 部署智能合约

使用自动化部署脚本：

```bash
./deploy.sh
```

或手动部署：

```bash
cd walrus_model_hub
sui client publish --gas-budget 100000000
```

脚本会自动更新 `web/lib/contracts.ts` 中的新合约地址。

### 3. 本地开发

```bash
cd web
npm install
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 以使用应用。

### 4. 部署到 Walrus Sites

**部署到主网：**
```bash
cd web
npm run deploy:mainnet
```

**部署到测试网：**
```bash
cd web
npm run deploy:testnet
```

详细的部署说明和 SuiNS 配置请查看 [DEPLOYMENT.md](./DEPLOYMENT.md)。

## 🛠️ 技术栈

### 智能合约
- **Sui Move**：类型安全的智能合约语言
- **Sui Framework**：核心区块链原语和工具

### 前端
- **Next.js 16**：React 框架，支持 App Router
- **React 19**：最新的 React 特性
- **TypeScript**：完整的类型安全
- **Tailwind CSS 4**：实用优先的样式框架

### 区块链集成
- **@mysten/dapp-kit**：Sui 钱包连接和 hooks
- **@mysten/sui**：Sui SDK，用于交易和查询
- **@tanstack/react-query**：高效的数据获取和缓存

### AI 与用户体验
- **OpenAI SDK**：用于元数据生成的 LLM 集成
- **canvas-confetti**：庆祝动画
- **react-hot-toast**：Toast 通知

## 📚 开发指南

### 智能合约开发

```bash
cd walrus_model_hub

# 构建合约
sui move build

# 运行测试
sui move test

# 发布到测试网
sui client publish --gas-budget 100000000

# 发布到开发网
sui client publish --gas-budget 100000000 --network devnet
```

#### 合约结构

`model_hub.move` 合约提供：

- **Registry 对象**：存储所有模型元数据的共享对象
- **Model 结构体**：存储名称、描述、blob_id、上传者、标签
- **事件**：
  - `ModelRegistered`：上传新模型时发射
  - `ModelDownloaded`：下载模型时发射

### 前端开发

```bash
cd web

# 安装依赖
npm install

# 开发模式（热重载）
npm run dev

# 类型检查
npx tsc --noEmit

# 代码检查
npm run lint

# 生产构建
npm run build

# 启动生产服务器
npm start
```

#### 关键页面与组件

- **`app/page.tsx`**：主页，包含可搜索的模型画廊、分页、下载追踪
- **`app/upload/page.tsx`**：上传页面，支持客户端 AI 元数据生成和成功时的烟花动画
- **`app/model/page.tsx`**：模型详情页面，采用查询参数路由，包含下载按钮和浏览器链接

### AI 元数据生成

AI 元数据生成功能在**客户端**运行，使用 OpenAI 兼容的 API。用户可以：

- 通过设置面板配置自己的 API 密钥
- 使用默认系统配置（GLM-4.5-Flash）
- 以实时流式方式生成描述和标签
- 观看内容生成的打字效果

这种设计确保功能可在 Walrus Sites 等静态托管平台上运行。

## ⚙️ 配置

### Walrus 端点

应用使用以下 Walrus 测试网端点（在 `web/lib/walrus.ts` 中配置）：

```typescript
const WALRUS_CONFIG = {
  publisher: "https://publisher.walrus-testnet.walrus.space",
  aggregator: "https://aggregator.walrus-testnet.walrus.space"
};
```

### 网络配置

在钱包连接中更新 Sui 网络（`web/app/providers.tsx`）：

```typescript
const networks = {
  testnet: { url: getFullnodeUrl('testnet') },
  mainnet: { url: getFullnodeUrl('mainnet') },
  devnet: { url: getFullnodeUrl('devnet') }
};
```

## 🔧 故障排除

### 模型上传失败

**症状**：上传按钮显示错误或交易失败

**解决方案**：
- 验证 Walrus 端点可访问
- 检查文件大小是否低于 Blob 存储限制
- 确保钱包有足够的 SUI 支付 gas 费用
- 确认相同 blob_id 的模型尚不存在

### 元数据生成不工作

**症状**："使用 AI 生成" 按钮无结果

**解决方案**：
- 验证 `.env.local` 中已设置 `OPENAI_API_KEY`
- 检查 `OPENAI_BASE_URL` 指向 GLM API 端点
- 确保 API 密钥有足够的配额
- 检查浏览器控制台是否有 API 错误

### 下载计数未更新

**症状**：下载统计保持为 0

**解决方案**：
- 下载追踪需要钱包连接
- 每次下载都记录一个链上交易
- 等待几秒钟以确认区块链交易
- 检查 `record_download` 交易是否成功

### 刷新时钱包断开连接

**症状**：页面重新加载后钱包连接丢失

**解决方案**：
- 在 Sui 钱包设置中启用"自动连接"
- 应用通过 dapp-kit 实现钱包持久化
- 如果持久化失败，清除浏览器缓存

## 🎯 使用指南

### 上传模型

1. **连接钱包**：点击"连接钱包"并批准连接
2. **导航到上传**：点击"上传模型"或访问 `/upload`
3. **填写基本信息**：输入模型名称
4. **选择文件**：选择您的模型文件（支持任何格式）
5. **生成元数据**（可选）：点击"使用 AI 生成"自动生成描述和标签
6. **自定义**：编辑 AI 生成的内容或添加您自己的内容
7. **上传**：点击"上传到 Walrus"并批准交易
8. **庆祝**：享受烟花吧！🎉

### 浏览模型

- **搜索**：使用搜索栏按模型名称过滤
- **分页**：浏览模型页面
- **查看详情**：点击任何模型卡片查看完整信息
- **下载**：点击"下载模型权重"获取文件
- **浏览**：点击 Blob ID 或上传者地址在浏览器上查看

## 🤝 贡献指南

我们欢迎贡献！请遵循以下步骤：

1. Fork 此仓库
2. 创建特性分支：`git checkout -b feature/amazing-feature`
3. 进行更改并全面测试
4. 使用清晰的信息提交：`git commit -m 'Add amazing feature'`
5. 推送到您的 fork：`git push origin feature/amazing-feature`
6. 打开 Pull Request 并提供详细描述

### 开发准则

- 遵循 TypeScript 最佳实践
- 保持一致的代码风格（使用 ESLint）
- 为智能合约更改添加测试
- 为新功能更新文档
- 在提交 PR 前在测试网上测试

## 📄 许可证

本项目采用 MIT 许可证。详见 [LICENSE](./LICENSE)。

## 🔗 相关资源

- [Walrus 文档](https://docs.walrus.site)
- [Sui 文档](https://docs.sui.io)
- [Walruscan 浏览器（测试网）](https://testnet.walruscan.com)
- [Suiscan 浏览器（测试网）](https://testnet.suiscan.xyz)
- [Next.js 文档](https://nextjs.org/docs)
- [Sui dApp Kit](https://sdk.mystenlabs.com/dapp-kit)

## 🚀 路线图

### ✅ 已完成功能

- ✨ **Walrus Sites 部署** - 在 Walrus 上完全去中心化托管，集成 SuiNS
- 🤖 **AI 驱动的元数据生成** - 客户端 GLM-4.5-Flash 集成，支持流式传输
- ⛓️ **区块链下载追踪** - 通过 Sui 事件实现实时统计
- 🎨 **交互式用户体验** - 烟花动画、Toast 通知、钱包持久化

### 🔮 即将推出

#### 1. 个人中心
- 已上传模型的个人控制面板
- 用户统计和活动追踪
- 模型管理界面
- 下载历史和分析

#### 2. Hugging Face 对接
- 直接从 [Hugging Face](https://huggingface.co/) 导入模型
- 同步模型元数据和标签
- 一键从 Hugging Face 部署到 Walrus
- 跨平台模型发现

#### 3. 自定义域名支持
- 自带域名功能
- SSL 证书管理
- DNS 配置指南

欢迎贡献和建议！

## 📧 支持

- **问题反馈**：通过 [GitHub Issues](../../issues) 报告 bug 或请求功能
- **讨论**：在 [GitHub Discussions](../../discussions) 中加入对话
- **文档**：查看 [DEPLOYMENT.md](./DEPLOYMENT.md) 了解部署详情

## 🙏 致谢

我们要感谢以下个人和社区对本项目的支持和贡献：

- **[Google Antigravity](https://antigravity.google/)、[Kiro](https://kiro.dev/)**  - 驱动本项目开发的先进 AI 编程助手
- **[SUI 中文社区](https://x.com/SuiNetworkCN)** - 提供社区支持和生态推广
- **[HOH 水分子社区](https://x.com/0xHOH)** - 提供技术指导和社区参与
- **[uvd](https://x.com/wangtxxl)** - 提供宝贵的见解和反馈

---

使用 Walrus、Sui 和 Next.js 用 ❤️ 构建
