import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:shanye_outdoor/app.dart';

void main() {
  testWidgets('App builds and shows splash', (WidgetTester tester) async {
    await tester.pumpWidget(const ProviderScope(child: ShanyeApp()));
    await tester.pump();

    expect(find.text('山野户外'), findsWidgets);

    // 等待 Splash 定时器完成导航
    await tester.pump(const Duration(seconds: 2));
  });
}
