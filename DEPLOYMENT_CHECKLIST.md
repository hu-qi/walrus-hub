# Walrus Sites 部署检查清单

## 部署前检查

### ✅ 代码准备
- [ ] 所有测试通过 (`npm test`)
- [ ] 构建成功 (`npm run build`)
- [ ] 本地预览正常 (`npx serve out`)
- [ ] 没有硬编码的 API Key
- [ ] 没有服务器端代码

### ✅ 环境准备
- [ ] 安装 Sui CLI
- [ ] 安装 Walrus CLI
- [ ] 安装 site-builder
- [ ] 配置 Sui 钱包
- [ ] 钱包有足够的 SUI 代币

## 部署步骤

### 1. 构建静态站点
```bash
cd web
npm run build
```

**验证：**
- [ ] `web/out/` 目录存在
- [ ] `web/out/index.html` 存在
- [ ] `web/out/_next/` 目录存在

### 2. 本地测试
```bash
npx serve out
```

**测试功能：**
- [ ] 主页加载正常
- [ ] 模型列表显示
- [ ] 搜索功能工作
- [ ] 上传页面可访问
- [ ] 模型详情页可访问（使用查询参数）

### 3. 部署到 Walrus Sites
```bash
site-builder publish out/
```

**记录信息：**
- [ ] Site Object ID: `_________________`
- [ ] Walrus Sites URL: `_________________`

### 4. 验证部署

访问 Walrus Sites URL 并测试：

#### 基础功能
- [ ] 页面加载正常
- [ ] 样式显示正确
- [ ] 图片加载正常
- [ ] 导航工作正常

#### 核心功能
- [ ] 浏览模型列表
- [ ] 搜索模型
- [ ] 查看模型详情
- [ ] 连接 Sui 钱包
- [ ] 上传模型（需要钱包）
- [ ] 下载模型（需要钱包）

#### AI 功能
- [ ] 打开高级设置
- [ ] 输入 API Key
- [ ] 保存配置
- [ ] 生成 AI 元数据
- [ ] 流式显示工作正常

## 部署后配置

### 配置 SuiNS（可选）
```bash
sui client call \
  --package <suins-package> \
  --module suins \
  --function set_target_address \
  --args <your-name> <site-object-id>
```

- [ ] SuiNS 名称: `_________________`
- [ ] 配置成功

### 更新文档
- [ ] 更新 README.md 中的部署 URL
- [ ] 更新社交媒体链接
- [ ] 通知用户新的部署地址

## 用户指南

### 首次使用指南

1. **访问站点**
   - URL: `_________________`

2. **配置 LLM API Key**
   - 点击上传页面的设置图标
   - 输入你的 OpenAI/GLM/Claude API Key
   - 保存配置

3. **连接钱包**
   - 点击 "Connect Wallet"
   - 选择你的 Sui 钱包
   - 批准连接

4. **上传模型**
   - 选择模型文件
   - 输入名称和描述
   - 或使用 AI 自动生成
   - 点击上传

5. **下载模型**
   - 浏览模型列表
   - 点击模型查看详情
   - 点击下载按钮
   - 批准交易

## 故障排除

### 部署失败

**问题：site-builder 未找到**
```bash
cargo install --git https://github.com/MystenLabs/walrus-sites site-builder
```

**问题：Gas 不足**
- 从测试网水龙头获取 SUI
- Discord: https://discord.com/invite/sui

**问题：构建失败**
```bash
cd web
rm -rf .next node_modules
npm install
npm run build
```

### 功能问题

**问题：AI 生成不工作**
- 检查 API Key 是否正确
- 检查 Base URL 是否正确
- 检查浏览器控制台错误
- 确认 LLM 提供商支持 CORS

**问题：钱包连接失败**
- 刷新页面
- 检查钱包扩展是否安装
- 切换到正确的网络（testnet/mainnet）

**问题：模型上传失败**
- 检查文件大小（Walrus 限制）
- 检查钱包余额
- 检查网络连接

**问题：模型下载失败**
- 检查 Walrus aggregator 可用性
- 尝试其他 aggregator 端点
- 检查浏览器控制台错误

## 性能监控

### 关键指标

- [ ] 页面加载时间 < 3s
- [ ] 首次内容绘制 < 1.5s
- [ ] 交互时间 < 3.5s
- [ ] 累积布局偏移 < 0.1

### 优化建议

1. **图片优化**
   - 使用 WebP 格式
   - 压缩图片大小
   - 使用适当的尺寸

2. **代码优化**
   - 启用代码分割
   - 懒加载组件
   - 移除未使用的依赖

3. **网络优化**
   - 使用多个 Walrus aggregator
   - 实现重试逻辑
   - 添加加载状态

## 安全检查

- [ ] 没有硬编码的密钥
- [ ] API Key 仅存储在 localStorage
- [ ] 使用 HTTPS 连接
- [ ] 输入验证正常
- [ ] 错误处理完善

## 备份和恢复

### 备份重要信息

```bash
# 备份配置
cp web/lib/contracts.ts contracts.backup.ts

# 记录部署信息
echo "Site Object ID: <id>" > deployment-info.txt
echo "Walrus URL: <url>" >> deployment-info.txt
echo "Deploy Date: $(date)" >> deployment-info.txt
```

### 恢复步骤

如果需要回滚：

1. 使用之前的构建输出
2. 重新部署到 Walrus Sites
3. 更新 SuiNS 指向（如果使用）

## 完成！

- [ ] 所有检查项完成
- [ ] 部署信息已记录
- [ ] 用户文档已更新
- [ ] 团队已通知

---

**部署日期：** `_________________`  
**部署人员：** `_________________`  
**Site Object ID：** `_________________`  
**Walrus Sites URL：** `_________________`  
**SuiNS 名称：** `_________________`

