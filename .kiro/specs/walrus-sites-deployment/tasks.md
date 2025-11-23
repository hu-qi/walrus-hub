# Implementation Plan: Walrus Sites Deployment

- [x] 1. 配置 Next.js 静态导出模式
  - 修改 `web/next.config.ts` 添加 `output: 'export'` 和 `images: { unoptimized: true }`
  - 移除所有不兼容静态导出的配置选项
  - _Requirements: 1.1, 1.5_

- [x] 1.1 验证静态导出配置
  - 检查 `next.config.ts` 是否包含正确的静态导出配置
  - _Requirements: 1.1_

- [x] 2. 创建 LLM 配置管理模块
  - 创建 `web/lib/llm-config.ts` 文件
  - 实现 `LLMConfig` 接口和 `DEFAULT_LLM_CONFIG` 常量
  - 实现 `LLMConfigManager` 类，包含 `saveConfig`、`loadConfig`、`clearConfig`、`validateConfig` 方法
  - 使用 localStorage 进行配置持久化
  - _Requirements: 3.2, 3.3, 3.4, 3.5_

- [x] 2.1 编写 LLMConfigManager 属性测试
  - **Property 1: Configuration persistence**
  - **Validates: Requirements 3.3**

- [x] 2.2 编写 LLMConfigManager 属性测试
  - **Property 2: Configuration validation**
  - **Validates: Requirements 3.2**

- [x] 3. 创建客户端 LLM 调用模块
  - 创建 `web/lib/llm-client.ts` 文件
  - 实现 `GenerateMetadataParams` 和 `GeneratedMetadata` 接口
  - 实现 `LLMClient` 类的 `generateMetadata` 方法（支持流式响应）
  - 实现 `parseStreamBuffer` 私有方法解析流式数据
  - 添加错误处理（401、429、网络错误等）
  - _Requirements: 2.3, 2.4, 2.5_

- [x] 3.1 编写 LLMClient 单元测试
  - Mock OpenAI SDK
  - 测试流式响应解析
  - 测试错误处理逻辑
  - _Requirements: 2.3, 2.4, 2.5_

- [x] 3.2 编写客户端 API 调用属性测试
  - **Property 4: Client-side API calls**
  - **Validates: Requirements 2.3, 4.2**

- [x] 4. 重构上传页面的 AI 生成功能
  - 修改 `web/app/upload/page.tsx`
  - 移除对 `/api/generate-metadata` 的 fetch 调用
  - 在 `handleGenerateMetadata` 中检查 LLM 配置
  - 如果未配置 API Key，显示错误提示并打开高级设置
  - 使用 `LLMClient.generateMetadata()` 替代 API 调用
  - 保持现有的流式显示动画效果
  - _Requirements: 2.1, 2.3, 2.4, 2.5, 4.2_

- [x] 4.1 编写 API Key 要求强制属性测试
  - **Property 3: API Key requirement enforcement**
  - **Validates: Requirements 2.1, 5.5**

- [x] 5. 增强高级设置对话框
  - 修改 `web/app/upload/page.tsx` 中的高级设置对话框
  - 添加 "API Key Required" 提示信息
  - 实现配置保存逻辑（调用 `LLMConfigManager.saveConfig`）
  - 实现配置加载逻辑（在 useEffect 中调用 `LLMConfigManager.loadConfig`）
  - 添加配置验证（调用 `LLMConfigManager.validateConfig`）
  - 更新 "Clear All" 按钮调用 `LLMConfigManager.clearConfig`
  - 确保 API Key 输入框使用 `type="password"`
  - _Requirements: 2.2, 3.1, 3.2, 3.3, 3.4, 3.5, 5.1_

- [x] 5.1 编写高级设置对话框组件测试
  - 测试配置保存/加载功能
  - 测试 API Key 输入验证
  - 测试清除配置功能
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 6. 删除服务器端 API 路由
  - 删除 `web/app/api` 目录及其所有内容
  - 确认代码中没有其他对 `/api/*` 的引用
  - _Requirements: 4.1, 4.2_

- [x] 7. 移除硬编码的默认 API Key
  - 检查并移除 `web/app/api/generate-metadata/route.ts` 中的 `DEFAULT_CONFIG.apiKey`
  - 搜索代码中是否有其他硬编码的 API Key
  - 确保 `web/lib/llm-config.ts` 中的 `DEFAULT_LLM_CONFIG` 不包含 apiKey
  - _Requirements: 5.4_

- [x] 8. 处理动态路由
  - 评估 `web/app/model/[blobId]/page.tsx` 的处理方案
  - 方案 A: 改为客户端路由，使用 useParams 和 useQuery
  - 方案 B: 移除该路由，在主页使用模态框显示详情
  - 实现选定的方案
  - _Requirements: 1.4_

- [x] 9. 测试静态导出构建
  - 运行 `npm run build` 验证构建成功
  - 检查 `web/out/` 目录是否生成
  - 验证输出文件不包含服务器端代码标记
  - 使用 `npx serve out` 本地测试静态站点
  - _Requirements: 1.2, 1.3, 4.3_

- [x] 9.1 编写构建输出验证属性测试
  - **Property 5: No server-side code in build output**
  - **Validates: Requirements 1.3, 4.3**

- [x] 10. 创建 Walrus Sites 部署配置
  - 创建 `walrus-site.yaml` 配置文件
  - 创建 `deploy-walrus-site.sh` 部署脚本
  - 在脚本中包含构建、部署和输出 URL 的步骤
  - 添加执行权限 `chmod +x deploy-walrus-site.sh`
  - _Requirements: 6.1, 6.2_

- [x] 11. 更新项目文档
  - 更新 `README.md` 添加 Walrus Sites 部署章节
  - 更新 `DEPLOYMENT.md` 添加静态导出和部署详细说明
  - 添加用户 LLM API Key 配置指南
  - 添加常见问题和故障排除章节
  - 提供完整的部署示例命令
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 12. 端到端功能验证
  - 在静态模式下测试模型浏览和搜索功能
  - 测试 Sui 钱包连接功能
  - 测试模型上传到 Walrus 和 Sui 区块链
  - 测试模型下载和下载次数记录
  - 测试使用用户 API Key 的 AI 元数据生成
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 13. Checkpoint - 确保所有测试通过
  - 确保所有测试通过，如有问题请询问用户

- [x] 14. 配置测试框架
  - 创建 `web/vitest.config.ts`
  - 创建 `web/test/setup.ts`
  - 安装测试依赖：vitest, @vitejs/plugin-react, jsdom, fast-check
  - _Requirements: Testing Strategy_

- [x] 15. 编写集成测试
  - 测试完整的静态导出流程
  - 测试 localStorage 交互
  - 测试 LLM API 调用流程（使用 mock）
  - _Requirements: Testing Strategy_
