# 小信号数据模型 V1

## 1. 设计原则

数据模型遵循：

- 简单
- 可迁移
- 双人关系优先
- 不耦合 UI
- 不记录无必要敏感数据

所有时间字段统一使用 UTC Timestamp，前端展示时转本地时间。

---

## 2. User

```ts
export interface User {
  id: string
  openId?: string
  nickname: string
  avatarUrl?: string
  createdAt: number
  updatedAt: number
  status: UserStatus
}

export type UserStatus =
  | 'active'
  | 'disabled'
  | 'deleted'
```

---

## 3. Relationship

```ts
export interface Relationship {
  id: string
  userAId: string
  userBId: string
  name?: string
  createdAt: number
  updatedAt: number
  anniversaryDate?: number
  status: RelationshipStatus
}

export type RelationshipStatus =
  | 'pending'
  | 'active'
  | 'ended'
```

V1：

```text
每个用户最多拥有 1 个 active relationship
```

---

## 4. RelationshipInvite

```ts
export interface RelationshipInvite {
  id: string
  inviterId: string
  inviteCode: string
  createdAt: number
  expiresAt: number
  acceptedBy?: string
  acceptedAt?: number
  status: InviteStatus
}

export type InviteStatus =
  | 'pending'
  | 'accepted'
  | 'expired'
  | 'cancelled'
```

邀请码不得作为永久关系凭证。

---

## 5. Signal

```ts
export interface Signal {
  id: string
  relationshipId: string
  senderId: string
  receiverId: string
  type: SignalType
  customSignalId?: string
  message?: string
  imageId?: string
  noReply: boolean
  silent: boolean
  createdAt: number
  receivedAt?: number
  status: SignalStatus
}
```

```ts
export type SignalType =
  | 'thinking_of_you'
  | 'hug'
  | 'tired'
  | 'happy'
  | 'home'
  | 'goodnight'
  | 'knock'
  | 'available'
  | 'custom'
  | 'photo'
```

```ts
export type SignalStatus =
  | 'sending'
  | 'sent'
  | 'received'
  | 'responded'
  | 'failed'
  | 'deleted'
```

---

## 6. SignalResponse

```ts
export interface SignalResponse {
  id: string
  signalId: string
  relationshipId: string
  senderId: string
  receiverId: string
  type: SignalResponseType
  createdAt: number
}
```

```ts
export type SignalResponseType =
  | 'received'
  | 'me_too'
  | 'hug'
  | 'later'
  | 'available_now'
  | 'busy'
```

如果：

```text
signal.noReply === true
```

则不得创建 SignalResponse。

---

## 7. Mood

```ts
export interface Mood {
  id: string
  userId: string
  relationshipId: string
  type: MoodType
  dateKey: string
  createdAt: number
  updatedAt: number
}
```

```ts
export type MoodType =
  | 'great'
  | 'okay'
  | 'tired'
  | 'sad'
  | 'quiet'
  | 'available'
  | 'later'
```

`dateKey` 示例：

```text
2026-09-24
```

每个用户每天只保留 1 条当前 Mood，修改时更新已有记录。

---

## 8. CustomSignal

```ts
export interface CustomSignal {
  id: string
  relationshipId: string
  emoji: string
  name: string
  meaning: string
  createdBy: string
  createdAt: number
  updatedAt: number
  enabled: boolean
}
```

限制：

```text
每个 relationship 最多 10 个 enabled CustomSignal
```

---

## 9. PhotoMoment

```ts
export interface PhotoMoment {
  id: string
  relationshipId: string
  senderId: string
  receiverId: string
  storagePath: string
  caption?: string
  signalType?: SignalType
  expireType: MomentExpireType
  createdAt: number
  expiresAt?: number
  viewedAt?: number
  status: MomentStatus
}
```

```ts
export type MomentExpireType =
  | 'permanent'
  | '24h'
  | 'once'
```

```ts
export type MomentStatus =
  | 'active'
  | 'expired'
  | 'deleted'
```

caption 最多 20 个汉字。

V1 一次只能上传 1 张图片。

---

## 10. Capsule

```ts
export interface Capsule {
  id: string
  relationshipId: string
  senderId: string
  receiverId: string
  content?: string
  imageId?: string
  createdAt: number
  unlockAt: number
  openedAt?: number
  status: CapsuleStatus
}
```

```ts
export type CapsuleStatus =
  | 'locked'
  | 'unlocked'
  | 'opened'
  | 'deleted'
```

服务端必须验证：

```text
currentTime >= unlockAt
```

客户端系统时间不得决定是否可解锁。

---

## 11. NotificationSetting

```ts
export interface NotificationSetting {
  userId: string
  signalEnabled: boolean
  responseEnabled: boolean
  quietHoursEnabled: boolean
  quietStart?: string
  quietEnd?: string
  updatedAt: number
}
```

示例：

```text
quietStart = "23:00"
quietEnd = "08:00"
```

---

## 12. UserPrivacySetting

```ts
export interface UserPrivacySetting {
  userId: string
  allowPhotoMoment: boolean
  allowNotification: boolean
  retainHistoryAfterRelationshipEnd: boolean
  updatedAt: number
}
```

---

## 13. MonthlySummary

月度总结推荐动态生成，不建议初期直接持久化。

```ts
export interface MonthlySummary {
  relationshipId: string
  month: string
  totalSignals: number
  activeDays: number
  photoMomentCount: number
  capsuleCount: number
  customSignalCreated: number
}
```

禁止字段：

```text
userASignalCount
userBSignalCount
moreActiveUser
intimacyScore
```

---

## 14. Repository Interfaces

### SignalRepository

```ts
export interface SignalRepository {
  createSignal(
    input: CreateSignalInput
  ): Promise<Signal>

  getSignal(
    signalId: string
  ): Promise<Signal | null>

  getTimeline(
    relationshipId: string,
    cursor?: string
  ): Promise<Signal[]>

  respond(
    input: CreateSignalResponseInput
  ): Promise<SignalResponse>
}
```

### RelationshipRepository

```ts
export interface RelationshipRepository {
  createInvite(): Promise<RelationshipInvite>

  acceptInvite(
    inviteCode: string
  ): Promise<Relationship>

  getActiveRelationship(
    userId: string
  ): Promise<Relationship | null>

  endRelationship(
    relationshipId: string
  ): Promise<void>
}
```

### MoodRepository

```ts
export interface MoodRepository {
  setMood(
    relationshipId: string,
    userId: string,
    mood: MoodType
  ): Promise<Mood>

  getTodayMood(
    relationshipId: string,
    userId: string
  ): Promise<Mood | null>
}
```

---

## 15. 数据访问控制

任何 relationship 数据查询必须验证：

```text
currentUserId === relationship.userAId
OR
currentUserId === relationship.userBId
```

不能仅依赖前端传入的 `relationshipId` 判断权限。

---

## 16. 图片存储

推荐路径：

```text
relationships/
{relationshipId}/
moments/
{momentId}/
original.jpg
```

时光胶囊：

```text
relationships/
{relationshipId}/
capsules/
{capsuleId}/
image.jpg
```

---

## 17. 删除策略

用户删除时优先软删除：

```text
status = deleted
```

涉及注销账户、隐私数据删除请求时，再根据最终隐私策略进行物理删除。

---

## 18. 防骚扰

同一发送者：

```text
5 秒最多 1 次 Signal
60 秒最多 6 次
```

同类型 knock：

```text
30 秒内自动合并
```

---

## 19. Mock 数据

UI 阶段应提供：

```ts
mockCurrentUser
mockPartner
mockRelationship
mockSignals
mockMoods
mockCapsules
mockCustomSignals
```

禁止页面中直接硬编码 partner 数据。

统一通过 Repository / Store 提供。
