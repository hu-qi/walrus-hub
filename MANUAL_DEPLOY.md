# 手动部署到 Walrus Sites (Testnet)

如果自动部署脚本遇到问题，请按照以下步骤手动部署：

## 前置条件

1. **安装 Sui CLI**
   ```bash
   curl -fsSL https://sui.io/install.sh | sh
   ```

2. **配置 Sui 钱包**
   ```bash
   sui client
   # 按提示创建或导入钱包
   # 确保切换到 testnet
   sui client switch --env testnet
   ```

3. **获取测试网 SUI 代币**
   - 访问 Discord: https://discord.com/invite/sui
   - 在 #testnet-faucet 频道请求代币
   - 或使用命令: `sui client faucet`

4. **安装 Walrus CLI**
   ```bash
   curl -sSf https://install.wal.app | sh -s -- -n testnet
   ```

5. **安装 site-builder-testnet**
   ```bash
   cargo install --git https://github.com/MystenLabs/walrus-sites site-builder
   ```

## 部署步骤

### 步骤 1: 构建静态站点

```bash
cd web
npm install
npm run build
```

验证构建成功：
```bash
ls -la out/
# 应该看到 index.html, upload/, model/, _next/ 等文件和目录
```

### 步骤 2: 初始化 Walrus 配置

```bash
# 运行 walrus info 来初始化配置
walrus info
```

如果提示找不到配置文件，创建一个基本配置：

```bash
mkdir -p ~/.config/walrus
cat > ~/.config/walrus/client_config.yaml << 'EOF'
# Walrus Testnet Configuration
# 这些值会在首次运行时自动填充
EOF
```

然后再次运行：
```bash
walrus info
```

### 步骤 3: 部署到 Walrus Sites

```bash
cd web
site-builder-testnet publish --epochs 100 --site-name "walrus-model-hub" out/
```

参数说明：
- `--epochs 100`: 存储 100 个 epoch（测试网约 1 年）
- `--site-name "walrus-model-hub"`: 站点名称
- `out/`: 静态文件目录

### 步骤 4: 记录部署信息

部署成功后，你会看到类似的输出：

```
Created new site: Walrus Model Hub
New site object ID: 0x...
Browse the resulting site at: https://...
```

**重要：保存以下信息**
- Site Object ID: `_________________`
- Walrus Sites URL: `_________________`

### 步骤 5: 测试部署的站点

访问输出的 URL 并测试：

1. ✅ 主页加载
2. ✅ 模型列表显示
3. ✅ 搜索功能
4. ✅ 上传页面
5. ✅ 模型详情页
6. ✅ 钱包连接
7. ✅ AI 元数据生成（需要配置 API Key）

## 常见问题

### Q: 提示 "could not find a valid Walrus configuration file"

**A:** 运行以下命令初始化配置：
```bash
walrus info
```

### Q: 提示 "insufficient gas"

**A:** 获取更多测试网 SUI：
```bash
sui client faucet
# 或访问 Discord #testnet-faucet 频道
```

### Q: 部署失败，提示网络错误

**A:** 检查网络连接，或稍后重试：
```bash
# 检查 Sui 网络状态
sui client active-env
sui client gas

# 检查 Walrus 网络状态
walrus info
```

### Q: 如何更新已部署的站点？

**A:** 重新构建并部署：
```bash
cd web
npm run build
site-builder-testnet publish --epochs 100 --site-name "walrus-model-hub" out/
```

### Q: 如何删除站点？

**A:** 使用 site-builder delete 命令：
```bash
site-builder-testnet delete <site-object-id>
```

## 配置用户 LLM API Key

部署后，用户需要配置自己的 LLM API Key：

1. 访问部署的站点
2. 进入上传页面
3. 点击设置图标（⚙️）
4. 输入以下信息：
   - **API Key**: 你的 OpenAI/GLM/Claude API Key
   - **Base URL**: API 端点（可选，默认 OpenAI）
   - **Model**: 模型名称（可选，默认 gpt-3.5-turbo）
5. 点击 "Save & Close"

## 支持的 LLM 提供商

| 提供商 | Base URL | 模型示例 |
|--------|----------|----------|
| OpenAI | `https://api.openai.com/v1` | `gpt-3.5-turbo`, `gpt-4` |
| Anthropic | `https://api.anthropic.com` | `claude-3-5-sonnet-20241022` |
| GLM (智谱) | `https://open.bigmodel.cn/api/paas/v4/` | `glm-4` |

## 下一步

- 📝 更新 README.md 中的部署 URL
- 🔗 分享你的 Walrus Sites URL
- 🎉 开始使用去中心化的 AI 模型中心！

## 获取帮助

- Walrus 文档: https://docs.wal.app
- Sui 文档: https://docs.sui.io
- Discord: https://discord.com/invite/sui
- GitHub Issues: https://github.com/MystenLabs/walrus-sites/issues

