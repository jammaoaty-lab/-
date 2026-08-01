import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';

import '../../../core/app_theme.dart';
import '../../../core/constants.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _controller = TextEditingController();
  bool _passwordMode = false;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xl),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 48),
              Container(
                width: 64,
                height: 64,
                decoration: BoxDecoration(
                  color: AppColors.primary,
                  borderRadius: BorderRadius.circular(18),
                ),
                child: const Icon(
                  Icons.landscape_rounded,
                  color: Colors.white,
                  size: 34,
                ),
              ),
              const SizedBox(height: 24),
              const Text(
                '欢迎回来',
                style: TextStyle(
                  fontSize: 26,
                  fontWeight: FontWeight.w800,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                '登录后继续探索山野',
                style: TextStyle(
                  fontSize: 14,
                  color: AppColors.textSecondary,
                ),
              ),
              const SizedBox(height: 32),
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
                obscureText: _passwordMode,
                decoration: InputDecoration(
                  hintText: _passwordMode ? '请输入密码' : '请输入验证码',
                  prefixIcon: const Icon(Icons.lock_outline_rounded),
                  suffixIcon: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      TextButton(
                        onPressed: () {},
                        child: const Text('获取验证码'),
                      ),
                      PopupMenuButton<String>(
                        icon: const Icon(Icons.swap_horiz_rounded),
                        onSelected: (value) {
                          setState(() {
                            _passwordMode = value == 'password';
                          });
                        },
                        itemBuilder: (context) => const [
                          PopupMenuItem(
                            value: 'code',
                            child: Text('验证码登录'),
                          ),
                          PopupMenuItem(
                            value: 'password',
                            child: Text('密码登录'),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () {
                  HapticFeedback.lightImpact();
                  context.go(AppConstants.routeHome);
                },
                child: const SizedBox(
                  width: double.infinity,
                  child: Center(child: Text('登录')),
                ),
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  TextButton(
                    onPressed: () {},
                    child: const Text('注册账号'),
                  ),
                  const Text(
                    '·',
                    style: TextStyle(color: AppColors.textHint),
                  ),
                  TextButton(
                    onPressed: () {},
                    child: const Text('忘记密码'),
                  ),
                ],
              ),
              const SizedBox(height: 32),
              const _DividerWithText('第三方登录'),
              const SizedBox(height: 20),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  _SocialButton(icon: Icons.wechat_rounded, onTap: () {}),
                  const SizedBox(width: AppSpacing.xl),
                  _SocialButton(icon: Icons.g_mobiledata_rounded, onTap: () {}),
                  const SizedBox(width: AppSpacing.xl),
                  _SocialButton(icon: Icons.apple_rounded, onTap: () {}),
                ],
              ),
              const SizedBox(height: 40),
              Center(
                child: TextButton.icon(
                  onPressed: () => context.go(AppConstants.routeHome),
                  icon: const Icon(Icons.wifi_off_rounded, size: 18),
                  label: const Text('离线使用（无需登录）'),
                  style: TextButton.styleFrom(
                    foregroundColor: AppColors.textSecondary,
                  ),
                ),
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}

class _DividerWithText extends StatelessWidget {
  const _DividerWithText(this.text);

  final String text;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        const Expanded(child: Divider()),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12),
          child: Text(
            text,
            style: const TextStyle(
              fontSize: 12,
              color: AppColors.textHint,
            ),
          ),
        ),
        const Expanded(child: Divider()),
      ],
    );
  }
}

class _SocialButton extends StatelessWidget {
  const _SocialButton({required this.icon, required this.onTap});

  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(30),
      child: Container(
        width: 52,
        height: 52,
        decoration: BoxDecoration(
          color: AppColors.surface,
          shape: BoxShape.circle,
          border: Border.all(color: const Color(0xFFDDE5DD)),
        ),
        child: Icon(icon, color: AppColors.textSecondary, size: 26),
      ),
    );
  }
}
