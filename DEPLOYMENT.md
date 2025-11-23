# Walrus Model Hub - Deployment Guide

[中文版本](./DEPLOYMENT.zh.md)

## 🎉 部署成功

您的 Walrus Model Hub 已成功部署到 Walrus Sites Mainnet！

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

## 🔄 更新网站

当需要更新网站内容时：

```bash
cd web
npm run deploy:mainnet
```

这将自动更新现有站点，无需重新配置 SuiNS。

## 💰 费用信息

- **首次部署 Gas 费**: ~0.26 SUI
- **首次部署存储费**: ~0.002 WAL (1 epoch)
- **更新网站**: 仅需支付 Gas 费，存储费取决于新增内容

## 📊 网络配置

### Mainnet
- **Package ID**: `0x26eb7ee8688da02c5f671679524e379f0b837a12f1d1d799f255b7eea260ad27`
- **RPC URL**: `https://fullnode.mainnet.sui.io:443`
- **部署命令**: `npm run deploy:mainnet`

### Testnet
- **Package ID**: `0xf99aee9f21493e1590e7e5a9aea6f343a1f381031a04a732724871fc294be799`
- **RPC URL**: `https://fullnode.testnet.sui.io:443`
- **部署命令**: `npm run deploy:testnet`

## 🔗 相关链接

- **Walrus 官方文档**: https://docs.wal.app
- **SuiNS 管理**: https://suins.io/account/my-names
- **Sui Explorer**: https://suiscan.xyz/mainnet/object/0x9eb048881748acad77c1e61485e0cc202e0ab7baac4427c86a2bd1dbebf9706f
- **绑定自定义域名**: https://docs.wal.app/walrus-sites/bring-your-own-domain.html
