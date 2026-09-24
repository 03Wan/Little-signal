export type ReviewTheme = 'light' | 'dark' | 'system'

export interface ReviewItem {
  id: string
  title: string
  english: string
  section: string
  page: string
  state: string
  icon: string
  routeOnly: boolean
}

export interface ReviewMock {
  partner: string
  mood: string
  message: string
  detail: string
  count: number
  status: string
  signal: string
  points: Array<{ x: number; y: number; size: number; tone: string }>
  records: Array<{ date: string; time: string; title: string; subtitle: string }>
}

let activeTheme: ReviewTheme = 'system'
export function getReviewTheme(): ReviewTheme { return activeTheme }
export function setReviewTheme(theme: ReviewTheme): void { activeTheme = theme }

const groups: Array<{ name: string; items: Array<[string, string, string, string, string]> }> = [
  { name: '核心母版', items: [
    ['splash', '启动页', 'Splash · Default', '/pages/index/index', '小信号 · 有些时候，不是想聊天'],
    ['home-default', '首页', 'Home · Default', '/pages/home/index', '默认 · 今天没有留下状态'],
    ['incoming', '收到信号', 'Signal · Incoming', '/pages/signal/detail', 'Thinking Of You'],
    ['star-map', '足迹星图', 'Footprint · Star Map', '/pages/star/index', '有数据 · 固定 Mock 星点'],
    ['us-home', '我们', 'Us · Home', '/pages/us/index', '关系主页 · 姚闻月']
  ] },
  { name: '基础', items: [
    ['bind', '建立关系', 'Relationship · Bind', '/pages/bind/index', '创建连接 / 输入邀请码'],
    ['invite', '邀请页', 'Invite · Waiting', '/pages/invite/index', '邀请等待'],
    ['bind-success', '绑定成功', 'Relationship · Bound', '/pages/bind-success/index', '绑定成功']
  ] },
  { name: '信号', items: [
    ['home-default', '首页 / 默认', 'Home · Default', '/pages/home/index', '姚闻月 · 今天没有留下状态'],
    ['home-tired', '首页 / 今天有点累', 'Home · Tired', '/pages/home/index', '☁ 今天有点累'],
    ['home-quiet', '首页 / 想安静一下', 'Home · Quiet', '/pages/home/index', '🌙 今天想安静一下'],
    ['home-incoming', '首页 / 有未接信号', 'Home · Incoming', '/pages/home/index', '存在一个未处理 Signal'],
    ['home-responded', '首页 / 已接住', 'Home · Response Received', '/pages/home/index', '她接住了你的信号'],
    ['home-offline', '首页 / Offline', 'Home · Offline', '/pages/home/index', '网络不可用'],
    ['home-dark', '首页 / Dark', 'Home · Dark', '/pages/home/index', '首页深色模式'],
    ['picker', 'Signal Picker', 'Signal · Picker', '/pages/home/index', '信号选择面板'],
    ['quick-wheel', 'Quick Signal Wheel', 'Signal · Quick Wheel', '/pages/home/index', '快捷信号轮盘'],
    ['sending', '发送中', 'Signal · Sending', '/pages/home/index', '轻量发送状态'],
    ['send-success', '发送成功', 'Signal · Sent', '/pages/home/index', '信号已经送出'],
    ['send-failed', '发送失败', 'Signal · Failed', '/pages/home/index', '还没有送出去 · 再试一次'],
    ['incoming-hug', '收到信号 / Hug', 'Signal · Hug', '/pages/signal/detail', '抱一下'],
    ['incoming-goodnight', '收到信号 / Goodnight', 'Signal · Goodnight', '/pages/signal/detail', '晚安'],
    ['incoming-knock', '收到信号 / Knock', 'Signal · Knock', '/pages/signal/detail', '敲一下'],
    ['incoming-available', '收到信号 / Available', 'Signal · Available', '/pages/signal/detail', '现在方便吗'],
    ['no-reply', '无需回复', 'Signal · No Reply', '/pages/signal/detail', '不用回复'],
    ['already-responded', '已接住', 'Signal · Responded', '/pages/signal/detail', '已经接住了'],
    ['signal-error', '信号错误', 'Signal · Error', '/pages/signal/detail', '回应还没有送出去']
  ] },
  { name: '关系', items: [
    ['unbound', '未绑定', 'Relationship · Unbound', '/pages/unbound/index', '这里暂时很安静'],
    ['invite-waiting', '邀请等待', 'Invite · Waiting', '/pages/invite/index', '等 TA 来这里'],
    ['invite-expired', '邀请失效', 'Invite · Expired', '/pages/invite/enter', '邀请已经失效'],
    ['relationship-ended', '关系解除', 'Relationship · Ended', '/pages/unbound/index', '关系已解除']
  ] },
  { name: '状态', items: [
    ['mood-happy', '今天很好', 'Mood · Happy', '/pages/mood/index', '☀ 今天很好'],
    ['mood-tired', '有点累', 'Mood · Tired', '/pages/mood/index', '☁ 有点累'],
    ['mood-sad', '心情不好', 'Mood · Sad', '/pages/mood/index', '🌧 心情不好'],
    ['mood-quiet', '想安静一下', 'Mood · Quiet', '/pages/mood/index', '🌙 想安静一下'],
    ['mood-later', '晚点找我', 'Mood · Later', '/pages/mood/index', '🟡 晚点找我']
  ] },
  { name: '暗号', items: [
    ['codes', '暗号列表', 'Custom Signals · List', '/pages/code/index', '已有暗号'],
    ['codes-empty', '无暗号', 'Custom Signals · Empty', '/pages/code/index', '你们还没有自己的暗号'],
    ['code-create', '创建暗号', 'Custom Signals · Create', '/pages/code/create', '图标 / 名称 / 含义'],
    ['codes-limit', '达到 10 个上限', 'Custom Signals · Limit', '/pages/code/index', '最多保留 10 个暗号']
  ] },
  { name: '足迹', items: [
    ['star-0', '星图 / 0 个 Signal', 'Star Map · Empty', '/pages/star/index', '0 个 Signal'],
    ['star-3', '星图 / 3 个 Signal', 'Star Map · 3', '/pages/star/index', '3 个 Signal'],
    ['star-20', '星图 / 20 个 Signal', 'Star Map · 20', '/pages/star/index', '20 个 Signal'],
    ['star-50', '星图 / 50 个 Signal', 'Star Map · 50', '/pages/star/index', '50 个 Signal'],
    ['timeline', '时间轴 / 有数据', 'Timeline · Filled', '/pages/timeline/index', '今天 / 昨天 / 更早 · 回应 / 无回应 / 照片 / 暗号'],
    ['timeline-empty', '时间轴 / 空状态', 'Timeline · Empty', '/pages/timeline/index', '还没有留下信号'],
    ['signal-detail', 'Signal Detail', 'Signal · Detail', '/pages/signal/detail', '时间 / 信号 / 回应']
  ] },
  { name: '照片', items: [
    ['photo-edit', '照片信号编辑', 'Photo · Edit', '/pages/moment/index', '选择照片 / 保存方式'],
    ['photo-uploading', '上传中', 'Photo · Uploading', '/pages/moment/index', '图片正在上传'],
    ['photo-failed', '上传失败', 'Photo · Failed', '/pages/moment/index', '保留图片与描述'],
    ['photo-once', '查看一次', 'Photo · View Once', '/pages/moment/index', '查看一次'],
    ['photo-denied', '权限拒绝', 'Photo · Permission Denied', '/pages/moment/index', '无法访问相册']
  ] },
  { name: '胶囊', items: [
    ['capsules', '胶囊列表', 'Capsule · List', '/pages/capsule/index', 'Locked / Unlocked / Opened'],
    ['capsules-empty', '空状态', 'Capsule · Empty', '/pages/capsule/index', '还没有留给未来的话'],
    ['capsule-7d', 'Locked · 7 天后', 'Capsule · Locked', '/pages/capsule/detail', '7 天后解锁'],
    ['capsule-tomorrow', 'Locked · 明天', 'Capsule · Locked', '/pages/capsule/detail', '明天解锁'],
    ['capsule-unlocked', 'Unlocked', 'Capsule · Unlocked', '/pages/capsule/detail', '有一个过去的信号正在等你打开'],
    ['capsule-opened', 'Opened', 'Capsule · Opened', '/pages/capsule/detail', '已打开'],
    ['capsule-create', '创建胶囊', 'Capsule · Create', '/pages/capsule/create', '选择未来解锁日期']
  ] },
  { name: '我们', items: [
    ['us-home', '我们主页', 'Us · Home', '/pages/us/index', '关系主页'],
    ['notification', '通知与勿扰', 'Settings · Notifications', '/pages/settings/notification', '通知 / 勿扰模式'],
    ['privacy', '隐私设置', 'Settings · Privacy', '/pages/privacy/index', '隐私说明 / 历史保留'],
    ['relationship-settings', '关系设置', 'Settings · Relationship', '/pages/relationship/index', '关系信息'],
    ['relationship-confirm', '解除关系确认', 'Relationship · Confirm End', '/pages/relationship/index', '解除后，你们将无法继续互发信号']
  ] },
  { name: '系统状态', items: [
    ['loading', 'Loading', 'System · Loading', '/pages/home/index', '轻量呼吸状态'],
    ['empty', 'Empty', 'System · Empty', '/pages/timeline/index', '还没有留下信号'],
    ['error', 'Error', 'System · Error', '/pages/timeline/index', '请求失败 · 再试一次'],
    ['offline', 'Offline', 'System · Offline', '/pages/home/index', '当前网络不可用'],
    ['permission-denied', 'Permission Denied', 'System · Permission Denied', '/pages/moment/index', '功能权限暂不可用'],
    ['disabled', 'Disabled', 'System · Disabled', '/pages/code/index', '当前操作不可用']
  ] },
  { name: '主题', items: [
    ['theme-light', 'Light Mode', 'Theme · Light', '/pages/dev/ui-review/preview', '浅色主题巡检'],
    ['theme-dark', 'Dark Mode', 'Theme · Dark', '/pages/dev/ui-review/preview', '深色主题巡检']
  ] },
  { name: '其余真实路由', items: [
    ['route-login', '登录', 'Real Route · Login', '/pages/login/index', '微信登录页面'],
    ['route-invite-confirm', '确认邀请', 'Real Route · Invite Confirm', '/pages/invite/confirm', '邀请确认页面'],
    ['route-send', '发送信号', 'Real Route · Send', '/pages/send/index', '独立发送页面'],
    ['route-history', '足迹', 'Real Route · Footprint', '/pages/history/index', '真实底部导航页面'],
    ['route-monthly', '月度回顾', 'Real Route · Monthly', '/pages/monthly/index', '月度回顾页面'],
    ['route-settings', '设置', 'Real Route · Settings', '/pages/settings/index', '设置入口']
  ] }
]

export const REVIEW_GROUPS = groups.map((group) => ({
  name: group.name,
  items: group.items.map(([id, title, english, page, state]) => ({
    id, title, english, section: group.name, page, state, routeOnly: id.startsWith('route-'),
    icon: group.name === '核心母版' ? '✦' : group.name === '足迹' ? '·' : group.name === '胶囊' ? '◌' : '◉'
  } satisfies ReviewItem))
}))

export const REVIEW_ITEMS: ReviewItem[] = REVIEW_GROUPS.reduce<ReviewItem[]>((all, group) => all.concat(group.items), [])

const seededPoints = Array.from({ length: 50 }, (_, index) => ({
  x: 8 + (index * 37 + 13) % 84,
  y: 8 + (index * 53 + 27) % 84,
  size: 3 + (index * 7) % 4,
  tone: index % 3 === 0 ? 'warm' : index % 3 === 1 ? 'blue' : 'core'
}))

export function createHomeDefaultMock(): ReviewMock { return createReviewMock('home-default') }
export function createHomeTiredMock(): ReviewMock { return createReviewMock('home-tired') }
export function createIncomingSignalMock(): ReviewMock { return createReviewMock('incoming') }
export function createNoReplySignalMock(): ReviewMock { return createReviewMock('no-reply') }
export function createTimelineMock(): ReviewMock { return createReviewMock('timeline') }
export function createStarMapMock(count: 0 | 3 | 20 | 50): ReviewMock { return { ...createReviewMock(`star-${count}`), count, points: seededPoints.slice(0, count) } }
export function createLockedCapsuleMock(days: number): ReviewMock { return { ...createReviewMock('capsule-7d'), detail: `还有 ${days} 天解锁`, status: 'locked' } }
export function createUnlockedCapsuleMock(): ReviewMock { return { ...createReviewMock('capsule-unlocked'), status: 'unlocked' } }

export function createReviewMock(id: string): ReviewMock {
  const labels: Record<string, string> = {
    'home-default': '今天没有留下状态', 'home-tired': '☁ 今天有点累', 'home-quiet': '🌙 今天想安静一下',
    'home-incoming': '有一个未处理信号', 'home-responded': '她接住了你的信号', 'home-offline': '网络不可用',
    incoming: '刚刚想到了你', 'incoming-hug': '抱一下', 'incoming-goodnight': '晚安', 'incoming-knock': '敲了一下',
    'incoming-available': '现在方便吗', 'no-reply': '不用回复', 'already-responded': '已回应：接住了',
    'signal-error': '回应还没有送出去', timeline: '今天 / 昨天 / 更早的信号', 'timeline-empty': '还没有留下信号',
    'capsule-7d': '还有 7 天解锁', 'capsule-tomorrow': '明天解锁', 'capsule-unlocked': '有一个过去的信号正在等你打开',
    'capsule-opened': '已打开', 'offline': '当前网络不可用', error: '请求失败，请再试一次', loading: '正在轻轻靠近…'
  }
  const starCount = id === 'star-0' ? 0 : id === 'star-3' ? 3 : id === 'star-20' ? 20 : id === 'star-50' ? 50 : id === 'star-map' ? 20 : 0
  return {
    partner: '姚闻月',
    mood: id.includes('tired') ? '☁ 今天有点累' : id.includes('quiet') ? '🌙 今天想安静一下' : '今天没有留下状态',
    message: labels[id] ?? REVIEW_ITEMS.find((item) => item.id === id)?.state ?? '这一刻，我想到了你',
    detail: id === 'invite-expired' ? '邀请已经失效。' : id.startsWith('capsule') ? labels[id] ?? '为未来留下一点心意' : '有些时候，不是想聊天，只是突然想到了一个人。',
    count: starCount,
    status: id.includes('failed') || id === 'error' ? 'error' : id === 'offline' || id === 'home-offline' ? 'offline' : 'ready',
    signal: id.includes('hug') ? '抱一下' : id.includes('goodnight') ? '晚安' : id.includes('knock') ? '敲一下' : '想到你了',
    points: seededPoints.slice(0, starCount),
    records: [
      { date: '今天', time: '21:16', title: '晚安', subtitle: '姚闻月 · 已接住' },
      { date: '昨天', time: '18:21', title: '到家了', subtitle: '王波 · 无需回复' },
      { date: '9 月 18 日', time: '20:04', title: '照片信号', subtitle: '姚闻月 · 一张傍晚的天空' },
      { date: '9 月 17 日', time: '23:41', title: '🌻 暗号', subtitle: '王波 · 想见你' }
    ]
  }
}
