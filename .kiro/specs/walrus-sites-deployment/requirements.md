# Requirements Document

## Introduction

本文档定义了将 Walrus Model Hub 项目重构为纯静态客户端应用并部署到 Walrus Sites 的需求。Walrus Sites 是一个去中心化的静态网站托管服务，不支持服务器端 API 路由。因此，需要将现有的 Next.js 应用从混合模式（SSR + API Routes）转换为纯静态导出（Static Site Generation），并将 AI 元数据生成功能改为直接在浏览器中调用 LLM API。

## Glossary

- **Walrus Sites**: 去中心化的静态网站托管服务，仅支持纯静态 HTML/CSS/JavaScript 文件
- **Static Export**: Next.js 的静态导出功能，将应用编译为纯静态文件
- **Client-Side API Call**: 在浏览器中直接调用外部 API，而非通过服务器端代理
- **LLM Provider**: 大语言模型服务提供商（如 OpenAI、GLM、Claude 等）
- **API Key**: 用户用于访问 LLM 服务的认证密钥
- **Environment Variable**: 环境变量，用于存储配置信息
- **CORS**: 跨域资源共享（Cross-Origin Resource Sharing），浏览器安全机制

## Requirements

### Requirement 1

**User Story:** 作为开发者，我希望将应用配置为静态导出模式，以便能够部署到 Walrus Sites

#### Acceptance Criteria

1. WHEN Next.js 构建配置被修改 THEN the system SHALL 启用静态导出模式（output: 'export'）
2. WHEN 构建过程执行 THEN the system SHALL 生成纯静态的 HTML、CSS 和 JavaScript 文件到 out 目录
3. WHEN 静态文件生成完成 THEN the system SHALL 不包含任何服务器端运行时代码
4. WHEN 应用使用动态路由 THEN the system SHALL 通过 generateStaticParams 预生成所有路由页面
5. WHEN 构建过程执行 THEN the system SHALL 移除所有不兼容静态导出的 Next.js 功能（如 revalidate、headers 等）

### Requirement 2

**User Story:** 作为用户，我希望能够在浏览器中直接使用自己的 API Key 调用 LLM 服务，以便在去中心化环境中生成 AI 元数据

#### Acceptance Criteria

1. WHEN 用户点击 "Auto-Generate with AI" 按钮且未配置 API Key THEN the system SHALL 提示用户在高级设置中输入 API Key
2. WHEN 用户在高级设置中输入 API Key THEN the system SHALL 将 API Key 安全存储在浏览器本地存储中
3. WHEN 用户触发 AI 生成功能 THEN the system SHALL 使用用户提供的 API Key 直接从浏览器调用 LLM API
4. WHEN LLM API 调用成功 THEN the system SHALL 以流式方式显示生成的元数据
5. WHEN LLM API 调用失败 THEN the system SHALL 显示清晰的错误信息并提示用户检查 API Key 配置

### Requirement 3

**User Story:** 作为用户，我希望能够配置不同的 LLM 服务提供商，以便根据自己的偏好选择 AI 服务

#### Acceptance Criteria

1. WHEN 用户打开高级设置 THEN the system SHALL 显示 LLM 配置选项（Base URL、API Key、Model Name）
2. WHEN 用户输入 LLM 配置 THEN the system SHALL 验证配置格式的基本有效性
3. WHEN 用户保存 LLM 配置 THEN the system SHALL 将配置持久化到浏览器本地存储
4. WHEN 用户清除配置 THEN the system SHALL 从本地存储中删除所有 LLM 配置信息
5. WHEN 应用加载时 THEN the system SHALL 从本地存储恢复用户之前保存的 LLM 配置

### Requirement 4

**User Story:** 作为开发者，我希望移除服务器端 API 路由，以便应用完全符合静态托管要求

#### Acceptance Criteria

1. WHEN 代码重构完成 THEN the system SHALL 删除 app/api 目录下的所有服务器端路由文件
2. WHEN 上传页面调用 AI 生成功能 THEN the system SHALL 使用客户端 LLM 调用逻辑而非 fetch API 路由
3. WHEN 构建过程执行 THEN the system SHALL 不生成任何 API 路由相关的服务器端代码
4. WHEN 应用运行时 THEN the system SHALL 所有功能均在浏览器中执行，无需服务器端支持

### Requirement 5

**User Story:** 作为用户，我希望应用能够安全地处理我的 API Key，以便保护我的隐私和安全

#### Acceptance Criteria

1. WHEN 用户输入 API Key THEN the system SHALL 使用密码输入框隐藏 API Key 内容
2. WHEN API Key 存储到本地存储 THEN the system SHALL 仅存储在当前浏览器的本地存储中，不发送到任何服务器
3. WHEN 用户清除浏览器数据 THEN the system SHALL 同时清除存储的 API Key
4. WHEN 应用代码中 THEN the system SHALL 不包含任何硬编码的默认 API Key
5. WHEN 用户未配置 API Key THEN the system SHALL 禁用 AI 生成功能并显示配置提示

### Requirement 6

**User Story:** 作为开发者，我希望创建 Walrus Sites 部署配置，以便能够将静态文件部署到去中心化网络

#### Acceptance Criteria

1. WHEN 部署配置文件被创建 THEN the system SHALL 包含 Walrus Sites 所需的 ws-resources.json 配置
2. WHEN ws-resources.json 配置被定义 THEN the system SHALL 正确映射静态资源路径到 Walrus blob IDs
3. WHEN 部署脚本被执行 THEN the system SHALL 将 out 目录中的静态文件上传到 Walrus 网络
4. WHEN 静态文件上传完成 THEN the system SHALL 生成可访问的 Walrus Sites URL
5. WHEN 用户访问 Walrus Sites URL THEN the system SHALL 正确加载和显示应用

### Requirement 7

**User Story:** 作为用户，我希望在静态部署版本中保留所有核心功能，以便获得完整的用户体验

#### Acceptance Criteria

1. WHEN 应用以静态模式运行 THEN the system SHALL 支持浏览和搜索已上传的模型
2. WHEN 应用以静态模式运行 THEN the system SHALL 支持连接 Sui 钱包
3. WHEN 应用以静态模式运行 THEN the system SHALL 支持上传模型到 Walrus 和 Sui 区块链
4. WHEN 应用以静态模式运行 THEN the system SHALL 支持下载模型并记录下载次数到区块链
5. WHEN 应用以静态模式运行 THEN the system SHALL 支持使用用户自己的 API Key 生成 AI 元数据

### Requirement 8

**User Story:** 作为开发者，我希望更新项目文档，以便其他开发者了解如何部署到 Walrus Sites

#### Acceptance Criteria

1. WHEN 文档更新完成 THEN the system SHALL 在 README 中包含 Walrus Sites 部署说明
2. WHEN 文档更新完成 THEN the system SHALL 在 DEPLOYMENT.md 中详细说明静态导出和部署流程
3. WHEN 文档更新完成 THEN the system SHALL 说明用户如何配置自己的 LLM API Key
4. WHEN 文档更新完成 THEN the system SHALL 包含常见问题和故障排除指南
5. WHEN 文档更新完成 THEN the system SHALL 提供 Walrus Sites 部署的完整示例命令
