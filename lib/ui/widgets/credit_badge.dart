import 'package:flutter/material.dart';

import '../../core/app_theme.dart';

/// 信用分徽章
/// score >= 950 极佳, >= 900 优秀, >= 850 良好, else 待提升
class CreditBadge extends StatelessWidget {
  const CreditBadge({
    super.key,
    required this.score,
    this.compact = false,
  });

  final int score;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    final (label, color) = switch (score) {
      >= 950 => ('极佳', AppColors.success),
      >= 900 => ('优秀', Color(0xFF3E9ED8)),
      >= 850 => ('良好', AppColors.accent),
      _ => ('待提升', AppColors.warning),
    };

    if (compact) {
      return Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.workspace_premium_rounded, size: 14, color: color),
          const SizedBox(width: 2),
          Text(
            '$score',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: color,
            ),
          ),
        ],
      );
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withValues(alpha: 0.4)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.workspace_premium_rounded, size: 16, color: color),
          const SizedBox(width: 6),
          Text(
            '信用分 $score · $label',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}
