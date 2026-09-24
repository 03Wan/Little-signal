# 小信号（Little Signal）开发规则

## 1. 项目简介

“小信号”是一款微信小程序。

它不是聊天软件，也不是传统情侣空间。

核心产品命题：

> 有些时候，不是想聊天，只是突然想到了一个人。

用户可以向一个重要的人发送极轻量的“小信号”，例如：

- 想到你了
- 抱一下
- 今天有点累
- 今天挺开心
- 到家了
- 晚安
- 敲一下
- 自定义暗号

产品强调：

- 低表达成本
- 低打扰
- 无回复压力
- 私密关系
- 情绪连接
- 长期记忆沉淀

---

## 2. 开发前必须阅读

在修改任何业务代码前，必须优先阅读：

1. `docs/PRD.md`
2. `docs/UI_SPEC.md`
3. `docs/DESIGN_SYSTEM.md`
4. `docs/DATA_MODEL.md`
5. `docs/INTERACTIONS.md`
6. `docs/ACCEPTANCE.md`

视觉参考：

`design/visual-master.png`

如视觉图片与文档存在冲突：

优先级为：

`DESIGN_SYSTEM.md`
>
`UI_SPEC.md`
>
`visual-master.png`

图片只用于理解整体视觉气质。

具体：

- 字体
- 间距
- 尺寸
- 颜色
- 文案
- 交互
- 页面状态

以 Markdown 规格为准。

---

## 3. 产品原则

任何新功能、页面或交互都必须符合以下原则。

### 3.1 低表达成本

核心动作应尽可能在 2 秒左右完成。

避免要求用户：

- 输入长文字
- 连续确认
- 填写复杂表单
- 经过多层页面才能发送信号

### 3.2 无回复压力

收到信号不意味着必须回应。

产品支持：

`无需回复`

禁止设计：

- 已读不回提醒
- 回复率
- 平均回复时间
- 催回复
- 未回复次数
- “TA 为什么还没回复”类提示

### 3.3 不量化感情

禁止实现：

- 亲密度评分
- 情侣等级
- 谁更主动
- 谁发得更多
- 谁回复得更快
- 爱情指数
- 连续互动天数排行榜
- 情感健康评分
- 用户关系排名

可以展示：

- 两人共同留下多少信号
- 某个月有多少天产生过互动
- 有多少照片瞬间
- 有多少时光胶囊

但不得拆分成双方对比。

### 3.4 不制造焦虑

禁止：

- 红色未读数字轰炸
- 连续签到断签提示
- “已经 X 天没有互动”
- 情绪绑架式文案
- 解除关系时的挽留文案
- 强提醒要求回应

例如禁止：

> 你真的舍得离开 TA 吗？

应该使用：

> 解除后，你们将无法继续互发信号。

### 3.5 私密优先

核心内容默认仅关系双方可见。

禁止默认公开：

- 信号
- 照片
- 状态
- 时光胶囊
- 暗号
- 关系记录

---

## 4. 明确禁止开发的功能

除非 PRD 后续正式更新，否则不要自行加入：

- 即时聊天
- 私聊输入框
- 群聊
- 评论区
- 公开动态
- 朋友圈
- 点赞体系
- 粉丝体系
- 关注体系
- 排行榜
- 亲密度等级
- 连续签到
- 积分
- 商城
- 广告
- 直播
- 视频通话
- 语音通话
- 实时位置追踪
- AI 情感分析
- AI 判断关系好坏
- AI 判断谁更爱谁

不得因为“功能更丰富”而擅自扩展产品。

---

## 5. 技术栈

V1 默认：

### 前端

- 微信小程序原生框架
- TypeScript
- WXML
- WXSS
- 微信官方 API

### 后端

前期：

- Mock Repository

正式接入阶段：

- 微信云开发
- 云数据库
- 云函数
- 云存储

不要在 UI 原型阶段提前耦合真实数据库。

---

## 6. 工程目录

推荐：

```text
little-signal/
│
├── AGENTS.md
├── README.md
│
├── docs/
│   ├── PRD.md
│   ├── UI_SPEC.md
│   ├── DESIGN_SYSTEM.md
│   ├── DATA_MODEL.md
│   ├── INTERACTIONS.md
│   └── ACCEPTANCE.md
│
├── design/
│   └── visual-master.png
│
├── miniprogram/
│   ├── app.ts
│   ├── app.json
│   ├── app.wxss
│   │
│   ├── pages/
│   ├── components/
│   ├── services/
│   ├── repositories/
│   ├── stores/
│   ├── utils/
│   ├── types/
│   └── assets/
│
├── cloudfunctions/
│
└── project.config.json
```

---

## 7. 架构要求

页面不得直接访问数据库。

必须遵循：

```text
Page
↓
Service / Store
↓
Repository
↓
Mock / Cloud
```

例如：

```ts
interface SignalRepository {
  createSignal(input: CreateSignalInput): Promise<Signal>
  getSignal(id: string): Promise<Signal | null>
  getTimeline(relationshipId: string): Promise<Signal[]>
  respondToSignal(
    signalId: string,
    responseType: SignalResponseType
  ): Promise<SignalResponse>
}
```

初期实现：

`MockSignalRepository`

后期替换：

`CloudSignalRepository`

UI 层不应该知道底层数据来源。

---

## 8. TypeScript 规范

禁止：

```ts
any
```

除非第三方 API 无法避免。

优先：

```ts
type
interface
enum-like union
```

例如：

```ts
type SignalType =
  | 'thinking_of_you'
  | 'hug'
  | 'tired'
  | 'happy'
  | 'home'
  | 'goodnight'
  | 'knock'
  | 'custom'
  | 'available'
```

状态不得使用无定义字符串。

---

## 9. 组件化要求

以下内容应优先抽成公共组件：

- PrimaryButton
- SecondaryButton
- TextButton
- SignalOrb
- SignalIcon
- SignalPicker
- BottomSheet
- Toast
- EmptyState
- LoadingState
- ErrorState
- MoodBadge
- TimelineItem
- CapsuleCard
- CustomSignalCard
- RelationHeader
- AppTabBar
- ConfirmSheet

禁止同样 UI 在多个页面重复复制。

---

## 10. Design Token

不要在页面中大量硬编码：

```css
color: #171717;
padding: 20px;
border-radius: 24px;
```

统一定义设计 Token。

例如：

```css
page {
  --color-bg: #F7F7F5;
  --color-surface: #FFFFFF;
  --color-text-primary: #171717;
  --color-text-secondary: #8E8E8A;
  --color-divider: #E8E8E4;

  --space-page: 20px;

  --radius-sm: 12px;
  --radius-md: 18px;
  --radius-lg: 24px;
  --radius-full: 999px;
}
```

---

## 11. 页面状态

所有核心页面至少考虑：

- loading
- normal
- empty
- success
- error
- offline
- disabled

涉及权限的页面还需要：

- permission-denied

涉及关系的页面还需要：

- unbound
- relationship-ended

不得只实现 Happy Path。

---

## 12. 动画原则

允许：

- 呼吸
- 波纹
- 微光
- 渐隐
- 圆点靠近
- 轻微缩放
- 卡片上浮

禁止：

- 满屏烟花
- 彩纸
- 大量爱心
- 高频闪烁
- 夸张弹跳
- 长时间阻塞动画

核心动画尽量控制：

`150ms – 1200ms`

---

## 13. 震动反馈

仅在关键动作使用。

例如：

发送成功：

轻震一次。

接住信号：

轻震一次。

不得：

连续震动。

大量信号需要服务端或客户端合并处理。

---

## 14. 文案规范

语气：

- 克制
- 自然
- 温柔
- 不煽情
- 不油腻
- 不情绪绑架

推荐：

> 信号已经送出

> 她接住了你的信号

> 今天你们什么都没说，也没关系。

禁止：

> TA 一定非常想你！

> 你们的爱情值爆表！

> 快去哄哄 TA！

---

## 15. Git 与修改要求

一次任务只完成当前范围。

不要：

- 顺手重构无关代码
- 修改无关页面
- 偷偷添加功能
- 修改 PRD
- 擅自修改数据结构

如发现需求冲突：

先指出冲突。

不要自行决定产品方向。

---

## 16. 每次任务结束必须检查

完成开发后必须报告：

### 修改内容

列出：

- 新增文件
- 修改文件
- 删除文件

### 测试

至少检查：

- TypeScript
- 路由
- 基础运行
- 当前功能核心流程

如项目存在：

- lint
- test

则必须执行。

### 未完成项

明确告诉用户：

- 什么完成
- 什么没完成
- 什么只是 Mock
- 哪些需要真机验证

禁止将：

“代码已经写了”

描述为：

“功能已经完全可用”。

尤其涉及：

- 微信登录
- 订阅通知
- 云函数
- 相册权限
- 真机震动
- 分享

必须明确是否经过微信开发者工具或真机验证。

---

## 17. 当前开发顺序

默认严格按照：

```text
Task 01 工程初始化
Task 02 Design System
Task 03 五个视觉母版
Task 04 首页核心交互
Task 05 信号发送与接住
Task 06 双人关系绑定
Task 07 今日状态
Task 08 自定义暗号
Task 09 时间轴
Task 10 信号星图
Task 11 照片信号
Task 12 时光胶囊
Task 13 勿扰模式
Task 14 数据库接入
Task 15 微信登录
Task 16 通知能力
Task 17 异常状态
Task 18 QA
```

未经明确要求，不应跳过前置阶段。
