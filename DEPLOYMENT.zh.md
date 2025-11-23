# Walrus Model Hub - 部署指南

[English Version](./DEPLOYMENT.md)

## 🎉 部署成功

您的 Walrus Model Hub 已成功部署到 Walrus Sites 主网！

### 站点信息
- **Site Object ID**: `0x9eb048881748acad77c1e61485e0cc202e0ab7baac4427c86a2bd1dbebf9706f`
- **Base36 ID**: `3ydv4lw2dz9hlqsywlaj80zyu96p7ywhe4ncipfauv698hhn5b`
- **SuiNS 域名**: `walrus-hub.sui`
- **SuiNS Object ID**: `0xff1a0f215cc769cfdead0ff6f99a8572014b43a1e7b74b9bab175bde435944e6`

## 🌐 配置 SuiNS 域名访问

### 步骤 1: 访问 SuiNS 管理页面
前往：https://suins.io/account/my-names

### 步骤 2: 链接到 Walrus Site
1. 找到您的域名 `walrus-hub.sui`
2. 点击右上角的 **三点菜单图标**
3. 选择 **"Link To Walrus Site"**
4. 粘贴 Site Object ID: 
   ```
   0x9eb048881748acad77c1e61485e0cc202e0ab7baac4427c86a2bd1dbebf9706f
   ```
5. 确认信息正确后，点击 **"Apply"**
6. 批准钱包中的交易

### 步骤 3: 访问您的网站
配置完成后，您可以通过以下地址访问：

**🔗 推荐访问地址（SuiNS）**:
```
https://walrus-hub.wal.app
```

**备用访问地址（Base36）**:
```
https://3ydv4lw2dz9hlqsywlaj80zyu96p7ywhe4ncipfauv698hhn5b.walrus.site
```

## 🚀 本地开发

### 安装依赖

```bash
cd web
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 查看应用。

### 生产构建

```bash
npm run build
```

静态文件将生成在 `web/out` 目录。

## 🔄 更新网站

当需要更新网站内容时：

```bash
cd web
npm run deploy:mainnet
```

这将自动更新现有站点，无需重新配置 SuiNS。

**注意事项：**
- 更新会保留相同的 Site Object ID
- 只需支付 Gas 费用和新增内容的存储费
- SuiNS 配置无需修改
- 更新通常在几分钟内生效

## 💰 费用信息

### 首次部署
- **Gas 费 (SUI)**: ~0.26 SUI
- **存储费 (WAL Token)**: ~0.002 WAL (1 epoch ≈ 14 天)
- **总费用**: 对于 2.8MB 的网站，约 0.26 SUI + 0.002 WAL

### 更新部署
- **Gas 费**: 按修改的文件数量计算
- **存储费**: 仅为新增或修改的内容支付
- **无变化文件**: 不产生额外费用

### 存储周期
- **1 epoch**: 约 14 天（主网）/ 1 天（测试网）
- **续期**: 到期前需重新部署以延长存储时间
- **推荐**: 部署时指定多个 epochs（`--epochs 10` 表示约 140 天）

## 📊 网络配置

### 主网 (Mainnet)

**配置文件**: `web/sites-config-mainnet.yaml`

```yaml
package: 0x26eb7ee8688da02c5f671679524e379f0b837a12f1d1d799f255b7eea260ad27
rpc_url: https://fullnode.mainnet.sui.io:443
walrus_config: ~/.config/walrus/client_config_mainnet.yaml
```

**部署命令**:
```bash
npm run deploy:mainnet
```

**Walrus 配置**: `~/.config/walrus/client_config_mainnet.yaml`
```yaml
contexts:
  mainnet:
    system_object: 0x2134d52768ea07e8c43570ef975eb3e4c27a39fa6396bef985b5abc58d03ddd2
    staking_object: 0x10b9d30c28448939ce6c4d6c6e0ffce4a7f8a4ada8248bdad09ef8b70e4a3904
    wallet_config:
      active_env: mainnet
      # active_address: 0x<YOUR_WALLET_ADDRESS_HERE>  # 可选：指定部署地址
    rpc_urls:
      - https://fullnode.mainnet.sui.io:443
default_context: mainnet
```

### 测试网 (Testnet)

**配置文件**: `web/sites-config.yaml`

```yaml
package: 0xf99aee9f21493e1590e7e5a9aea6f343a1f381031a04a732724871fc294be799
rpc_url: https://fullnode.testnet.sui.io:443
```

**部署命令**:
```bash
npm run deploy:testnet
```

**Walrus 配置**: 使用默认的 `~/.config/walrus/client_config.yaml`

### 配置对比

| 项目 | 主网 | 测试网 |
|------|------|--------|
| Package ID | `0x26eb...ad27` | `0xf99a...be799` |
| Epoch 时长 | ~14 天 | ~1 天 |
| 代币 | WAL Token | WAL (测试) |
| Portal | wal.app | 需自建或第三方 |
| 部署工具 | `site-builder` | `site-builder-testnet` |

## 🛠️ 部署前准备

### 1. 安装必要工具

**Sui CLI** (已包含在环境中):
```bash
sui --version
```

**Walrus 主网 CLI**:
```bash
curl -sSf https://install.wal.app | sh
```

**Walrus 测试网 CLI**:
```bash
curl -sSf https://install.wal.app | sh -s -- -n testnet
```

### 2. 准备钱包

**主网部署需要**:
- SUI 代币（用于 Gas 费）
- WAL Token（用于存储费）

**获取代币**:
- SUI: 通过交易所购买或转账
- WAL Token: 通过 Walrus 官方渠道获取

**导入钱包**:
```bash
sui keytool import "your_private_key" ed25519
```

### 3. 验证环境

```bash
# 检查 Sui 环境
sui client envs

# 检查活跃地址
sui client active-address

# 查看余额
sui client balance
```

## 🔧 故障排除

### 部署失败: 余额不足

**错误信息**:
```
Error: could not find WAL coins with sufficient balance
```

**解决方案**:
1. 检查 WAL Token 余额
2. 确认使用了正确的钱包地址
3. 确保 Walrus 配置文件正确

### 部署失败: 网络超时

**错误信息**:
```
Error: Request rejected `504`
```

**解决方案**:
1. 检查网络连接
2. 重试部署命令
3. 尝试更换 RPC 节点

### SuiNS 配置未生效

**症状**: 域名访问返回 404

**解决方案**:
1. 等待 5-10 分钟让配置生效
2. 清除浏览器缓存
3. 确认 Site Object ID 正确
4. 检查交易是否成功确认

### 网站内容未更新

**症状**: 部署成功但内容未变化

**解决方案**:
1. 清除浏览器缓存（Ctrl+Shift+R 或 Cmd+Shift+R）
2. 检查部署日志确认文件已上传
3. 等待几分钟让 CDN 缓存更新
4. 使用隐身模式访问测试

## 📚 相关资源

### 官方文档
- **Walrus Sites**: https://docs.wal.app/walrus-sites/intro.html
- **SuiNS**: https://docs.suins.io/
- **Sui 文档**: https://docs.sui.io/

### 浏览器链接
- **Sui Explorer**: https://suiscan.xyz/mainnet/object/0x9eb048881748acad77c1e61485e0cc202e0ab7baac4427c86a2bd1dbebf9706f
- **SuiNS 管理**: https://suins.io/account/my-names

### 教程
- **设置 SuiNS**: https://docs.wal.app/walrus-sites/tutorial-suins.html
- **自定义域名**: https://docs.wal.app/walrus-sites/bring-your-own-domain.html
- **本地运行 Portal**: https://docs.wal.app/walrus-sites/portal.html

## 🔐 安全建议

1. **私钥管理**
   - 永远不要提交私钥到代码仓库
   - 使用硬件钱包存储大额资产
   - 定期备份钱包助记词

2. **部署权限**
   - 只有 Site Object 的所有者可以更新站点
   - 妥善保管拥有部署权限的钱包私钥
   - 考虑使用多签钱包管理生产环境

3. **代币安全**
   - 主网钱包中只保留必要的代币数量
   - 大额资产存储在冷钱包
   - 定期检查钱包交易记录

## 🎯 最佳实践

### 部署流程

1. **测试网验证**
   ```bash
   npm run deploy:testnet
   ```
   在测试网验证所有功能正常

2. **主网部署**
   ```bash
   npm run deploy:mainnet
   ```
   确认无误后部署到主网

3. **配置 SuiNS**
   按照本文档步骤配置域名

4. **验证访问**
   测试所有页面和功能

### 版本管理

- 为每次部署打 Git tag
- 记录 Site Object ID
- 保存部署日志
- 文档化配置变更

### 监控和维护

- 定期检查网站可访问性
- 监控存储 epoch 到期时间
- 及时续期避免内容丢失
- 关注 Walrus 和 Sui 网络升级公告

## ❓ 常见问题

**Q: 如何检查站点存储到期时间？**

A: 使用 `site-builder` 的 `sitemap` 命令查看站点详情，包括到期时间。

**Q: 可以使用自定义域名吗？**

A: 可以。参考[官方文档](https://docs.wal.app/walrus-sites/bring-your-own-domain.html)配置 CNAME 记录。

**Q: 如何删除已部署的站点？**

A: 使用 `site-builder destroy` 命令，但请注意这是不可逆操作。

**Q: 支持哪些文件类型？**

A: Walrus Sites 支持所有静态文件类型（HTML、CSS、JS、图片、字体等）。

**Q: 有文件大小限制吗？**

A: 单个文件建议不超过 500MB，总站点大小取决于 WAL 代币余额。

---

如有其他问题，请查看[主 README](./README.zh.md)或在 [GitHub Issues](../../issues) 提问。
