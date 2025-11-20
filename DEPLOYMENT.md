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
