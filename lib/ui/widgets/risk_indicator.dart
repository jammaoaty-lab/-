import 'package:flutter/material.dart';

import '../../core/app_theme.dart';

/// 风险等级指示器
/// level: 1-5 (低/较低/中等/较高/极高)
class RiskIndicator extends StatelessWidget {
  const RiskIndicator({
    super.key,
    required this.level,
    this.showLabel = true,
  });

  final int level;
  final bool showLabel;

  static const _labels = ['低风险', '较低', '中等', '较高', '极高'];
  static const _colors = [
    AppColors.success,
    Color(0xFF8BC34A),
    AppColors.warning,
    AppColors.accent,
    AppColors.danger,
  ];

  @override
  Widget build(BuildContext context) {
    final clamped = level.clamp(1, 5);
    final color = _colors[clamped - 1];

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        for (var i = 1; i <= 5; i++)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 1),
            child: Container(
              width: 6,
              height: 10,
              decoration: BoxDecoration(
                color: i <= clamped ? color : AppColors.surfaceMuted,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
        if (showLabel) ...[
          const SizedBox(width: 6),
          Text(
            _labels[clamped - 1],
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: color,
            ),
          ),
        ],
      ],
    );
  }
}
