import 'package:flutter/material.dart';

import '../../../core/app_theme.dart';
import '../../../core/constants.dart';
import '../../widgets/credit_badge.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('我的'),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings_outlined),
            tooltip: '设置',
            onPressed: () {},
          ),
          const SizedBox(width: 4),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        children: const [
          _ProfileHeader(),
          SizedBox(height: AppSpacing.xl),
          _StatsBoard(),
          SizedBox(height: AppSpacing.xl),
          _MenuSection(),
        ],
      ),
    );
  }
}

class _ProfileHeader extends StatelessWidget {
  const _ProfileHeader();

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        CircleAvatar(
          radius: 36,
          backgroundColor: AppColors.primary,
          child: const Icon(Icons.person, size: 40, color: Colors.white),
        ),
        const SizedBox(width: AppSpacing.lg),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                '山野行者',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 4),
              const Text(
                '重装徒步爱好者 · 登过 12 座山',
                style: TextStyle(
                  fontSize: 13,
                  color: AppColors.textSecondary,
                ),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 3,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.primaryLight.withValues(alpha: 0.25),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: const Text(
                      '进阶',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: AppColors.primaryDark,
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  CreditBadge(score: 980, compact: true),
                ],
              ),
            ],
          ),
        ),
        IconButton(
          icon: const Icon(Icons.edit_outlined, color: AppColors.textSecondary),
          tooltip: '编辑资料',
          onPressed: () {},
        ),
      ],
    );
  }
}

class _StatsBoard extends StatelessWidget {
  const _StatsBoard();

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: AppSpacing.lg),
        child: Row(
          children: const [
            _StatCell(value: '14', label: '徒步次数'),
            _StatCell(value: '286', label: '公里'),
            _StatCell(value: '18400', label: '爬升(m)'),
            _StatCell(value: '120', label: '关注'),
          ],
        ),
      ),
    );
  }
}

class _StatCell extends StatelessWidget {
  const _StatCell({required this.value, required this.label});

  final String value;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        children: [
          Text(
            value,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w800,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: const TextStyle(
              fontSize: 11,
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }
}

class _MenuSection extends StatelessWidget {
  const _MenuSection();

  @override
  Widget build(BuildContext context) {
    const groups = [
      [
        (Icons.edit_note_rounded, '我的笔记'),
        (Icons.route_rounded, '我的轨迹'),
        (Icons.backpack_rounded, '我的装备'),
        (Icons.shopping_bag_outlined, '背包'),
      ],
      [
        (Icons.groups_rounded, '我的活动'),
        (Icons.volunteer_activism_outlined, '借用管理'),
        (Icons.bookmark_border_rounded, '收藏'),
        (Icons.history_rounded, '浏览历史'),
        (Icons.favorite_border_rounded, '愿望单'),
      ],
      [
        (Icons.workspace_premium_rounded, '成就墙'),
        (Icons.download_for_offline_outlined, '离线地图'),
        (Icons.dark_mode_outlined, '深色模式'),
      ],
    ];

    return Column(
      children: groups.asMap().entries.map((entry) {
        final index = entry.key;
        final items = entry.value;
        return Column(
          children: [
            Card(
              child: Column(
                children: items.asMap().entries.map((itemEntry) {
                  final itemIndex = itemEntry.key;
                  final item = itemEntry.value;
                  return Column(
                    children: [
                      if (itemIndex > 0) const Divider(indent: 52),
                      ListTile(
                        leading: Icon(item.$1,
                            color: AppColors.primary, size: 22),
                        title: Text(
                          item.$2,
                          style: const TextStyle(
                            fontSize: 14,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        trailing: const Icon(
                          Icons.chevron_right_rounded,
                          color: AppColors.textHint,
                        ),
                        onTap: () {},
                      ),
                    ],
                  );
                }).toList(),
              ),
            ),
            if (index < groups.length - 1) const SizedBox(height: AppSpacing.lg),
          ],
        );
      }).toList(),
    );
  }
}
