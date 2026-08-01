# 山野户外 (shanye_outdoor)

专业户外徒步登山社交与智能协作平台。核心闭环：行前智能规划（装备打包、队友匹配、风险预评）→ 行中安全记录（离线轨迹、航点、风险提醒）→ 行后沉淀分享（笔记、装备评价、信用结算）→ 社交发现与推荐驱动下一次出行。

## 技术栈

- Flutter 3.44+ / Dart 3.12+
- flutter_riverpod：状态管理
- go_router：路由
- Android 优先，iOS 预留

## 项目结构

```
lib/
├── main.dart            # 入口
├── app.dart             # 应用根组件与路由配置
├── core/
│   ├── constants.dart   # 全局常量与路由名
│   └── app_theme.dart   # 主题（户外风格配色）
├── ui/
│   ├── screens/
│   │   ├── splash/          # 启动页
│   │   ├── onboarding/      # 引导页
│   │   ├── auth/            # 登录/注册
│   │   ├── main/            # 底部导航壳
│   │   ├── home/            # 首页（推荐 Feed）
│   │   ├── notes/           # 笔记（分享/日志/评测）
│   │   ├── gear/            # 装备与背包
│   │   ├── trajectory/      # 轨迹记录
│   │   ├── team/            # 组队协作
│   │   └── profile/         # 个人中心
│   └── widgets/
│       ├── common/          # 加载/错误/空状态
│       ├── risk_indicator.dart
│       └── credit_badge.dart
```

## 底部导航

首页 · 轨迹 · 笔记 · 组队 · 我的（五个 Tab，StatefulShellRoute 保持各页状态）

## 开发进度

当前阶段：UI 框架已搭建（主题、路由、底部导航、各主页面骨架、认证页）。后续按开发方案推进：数据库层（Drift SQLite）、装备系统、笔记双模式、轨迹记录、组队与信用体系。

## 运行

```bash
flutter pub get
flutter run
```

## 验证

```bash
flutter analyze
flutter test
flutter build apk --debug
```
