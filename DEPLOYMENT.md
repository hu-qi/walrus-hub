# 合约部署指南

## 使用自动化部署脚本

我们提供了一个自动化脚本 `deploy.sh` 来简化合约部署和配置更新流程。

### 基本用法

**默认模式**（推荐）- 部署合约并自动重启前端：
```bash
./deploy.sh
```

### 高级选项

脚本支持多种部署模式，每个选项都有简短形式：

```bash
# 查看帮助信息
./deploy.sh --help    # 或 -h

# 只部署合约（不重启前端）
./deploy.sh --contract-only    # 或 -c

# 只重启前端服务器（不部署合约）
./deploy.sh --frontend-only    # 或 -f

# 部署合约但跳过前端重启
./deploy.sh --skip-frontend    # 或 -s
```

### 使用场景

**场景 1：首次部署或更新合约**
```bash
./deploy.sh
```
✅ 自动完成：构建合约 → 部署 → 更新配置 → 重启前端

**场景 2：只修改了前端代码**
```bash
./deploy.sh -f    # 快捷方式
```
✅ 快速重启 Next.js 服务器

**场景 3：需要手动重启前端**
```bash
./deploy.sh -c    # 快捷方式
# 然后手动处理前端
```

### 脚本功能

这个脚本会自动完成以下操作：

1. ✅ **构建合约** - 编译 Move 智能合约
2. ✅ **部署合约** - 将合约发布到 Sui 区块链
3. ✅ **提取地址** - 自动获取 `PACKAGE_ID` 和 `REGISTRY_ID`
4. ✅ **更新配置** - 自动更新 `web/lib/contracts.ts`
5. ✅ **备份原配置** - 保存旧配置到 `.backup` 文件
6. ✅ **重启前端** - 自动停止旧服务器并启动新实例（默认启用）

### 前置条件

- 已安装 Sui CLI
- 已配置 Sui 钱包
- 钱包中有足够的 SUI 代币支付 gas 费

### 脚本输出示例

```
📦 Walrus Model Hub - Contract Deployment Script
================================================

🔨 Building contract...
✅ Contract built successfully

🚀 Deploying contract to Sui blockchain...
⚠️  This will require gas fees. Please approve the transaction in your wallet.

✅ Contract deployed successfully

📝 Extracting contract addresses...
✅ PACKAGE_ID: 0x...
✅ REGISTRY_ID: 0x...

🔧 Updating frontend configuration...
✅ Configuration updated in web/lib/contracts.ts
📄 Backup saved as web/lib/contracts.ts.backup

================================================
✨ Deployment Complete!
================================================

Contract Addresses:
  PACKAGE_ID:  0x...
  REGISTRY_ID: 0x...

Configuration file updated: web/lib/contracts.ts

📌 Next Steps:
  1. Restart your Next.js development server (Ctrl+C and npm run dev)
  2. Test the download tracking feature
  3. Verify download counts update correctly

💡 Tip: The old contract addresses are backed up in web/lib/contracts.ts.backup
```

### 部署后步骤

1. **重启开发服务器**
   ```bash
   cd web
   npm run dev
   ```

2. **测试下载跟踪**
   - 连接钱包
   - 点击模型的下载按钮
   - 批准交易
   - 验证下载计数增加

### 故障排除

**问题：脚本提示 "sui CLI is not installed"**
- 解决：安装 Sui CLI: https://docs.sui.io/guides/developer/getting-started/sui-install

**问题：部署失败，gas 不足**
- 解决：从测试网水龙头获取更多 SUI: https://discord.com/invite/sui

**问题：无法提取 REGISTRY_ID**
- 解决：手动从部署输出中查找 Registry 对象的 ObjectId
- 手动更新 `web/lib/contracts.ts` 中的 `REGISTRY_ID`

**问题：需要恢复旧配置**
- 解决：从备份文件恢复
  ```bash
  cp web/lib/contracts.ts.backup web/lib/contracts.ts
  ```

## 手动部署（如果脚本不工作）

### 1. 构建合约
```bash
cd walrus_model_hub
sui move build
```

### 2. 部署合约
```bash
sui client publish --gas-budget 100000000
```

### 3. 提取地址

从部署输出中找到：
- `PACKAGE_ID`: `Published Objects` 部分的包 ID
- `REGISTRY_ID`: `Created Objects` 中类型为 `Registry` 的对象 ID

### 4. 更新配置

编辑 `web/lib/contracts.ts`:
```typescript
export const PACKAGE_ID = "0xYOUR_PACKAGE_ID";
export const REGISTRY_ID = "0xYOUR_REGISTRY_ID";
export const MODULE_NAME = "model_hub";
```

### 5. 重启服务器
```bash
cd ../web
npm run dev
```


---

# Walrus Sites 静态部署指南

## 概述

Walrus Sites 是一个去中心化的静态网站托管平台。本项目已完全支持静态导出，可以部署到 Walrus Sites。

## 架构变更

### 从混合模式到纯静态

**之前（混合模式）：**
- Next.js SSR + API Routes
- 服务器端 AI 元数据生成
- 硬编码的默认 API Key

**现在（纯静态）：**
- Next.js 静态导出
- 客户端直接调用 LLM API
- 用户提供自己的 API Key

## 部署步骤

### 1. 安装依赖

确保已安装以下工具：

```bash
# Sui CLI
curl -fsSL https://sui.io/install.sh | sh

# Walrus CLI
curl -sSf https://install.wal.app | sh -s -- -n testnet

# site-builder
cargo install --git https://github.com/MystenLabs/walrus-sites site-builder
```

### 2. 构建静态站点

```bash
cd web
npm install
npm run build
```

这会在 `web/out/` 目录生成静态文件。

### 3. 验证构建输出

```bash
# 检查输出目录
ls -la web/out/

# 本地预览
npx serve web/out
```

访问 http://localhost:3000 测试静态站点。

### 4. 部署到 Walrus Sites

使用 site-builder 工具：

```bash
site-builder publish web/out/
```

或使用自动化脚本：

```bash
./deploy-walrus-site.sh
```

### 5. 配置 SuiNS（可选）

为你的站点配置人类可读的域名：

```bash
# 将 SuiNS 名称指向 Walrus Site 对象
sui client call \
  --package <suins-package> \
  --module suins \
  --function set_target_address \
  --args <your-name> <site-object-id>
```

## 用户配置指南

### 配置 LLM API Key

由于 Walrus Sites 是纯静态托管，用户需要配置自己的 LLM API Key：

1. **打开高级设置**
   - 在上传页面点击设置图标（⚙️）

2. **输入配置**
   - **API Key**（必需）：你的 LLM API Key
   - **Base URL**（可选）：默认 `https://api.openai.com/v1`
   - **Model**（可选）：默认 `gpt-3.5-turbo`

3. **保存配置**
   - 点击 "Save & Close"
   - 配置保存在浏览器 localStorage 中

### 支持的 LLM 提供商

以下提供商支持 CORS，可在浏览器中直接调用：

| 提供商 | Base URL | 模型示例 |
|--------|----------|----------|
| OpenAI | `https://api.openai.com/v1` | `gpt-3.5-turbo`, `gpt-4` |
| Anthropic | `https://api.anthropic.com` | `claude-3-5-sonnet-20241022` |
| GLM (智谱) | `https://open.bigmodel.cn/api/paas/v4/` | `glm-4` |

## 技术细节

### 静态导出配置

`web/next.config.ts`:
```typescript
const nextConfig: NextConfig = {
  output: 'export',  // 启用静态导出
  images: {
    unoptimized: true,  // 禁用图片优化
  },
};
```

### 客户端 LLM 调用

`web/lib/llm-client.ts`:
```typescript
const client = new OpenAI({
  apiKey: llmConfig.apiKey,
  baseURL: llmConfig.baseURL,
  dangerouslyAllowBrowser: true,  // 允许浏览器调用
});
```

### 配置持久化

`web/lib/llm-config.ts`:
```typescript
// 保存到 localStorage
LLMConfigManager.saveConfig(config);

// 从 localStorage 加载
const config = LLMConfigManager.loadConfig();
```

## 常见问题

### Q: 为什么需要用户提供 API Key？

**A:** Walrus Sites 是纯静态托管，无法运行服务器端代码。为了安全和去中心化，我们让用户使用自己的 API Key，这样：
- 不会泄露开发者的 API Key
- 用户完全控制自己的 API 使用
- 符合 Web3 去中心化精神

### Q: API Key 安全吗？

**A:** 是的，API Key 仅存储在用户浏览器的 localStorage 中，不会发送到任何服务器。所有 LLM API 调用都是从浏览器直接发送到 LLM 提供商。

### Q: 动态路由如何工作？

**A:** 我们使用客户端路由。虽然 `/model/[blobId]` 是动态路由，但所有数据获取都在客户端通过 Sui RPC 完成。

### Q: 如何更新已部署的站点？

**A:** 重新构建并部署：
```bash
cd web
npm run build
site-builder publish out/
```

### Q: CORS 错误怎么办？

**A:** 确保使用支持 CORS 的 LLM 提供商。如果提供商不支持浏览器直接调用，可以：
1. 使用支持 CORS 的替代提供商
2. 部署自己的 CORS 代理（不推荐，失去去中心化优势）

## 测试

运行测试以验证静态导出：

```bash
cd web
npm run test
```

所有测试应该通过，包括：
- LLM 配置管理测试
- LLM 客户端测试
- 上传页面测试
- 构建输出验证测试

## 性能优化

### 1. 代码分割

Next.js 自动进行代码分割，确保只加载必要的代码。

### 2. 资源压缩

构建时自动压缩 JavaScript 和 CSS。

### 3. Walrus 网络优化

使用多个 aggregator 端点实现故障转移：

```typescript
export const WALRUS_AGGREGATORS = [
  "https://aggregator.walrus-testnet.walrus.space",
  "https://sui-walrus-tn-aggregator.bwarelabs.com",
  // ... 更多端点
];
```

## 监控和调试

### 查看构建输出

```bash
ls -la web/out/
```

应该看到：
- `index.html` - 主页
- `upload.html` - 上传页面
- `model/_placeholder.html` - 模型详情页占位符
- `_next/` - Next.js 资源
- 其他静态资源

### 本地测试

```bash
npx serve web/out
```

在浏览器中测试所有功能：
- ✅ 浏览模型列表
- ✅ 搜索模型
- ✅ 连接钱包
- ✅ 上传模型
- ✅ 配置 LLM API Key
- ✅ 生成 AI 元数据
- ✅ 下载模型

## 参考资源

- [Walrus Sites 文档](https://docs.wal.app/walrus-sites/intro.html)
- [Next.js 静态导出](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [Sui 文档](https://docs.sui.io)
- [site-builder GitHub](https://github.com/MystenLabs/walrus-sites)
