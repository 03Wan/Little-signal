# 小信号 V1 验收标准

## 1. 验收原则

一个功能只有同时满足：

```text
视觉
+
交互
+
状态
+
异常处理
+
基础测试
```

才算完成。

只有静态 UI，不算功能完成。

---

## 2. 启动页

### SPLASH-001

Given：首次进入小程序。

Then 显示：

- Signal Orb
- 小信号
- 核心文案
- 开始使用
- 隐私说明

### SPLASH-002

When：点击「开始使用」。

Then：

- 未登录 → 登录流程
- 已登录但未建立关系 → 建立关系
- 存在 active relationship → 首页

---

## 3. 建立关系

### REL-001

Given：用户没有 active relationship。

Then 显示：

- 创建连接
- 输入邀请码

### REL-002

When：点击创建连接。

Then：

生成有效 RelationshipInvite，并显示：

- QR Code
- 邀请码
- 过期时间
- 发给微信好友
- 复制邀请码

### REL-003

When：邀请码已经过期。

Then：

不得建立关系。

显示：

> 邀请已经失效。

并提供：

> 重新生成邀请。

### REL-004

When：对方接受有效邀请。

Then：

双方创建同一个 active Relationship，并进入绑定成功页。

---

## 4. 首页

### HOME-001

Given：用户存在 active relationship。

Then 首页必须显示：

- Partner 昵称
- 今日 Mood
- Signal Orb
- 发个信号
- 今日简要信息
- TabBar

### HOME-002

When：点击 Signal Orb。

Then：

300ms 内出现 Signal Picker。

### HOME-003

When：双击 Signal Orb。

Then：

直接触发：

```text
knock
```

不得显示 Signal Picker。

### HOME-004

When：长按 Signal Orb。

Then：

显示 Quick Signal Wheel。

### HOME-005

When：长按后滑向某个 Signal 并松手。

Then：

发送对应 Signal。

---

## 5. Signal Picker

### SIGNAL-001

至少支持：

```text
想到你了
抱一下
今天有点累
今天挺开心
到家了
晚安
敲一下
```

### SIGNAL-002

When：点击任意 Signal。

Then：

直接发送，不得再次弹出确认框。

### SIGNAL-003

Given：用户勾选「不需要回复」。

When：发送 Signal。

Then：

```text
signal.noReply === true
```

---

## 6. 发送动画

### SEND-001

When：Signal 提交开始。

Then：

Orb 进入发送状态，并禁止短时间重复点击。

### SEND-002

When：发送成功。

Then：

显示：

> 信号已经送出

并执行：

- 一次轻震
- 一次波纹动画

### SEND-003

When：发送失败。

Then：

显示：

> 还没有送出去

提供：

- 再试一次
- 稍后发送

---

## 7. 收到信号

### RECEIVE-001

Given：收到 `thinking_of_you`。

Then 显示：

- Sender
- Signal Orb
- 刚刚想到了你
- 时间
- 回应操作

### RECEIVE-002

Given：

```text
noReply = true
```

Then：

显示：

> 不用回复

不得显示回应按钮。

---

## 8. 回应

### RESPONSE-001

普通 Signal 至少支持：

```text
接住了
我也在
抱一下
稍后回应
```

### RESPONSE-002

When：接收方点击回应。

Then：

创建 SignalResponse。

发送方能够看到：

> TA 接住了你的信号

### RESPONSE-003

不得展示：

```text
已读未回
回复速度
回复排名
```

---

## 9. 今日状态

### MOOD-001

每天支持：

```text
今天很好
还不错
有点累
心情不好
想安静一下
可以找我
晚点找我
```

### MOOD-002

When：用户选择一个状态。

Then：

立即保存，不得再次确认。

### MOOD-003

When：用户当天再次设置 Mood。

Then：

更新当天 Mood，不得创建多个当前状态。

---

## 10. 自定义暗号

### CUSTOM-001

Relationship 最多支持：

```text
10 个启用中的暗号
```

### CUSTOM-002

新建暗号必须包含：

- 图标
- 名称
- 含义

### CUSTOM-003

暗号只允许 Relationship 双方查看。

---

## 11. 时间轴

### TIMELINE-001

按：

```text
createdAt DESC
```

显示。

### TIMELINE-002

每条记录至少展示：

- 时间
- Signal 图标
- Sender
- Signal 描述

### TIMELINE-003

不得使用传统聊天气泡布局。

---

## 12. 星图

### STAR-001

每一个 Signal 对应一个视觉点。

### STAR-002

完成 Response 的 Signal 可以使用更高亮状态。

### STAR-003

点击星点显示 Signal Detail Sheet。

### STAR-004

禁止显示：

- 双方数量对比
- 主动率
- 回复率
- 亲密度

---

## 13. 照片信号

### PHOTO-001

一次只能上传 1 张图片。

### PHOTO-002

caption 最长：

```text
20 个汉字
```

### PHOTO-003

支持：

```text
永久
24小时
查看一次
```

### PHOTO-004

上传失败时不得丢失用户已经输入的 caption 和设置。

---

## 14. 时光胶囊

### CAPSULE-001

创建必须设置：

```text
unlockAt
```

### CAPSULE-002

当：

```text
currentTime < unlockAt
```

不得读取 Capsule 正文，服务端也必须限制。

### CAPSULE-003

未到时间显示：

> 还不能打开

### CAPSULE-004

到达时间显示：

> 有一个过去的信号正在等你打开

---

## 15. 现在方便吗

### AVAILABLE-001

接收方至少支持：

```text
现在可以
晚一点
今天有点忙
```

### AVAILABLE-002

选择「现在可以」：

发送方显示：

> TA 现在有空。

### AVAILABLE-003

可以提供：

```text
去微信找 TA
```

但不得在小程序内加入聊天系统。

---

## 16. 勿扰

### QUIET-001

用户可以设置：

```text
quietStart
quietEnd
```

### QUIET-002

勿扰期间 Signal 数据仍正常保存，仅控制提醒行为。

---

## 17. 网络异常

### NETWORK-001

When：发送期间断网。

Then：

Signal 状态：

```text
failed
```

### NETWORK-002

用户可以选择：

```text
再试一次
```

### NETWORK-003

如果用户选择「稍后发送」，不得在数小时后自动发送旧的情绪信号。

恢复网络时应询问：

> 有一个信号还没有送出。

由用户决定。

---

## 18. 防骚扰

### RATE-001

同一用户：

```text
5 秒内最多成功发送 1 个 Signal
```

### RATE-002

短时间大量 `knock`：

前端和展示层应合并，例如：

```text
5 个小信号
```

而不是连续震动 5 次。

---

## 19. 关系解除

### END-001

点击「解除连接」必须二次确认。

### END-002

文案必须中立。

允许：

> 解除后，你们将无法继续互发信号。

禁止：

> 你真的舍得离开 TA 吗？

### END-003

解除后：

```text
Relationship.status = ended
```

### END-004

双方不得继续：

- 发送 Signal
- 修改共享暗号
- 创建共享 Capsule

---

## 20. 未绑定状态

### UNBOUND-001

用户没有 active relationship 时：

显示 Empty State。

不得显示上一段关系相关情绪文案。

---

## 21. TabBar

### TAB-001

必须只有：

```text
信号
足迹
我们
```

### TAB-002

TabBar 全局视觉统一。

---

## 22. Dark Mode

### DARK-001

核心页面必须保证：

- 文本可读
- 卡片层级清晰
- Signal Glow 不刺眼
- 图片正常显示

---

## 23. Loading

### LOAD-001

网络请求低于约 500ms：

不建议闪现 Loading。

### LOAD-002

持续请求使用轻量呼吸动画。

---

## 24. Permission Denied

涉及相机、相册、通知。

用户拒绝时：

必须解释功能影响。

例如：

> 无法访问相册，因此暂时不能发送照片信号。

提供：

- 重新授权
- 返回

不得阻塞其他功能。

---

## 25. 隐私

### PRIVACY-001

Relationship 内容不得被非成员访问。

### PRIVACY-002

必须验证当前用户属于目标 Relationship。

---

## 26. UI 验收

所有页面必须符合：

`DESIGN_SYSTEM.md`

重点检查：

- 页面边距
- 字号
- 圆角
- Button Height
- Signal Orb
- TabBar
- Bottom Sheet
- Dark Mode

---

## 27. 性能

首页核心内容应尽可能快速显示。

Signal Picker 交互响应目标：

```text
< 300ms
```

核心点击反馈：

```text
< 100ms
```

---

## 28. MVP 完成定义

只有下列闭环可完整运行：

```text
用户 A
↓
发送 Signal
↓
用户 B 收到
↓
用户 B 接住
↓
用户 A 看到回应
```

并且已经处理：

- Loading
- Error
- Offline
- 防重复点击

才可以称：

```text
Core Signal MVP Complete
```

仅仅能够点击按钮打印 `console.log`，不得标记完成。
