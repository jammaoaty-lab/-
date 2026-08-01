import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/app_theme.dart';
import '../../../core/constants.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _controller = TextEditingController();
  bool _agree = false;
  String? _passwordStrength;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _checkStrength(String value) {
    if (value.length < 6) {
      setState(() => _passwordStrength = 'weak');
    } else if (value.length < 10 ||
        !value.contains(RegExp(r'[A-Za-z]')) ||
        !value.contains(RegExp(r'[0-9]'))) {
      setState(() => _passwordStrength = 'medium');
    } else {
      setState(() => _passwordStrength = 'strong');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('注册账号')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppSpacing.xl),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            TextField(
              controller: _controller,
              keyboardType: TextInputType.phone,
              decoration: const InputDecoration(
                hintText: '请输入手机号或邮箱',
                prefixIcon: Icon(Icons.person_outline_rounded),
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              keyboardType: TextInputType.number,
              decoration: InputDecoration(
                hintText: '请输入验证码',
                prefixIcon: const Icon(Icons.sms_outlined),
                suffixIcon: TextButton(
                  onPressed: () {},
                  child: const Text('获取验证码'),
                ),
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              obscureText: true,
              onChanged: _checkStrength,
              decoration: InputDecoration(
                hintText: '设置密码（至少 6 位，建议含字母和数字）',
                prefixIcon: const Icon(Icons.lock_outline_rounded),
              ),
            ),
            if (_passwordStrength != null) ...[
              const SizedBox(height: 12),
              _PasswordStrengthBar(strength: _passwordStrength!),
            ],
            const SizedBox(height: 16),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Checkbox(
                  value: _agree,
                  activeColor: AppColors.primary,
                  onChanged: (value) =>
                      setState(() => _agree = value ?? false),
                ),
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.only(top: 10),
                    child: RichText(
                      text: const TextSpan(
                        style: TextStyle(
                          fontSize: 12,
                          color: AppColors.textSecondary,
                          height: 1.5,
                        ),
                        children: [
                          TextSpan(text: '我已阅读并同意'),
                          TextSpan(
                            text: '《用户协议》',
                            style: TextStyle(color: AppColors.primary),
                          ),
                          TextSpan(text: '和'),
                          TextSpan(
                            text: '《隐私政策》',
                            style: TextStyle(color: AppColors.primary),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _agree
                  ? () {
                      context.go(AppConstants.routeHome);
                    }
                  : null,
              child: const SizedBox(
                width: double.infinity,
                child: Center(child: Text('注册')),
              ),
            ),
            const SizedBox(height: 16),
            Center(
              child: TextButton(
                onPressed: () {},
                child: const Text('已有账号？去登录'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _PasswordStrengthBar extends StatelessWidget {
  const _PasswordStrengthBar({required this.strength});

  final String strength;

  @override
  Widget build(BuildContext context) {
    final (color, label) = switch (strength) {
      'weak' => (AppColors.danger, '弱'),
      'medium' => (AppColors.warning, '中'),
      _ => (AppColors.success, '强'),
    };

    return Row(
      children: [
        Expanded(
          child: ClipRRect(
            borderRadius: BorderRadius.circular(3),
            child: LinearProgressIndicator(
              value: strength == 'weak'
                  ? 0.33
                  : strength == 'medium'
                      ? 0.66
                      : 1.0,
              minHeight: 6,
              color: color,
              backgroundColor: AppColors.surfaceMuted,
            ),
          ),
        ),
        const SizedBox(width: 8),
        Text(
          '密码强度：$label',
          style: TextStyle(fontSize: 12, color: color),
        ),
      ],
    );
  }
}
