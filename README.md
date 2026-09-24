# 小信号

「小信号」是一款面向情侣、朋友和其他重要关系的微信小程序。它让人不必发起一段聊天，也能轻轻表达“想到你了”“抱一下”或“今天有点累”。收到信号不代表必须回复。

项目使用微信小程序原生框架、TypeScript、WXML 和 WXSS。当前代码包含可交互的产品原型，数据由 Mock Repository 提供，尚未接入正式后端。

## 当前功能

- **信号**：发送预设信号或自定义暗号，查看收到和发出的信号，并模拟接住或回应。
- **关系连接**：创建和接受邀请，查看关系信息，模拟解除关系。
- **今日状态**：设置、编辑或清除今天的状态。
- **足迹**：浏览时间轴、月度回顾和星图。
- **共同记忆**：创建照片瞬间和时光胶囊。
- **设置**：管理暗号、关系和通知偏好。
- **界面评审**：开发环境中的 UI Review 页面提供页面入口和固定状态预览。

以上数据和流程由 Mock 实现，用于开发与交互演示，不代表真实用户数据已经保存或送达。

## 开发环境

- 微信开发者工具
- Node.js 与 npm
- TypeScript 5.9（由 npm 依赖管理）

安装依赖并运行 TypeScript 检查：

```sh
npm ci
npm run typecheck
```

在微信开发者工具中打开**项目根目录**。`project.config.json` 已将小程序根目录设为 `miniprogram/`。本地开发者设置放在被 Git 忽略的 `project.private.config.json` 中；如需使用自己的小程序账号，请在开发者工具中配置对应 AppID。

项目没有独立的 npm 启动脚本，页面编译和运行由微信开发者工具完成。

## Mock 交互演示

在微信开发者工具的开发环境打开小程序后，可以使用页面中的开发调试入口切换 Mock 用户。一个典型流程是：

1. 以用户 A 发送一个信号。
2. 切换到用户 B，在信号页面查看并回应。
3. 切回用户 A，查看回应和足迹记录。

关系邀请、照片存储、时光胶囊和通知偏好同样使用 Mock 数据。邀请分享、图片上传、推送通知和真实账号登录尚未接入微信平台服务。

## 项目结构

```text
.
├── docs/                       # PRD、交互、数据模型和验收文档
├── miniprogram/
│   ├── pages/                  # 小程序页面
│   ├── components/             # 可复用组件
│   ├── services/               # 页面使用的业务服务
│   ├── repositories/           # Repository 接口与 Mock 实现
│   ├── stores/                 # 页面间共享状态
│   ├── types/                  # 业务类型定义
│   ├── utils/                  # 通用工具
│   └── assets/                 # 页面素材
├── screenshots/                # 页面检查截图
├── project.config.json         # 微信开发者工具项目配置
├── package.json                # 开发依赖与脚本
└── tsconfig.json               # TypeScript 配置
```

页面通过 Service 调用 Repository；页面不直接访问数据层。当前 Repository 实现位于 `miniprogram/repositories/mock/`，后续可按接口替换为云开发实现。

## 文档

- [产品需求 PRD](docs/PRD.md)
- [交互规范](docs/INTERACTIONS.md)
- [数据模型](docs/DATA_MODEL.md)
- [验收标准](docs/ACCEPTANCE.md)
- [视觉母版](docs/视觉母版.png)

目前仓库尚无 `docs/UI_SPEC.md` 和 `docs/DESIGN_SYSTEM.md`。

## 尚未接入或验证

- 微信登录、云数据库、云函数和云存储。
- 真实邀请分享、照片上传和订阅通知。
- 真机权限、震动反馈及不同设备上的页面表现。

类型检查通过不等于微信开发者工具编译、真机体验或上述平台能力已验证。涉及这些能力时，请在相应微信环境中单独检查。
