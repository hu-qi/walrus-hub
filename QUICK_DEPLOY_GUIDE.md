# 🚀 快速部署指南 - Walrus Sites (Testnet)

## 问题：Walrus 配置文件

当前遇到的问题是 `walrus` 命令找不到有效的配置文件。

## 解决方案

### 方法 1: 从官方获取配置文件（推荐）

1. **访问 Walrus 官方文档**
   https://docs.wal.app/usage/setup.html#configuration

2. **下载官方配置文件**
   ```bash
   # 创建配置目录
   mkdir -p ~/.config/walrus
   
   # 下载官方 testnet 配置
   curl -o ~/.config/walrus/client_config.yaml \
     https://docs.wal.app/configs/client_config_testnet.yaml
   ```

3. **验证配置**
   ```bash
   walrus info
   ```
   
   如果成功，你会看到 Walrus 网络信息。

4. **部署站点**
   ```bash
   cd web
   site-builder-testnet publish --epochs 100 --site-name "walrus-model-hub" out/
   ```

### 方法 2: 手动创建配置文件

如果上面的下载链接不工作，手动创建配置文件：

```bash
mkdir -p ~/.config/walrus
cat > ~/.config/walrus/client_config.yaml << 'EOF'
# 从 https://docs.wal.app 获取最新的配置值
contexts:
  testnet:
    system_object: "0x..." # 从官方文档获取
    communication_config: "0x..." # 从官方文档获取
    
default_context: testnet
EOF
```

### 方法 3: 使用环境变量（临时方案）

如果配置文件一直有问题，可以尝试：

```bash
# 设置 Walrus 配置路径
export WALRUS_CONFIG=~/.config/walrus/client_config.yaml

# 或者在当前目录创建配置
cp ~/.config/walrus/client_config.yaml ./client_config.yaml

# 然后部署
cd web
site-builder-testnet publish --epochs 100 --site-name "walrus-model-hub" out/
```

## 完整部署流程

一旦 Walrus 配置正确，按以下步骤部署：

### 1. 确认环境

```bash
# 检查 Sui 钱包
sui client active-address
sui client gas

# 检查 Walrus
walrus info

# 检查 site-builder
site-builder-testnet --version
```

### 2. 构建站点

```bash
cd web
npm run build
```

### 3. 部署到 Walrus Sites

```bash
site-builder-testnet publish \
  --epochs 100 \
  --site-name "walrus-model-hub" \
  out/
```

### 4. 记录部署信息

部署成功后，保存以下信息：

```
✅ Site Object ID: 0x...
✅ Walrus Sites URL: https://...
```

## 常见错误和解决方案

### 错误 1: "could not find a valid Walrus configuration file"

**解决**:
```bash
# 下载官方配置
curl -o ~/.config/walrus/client_config.yaml \
  https://docs.wal.app/configs/client_config_testnet.yaml

# 或访问文档手动创建
open https://docs.wal.app/usage/setup.html#configuration
```

### 错误 2: "insufficient gas"

**解决**:
```bash
# 获取测试网 SUI
sui client faucet

# 或访问 Discord
open https://discord.com/invite/sui
# 在 #testnet-faucet 频道请求
```

### 错误 3: "unable to parse the client config file"

**解决**: 配置文件格式错误，从官方文档复制正确的格式

### 错误 4: "network error" 或 "connection timeout"

**解决**:
```bash
# 检查网络连接
ping sui.io

# 检查 Sui RPC
sui client active-env

# 切换到 testnet
sui client switch --env testnet
```

## 部署后测试

访问你的 Walrus Sites URL 并测试：

1. ✅ 主页加载
2. ✅ 浏览模型列表
3. ✅ 搜索功能
4. ✅ 连接钱包
5. ✅ 上传模型
6. ✅ 配置 LLM API Key
7. ✅ 生成 AI 元数据
8. ✅ 下载模型

## 配置 LLM API Key

部署后，用户需要配置自己的 API Key：

1. 访问上传页面
2. 点击设置图标 ⚙️
3. 输入：
   - API Key: 你的 OpenAI/GLM/Claude API Key
   - Base URL: (可选) 默认 `https://api.openai.com/v1`
   - Model: (可选) 默认 `gpt-3.5-turbo`
4. 保存配置

## 获取帮助

- **Walrus 文档**: https://docs.wal.app
- **Sui 文档**: https://docs.sui.io
- **Discord**: https://discord.com/invite/sui
- **GitHub**: https://github.com/MystenLabs/walrus-sites

## 下一步

部署成功后：

1. 📝 更新 README.md 中的部署 URL
2. 🔗 分享你的 Walrus Sites URL
3. 🎉 开始使用去中心化的 AI 模型中心！

---

**提示**: 如果遇到任何问题，请查看 `MANUAL_DEPLOY.md` 获取更详细的故障排除指南。

