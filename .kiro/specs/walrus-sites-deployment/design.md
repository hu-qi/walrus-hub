# Design Document: Walrus Sites Deployment

## Overview

本设计文档描述了将 Walrus Model Hub 从 Next.js 混合模式（SSR + API Routes）重构为纯静态客户端应用的技术方案，以便部署到 Walrus Sites 去中心化托管平台。

核心变更包括：
1. 配置 Next.js 静态导出模式
2. 将服务器端 AI 元数据生成 API 改为客户端直接调用
3. 实现用户 LLM 配置管理（API Key、Base URL、Model）
4. 移除所有服务器端代码和 API 路由
5. 创建 Walrus Sites 部署配置和脚本

## Architecture

### 当前架构（混合模式）

```
Browser → Next.js Server → API Routes (/api/generate-metadata)
                                ↓
                          OpenAI SDK → LLM Provider
```

### 目标架构（纯客户端）

```
Browser → Static HTML/CSS/JS
    ↓
    └→ OpenAI SDK (client-side) → LLM Provider (with user's API Key)
    └→ Sui Wallet → Sui Blockchain
    └→ Walrus Client → Walrus Network
```

所有逻辑在浏览器中执行，无需服务器端支持。

## Components and Interfaces

### 1. Next.js 静态导出配置

**文件**: `web/next.config.ts`

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',  // 启用静态导出
  images: {
    unoptimized: true,  // 禁用图片优化（静态导出不支持）
  },
  // 移除所有不兼容的配置
};

export default nextConfig;
```

### 2. LLM 配置管理模块

**文件**: `web/lib/llm-config.ts`

```typescript
export interface LLMConfig {
  apiKey: string;
  baseURL: string;
  model: string;
}

export const DEFAULT_LLM_CONFIG: Partial<LLMConfig> = {
  baseURL: "https://api.openai.com/v1",
  model: "gpt-3.5-turbo",
};

export class LLMConfigManager {
  private static STORAGE_KEY = 'walrus-hub-llm-config';

  // 保存配置到 localStorage
  static saveConfig(config: LLMConfig): void;

  // 从 localStorage 加载配置
  static loadConfig(): LLMConfig | null;

  // 清除配置
  static clearConfig(): void;

  // 验证配置完整性
  static validateConfig(config: Partial<LLMConfig>): boolean;
}
```

### 3. 客户端 LLM 调用模块

**文件**: `web/lib/llm-client.ts`

```typescript
import OpenAI from 'openai';
import { LLMConfig } from './llm-config';

export interface GenerateMetadataParams {
  modelName: string;
  llmConfig: LLMConfig;
}

export interface GeneratedMetadata {
  description: string;
  tags: string[];
}

export class LLMClient {
  // 生成元数据（流式）
  static async generateMetadata(
    params: GenerateMetadataParams,
    onChunk: (chunk: string) => void
  ): Promise<void>;

  // 解析流式响应
  private static parseStreamBuffer(buffer: string): GeneratedMetadata;
}
```

### 4. 上传页面重构

**文件**: `web/app/upload/page.tsx`

主要变更：
- 移除对 `/api/generate-metadata` 的 fetch 调用
- 使用 `LLMClient.generateMetadata()` 直接调用 LLM
- 在点击 "Auto-Generate" 前检查 API Key 配置
- 如果未配置，提示用户打开高级设置

```typescript
const handleGenerateMetadata = async () => {
  // 1. 检查配置
  const config = LLMConfigManager.loadConfig();
  if (!config || !config.apiKey) {
    toast.error("Please configure your LLM API Key in Advanced Settings");
    setShowAdvancedConfig(true);
    return;
  }

  // 2. 调用客户端 LLM
  setIsGenerating(true);
  try {
    await LLMClient.generateMetadata(
      { modelName: name, llmConfig: config },
      (chunk) => {
        // 更新 UI
        const parsed = LLMClient.parseStreamBuffer(chunk);
        setDescription(parsed.description);
        setTags(parsed.tags.join(", "));
      }
    );
    toast.success("Metadata generated successfully!");
  } catch (error) {
    toast.error("Failed to generate metadata. Please check your API Key.");
  } finally {
    setIsGenerating(false);
  }
};
```

### 5. 高级设置对话框增强

**文件**: `web/app/upload/page.tsx`

增强现有的高级设置对话框：
- 添加 "API Key Required" 提示
- 添加配置验证
- 添加配置保存/加载逻辑
- 添加配置测试功能（可选）

```typescript
const handleSaveConfig = () => {
  if (!llmApiKey) {
    toast.error("API Key is required");
    return;
  }

  const config: LLMConfig = {
    apiKey: llmApiKey,
    baseURL: llmBaseURL || DEFAULT_LLM_CONFIG.baseURL!,
    model: llmModel || DEFAULT_LLM_CONFIG.model!,
  };

  LLMConfigManager.saveConfig(config);
  toast.success("Configuration saved!");
  setShowAdvancedConfig(false);
};

// 组件加载时恢复配置
useEffect(() => {
  const config = LLMConfigManager.loadConfig();
  if (config) {
    setLlmApiKey(config.apiKey);
    setLlmBaseURL(config.baseURL);
    setLlmModel(config.model);
  }
}, []);
```

### 6. 动态路由静态化

**文件**: `web/app/model/[blobId]/page.tsx`

由于 Walrus Sites 不支持真正的动态路由，我们需要：
- 移除 `generateStaticParams`（因为无法预知所有 blob IDs）
- 改为使用客户端路由和查询参数
- 或者接受 404 错误（用户通过主页链接访问）

**方案 A**: 客户端路由（推荐）
```typescript
// 不生成静态页面，改为在客户端处理
export default function ModelPage() {
  const params = useParams();
  const blobId = params.blobId as string;
  
  // 客户端获取数据
  const { data: model } = useQuery({
    queryKey: ['model', blobId],
    queryFn: () => fetchModelByBlobId(blobId),
  });

  // ...
}
```

**方案 B**: 回退到主页
- 移除 `/model/[blobId]` 路由
- 所有模型详情在主页以模态框显示

### 7. Walrus Sites 部署配置

**文件**: `walrus-site.yaml` (新建)

```yaml
package: <package-id>
module: site
```

**部署脚本**: `deploy-walrus-site.sh` (新建)

```bash
#!/bin/bash

# 1. 构建静态文件
cd web
npm run build

# 2. 使用 site-builder 部署
site-builder publish \
  --config ../walrus-site.yaml \
  out/

# 3. 输出访问 URL
echo "Deployed to Walrus Sites!"
echo "Access your site at: https://<site-id>.wal.app"
```

## Data Models

### LLMConfig

```typescript
interface LLMConfig {
  apiKey: string;      // 用户的 LLM API Key
  baseURL: string;     // LLM API 端点
  model: string;       // 模型名称
}
```

### LocalStorage Schema

```typescript
// Key: 'walrus-hub-llm-config'
// Value: JSON.stringify(LLMConfig)
{
  "apiKey": "sk-...",
  "baseURL": "https://api.openai.com/v1",
  "model": "gpt-3.5-turbo"
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Configuration persistence

*For any* valid LLM configuration, when saved to localStorage and then loaded, the loaded configuration should be equal to the original configuration
**Validates: Requirements 3.3**

### Property 2: Configuration validation

*For any* LLM configuration object, if it is missing the apiKey field, the validation function should return false
**Validates: Requirements 3.2**

### Property 3: API Key requirement enforcement

*For any* attempt to generate metadata without a configured API Key, the system should display an error message and not make any API calls
**Validates: Requirements 2.1, 5.5**

### Property 4: Client-side API calls

*For any* metadata generation request, the HTTP request should be made directly from the browser to the LLM provider's endpoint, not to any local API route
**Validates: Requirements 2.3, 4.2**

### Property 5: No server-side code in build output

*For any* file in the build output directory (out/), the file should not contain server-side runtime markers (e.g., "use server", API route handlers)
**Validates: Requirements 1.3, 4.3**

## Error Handling

### 1. 缺少 API Key

**场景**: 用户未配置 API Key 就尝试生成元数据

**处理**:
```typescript
if (!config || !config.apiKey) {
  toast.error("Please configure your LLM API Key in Advanced Settings", {
    duration: 5000,
    icon: "⚙️",
  });
  setShowAdvancedConfig(true);  // 自动打开设置对话框
  return;
}
```

### 2. LLM API 调用失败

**场景**: API Key 无效、网络错误、配额超限等

**处理**:
```typescript
try {
  await LLMClient.generateMetadata(...);
} catch (error: any) {
  console.error("LLM API error:", error);
  
  let errorMessage = "Failed to generate metadata. ";
  if (error.status === 401) {
    errorMessage += "Invalid API Key. Please check your configuration.";
  } else if (error.status === 429) {
    errorMessage += "Rate limit exceeded. Please try again later.";
  } else {
    errorMessage += "Please check your network and API Key.";
  }
  
  toast.error(errorMessage, { duration: 7000 });
}
```

### 3. CORS 错误

**场景**: LLM 提供商不支持浏览器直接调用

**处理**:
- 在文档中说明哪些 LLM 提供商支持 CORS
- 推荐使用支持 CORS 的提供商（OpenAI、Anthropic、GLM 等）
- 提供 CORS 代理方案（可选）

### 4. 静态导出构建错误

**场景**: 代码中使用了不兼容静态导出的 Next.js 功能

**处理**:
- 在构建前运行 linter 检查
- 提供清晰的错误信息和修复建议
- 在文档中列出所有不兼容的功能

## Testing Strategy

### Unit Tests

使用 Vitest 进行单元测试：

1. **LLMConfigManager 测试**
   - 测试配置保存/加载/清除
   - 测试配置验证逻辑
   - 测试 localStorage 交互

2. **LLMClient 测试**
   - Mock OpenAI SDK
   - 测试流式响应解析
   - 测试错误处理

3. **组件测试**
   - 测试高级设置对话框
   - 测试 API Key 输入验证
   - 测试配置保存按钮

### Property-Based Tests

使用 fast-check 进行属性测试：

1. **配置持久化测试**
   - 生成随机 LLMConfig 对象
   - 验证保存后加载的配置与原始配置相同

2. **配置验证测试**
   - 生成各种有效/无效的配置对象
   - 验证验证函数的正确性

3. **流式解析测试**
   - 生成随机的流式响应片段
   - 验证解析逻辑的鲁棒性

### Integration Tests

1. **静态导出测试**
   - 运行 `npm run build`
   - 验证 `out/` 目录结构
   - 验证没有服务器端代码

2. **端到端测试**（可选）
   - 使用 Playwright
   - 测试完整的上传和 AI 生成流程
   - 测试钱包连接和区块链交互

### 测试配置

**文件**: `web/vitest.config.ts` (新建)

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

## Deployment Process

### 1. 本地构建

```bash
cd web
npm run build
```

输出: `web/out/` 目录包含所有静态文件

### 2. 验证构建

```bash
# 本地预览
npx serve out

# 检查文件
ls -la out/
```

### 3. 部署到 Walrus Sites

```bash
# 安装 site-builder
cargo install --git https://github.com/MystenLabs/walrus-sites site-builder

# 部署
cd web
site-builder publish out/
```

### 4. 配置 SuiNS（可选）

```bash
# 将 SuiNS 名称指向 Walrus Site 对象
sui client call \
  --package <suins-package> \
  --module suins \
  --function set_target_address \
  --args <name> <site-object-id>
```

## Migration Guide

### 开发者迁移步骤

1. **更新 Next.js 配置**
   ```bash
   # 修改 web/next.config.ts
   # 添加 output: 'export'
   ```

2. **创建 LLM 配置模块**
   ```bash
   # 创建 web/lib/llm-config.ts
   # 创建 web/lib/llm-client.ts
   ```

3. **重构上传页面**
   ```bash
   # 修改 web/app/upload/page.tsx
   # 移除 fetch('/api/generate-metadata')
   # 使用 LLMClient.generateMetadata()
   ```

4. **删除 API 路由**
   ```bash
   rm -rf web/app/api
   ```

5. **测试构建**
   ```bash
   cd web
   npm run build
   npx serve out
   ```

6. **部署到 Walrus Sites**
   ```bash
   site-builder publish out/
   ```

### 用户迁移步骤

1. **配置 API Key**
   - 访问应用
   - 点击设置图标
   - 输入 LLM API Key
   - 保存配置

2. **使用 AI 生成功能**
   - 上传模型时点击 "Auto-Generate with AI"
   - 系统使用用户的 API Key 生成元数据

## Security Considerations

### 1. API Key 安全

- **存储**: 仅存储在浏览器 localStorage，不发送到任何服务器
- **传输**: 直接从浏览器发送到 LLM 提供商，使用 HTTPS
- **显示**: 使用密码输入框隐藏
- **清除**: 用户可随时清除配置

### 2. CORS 安全

- 仅调用支持 CORS 的 LLM 提供商
- 不使用不安全的 CORS 代理
- 在文档中说明 CORS 要求

### 3. 代码安全

- 移除所有硬编码的 API Key
- 不在客户端代码中包含敏感信息
- 使用 Content Security Policy (CSP)

## Performance Considerations

### 1. 静态文件优化

- 启用 Gzip/Brotli 压缩
- 优化图片大小
- 代码分割和懒加载

### 2. LLM 调用优化

- 实现请求取消
- 添加超时处理
- 缓存生成结果（可选）

### 3. Walrus 网络优化

- 使用多个 aggregator 端点
- 实现故障转移
- 添加重试逻辑

## Future Enhancements

1. **支持更多 LLM 提供商**
   - Anthropic Claude
   - Google Gemini
   - Cohere
   - 本地 LLM (Ollama)

2. **配置导入/导出**
   - 导出配置为 JSON
   - 从文件导入配置
   - 配置模板

3. **AI 生成增强**
   - 自定义 prompt
   - 多语言支持
   - 批量生成

4. **离线支持**
   - Service Worker
   - 缓存策略
   - 离线提示

5. **分析和监控**
   - 使用统计
   - 错误追踪
   - 性能监控
