import type { editor } from 'monaco-editor';

// 「深空星云」— 默认主题
export const deepSpaceTheme: editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    // 关键字
    { token: 'keyword', foreground: 'B388FF', fontStyle: 'bold' },
    { token: 'keyword.control', foreground: 'B388FF', fontStyle: 'bold' },
    { token: 'keyword.operator', foreground: '00E5FF' },
    // 字符串
    { token: 'string', foreground: 'FFD166' },
    { token: 'string.quoted', foreground: 'FFD166' },
    { token: 'string.template', foreground: 'FFD166' },
    // 数字
    { token: 'number', foreground: '00E5FF' },
    { token: 'number.hex', foreground: '00E5FF' },
    { token: 'number.float', foreground: '00E5FF' },
    // 注释
    { token: 'comment', foreground: '5A6780', fontStyle: 'italic' },
    { token: 'comment.line', foreground: '5A6780', fontStyle: 'italic' },
    { token: 'comment.block', foreground: '5A6780', fontStyle: 'italic' },
    { token: 'comment.documentation', foreground: '5A6780', fontStyle: 'italic' },
    // 函数/类名
    { token: 'type.identifier', foreground: 'F0F3FA' },
    { token: 'entity.name.class', foreground: 'F0F3FA' },
    { token: 'entity.name.function', foreground: 'F0F3FA' },
    { token: 'entity.name.type', foreground: 'F0F3FA' },
    // 变量
    { token: 'variable', foreground: 'C5CDE0' },
    { token: 'variable.parameter', foreground: 'FF9100' },
    // 常量
    { token: 'constant', foreground: '00F2A9' },
    { token: 'constant.language', foreground: 'E040FB' },
    // 标签/属性 (JSX/HTML)
    { token: 'tag', foreground: '6C5CE7' },
    { token: 'metatag', foreground: '6C5CE7' },
    { token: 'attribute.name', foreground: 'FFD166' },
    { token: 'attribute.value', foreground: 'FFD166' },
    // 正则
    { token: 'regexp', foreground: 'FF6B6B' },
    // 分隔符
    { token: 'delimiter', foreground: '8899AA' },
    { token: 'delimiter.bracket', foreground: '8899AA' },
    { token: 'delimiter.parenthesis', foreground: '8899AA' },
  ],
  colors: {
    'editor.background': '#030614',
    'editor.foreground': '#C5CDE0',
    'editor.lineHighlightBackground': '#0A10301A',
    'editor.lineHighlightBorder': '#0A1030',
    'editor.selectionBackground': '#6C5CE730',
    'editor.selectionHighlightBackground': '#6C5CE720',
    'editor.inactiveSelectionBackground': '#6C5CE710',
    'editorCursor.foreground': '#00E5FF',
    'editorIndentGuide.background': '#1A1F35',
    'editorIndentGuide.activeBackground': '#2A2F45',
    'editorLineNumber.foreground': '#3A4560',
    'editorLineNumber.activeForeground': '#6C5CE7',
    'editorGutter.background': '#030614',
    'editorBracketMatch.background': '#6C5CE720',
    'editorBracketMatch.border': '#6C5CE760',
    'editorWidget.background': '#0D1020',
    'editorWidget.border': '#2A2F45',
    'editorSuggestWidget.background': '#0D1020DD',
    'editorSuggestWidget.border': '#6C5CE740',
    'editorSuggestWidget.selectedBackground': '#6C5CE725',
    'editorSuggestWidget.highlightForeground': '#B388FF',
    'editorHoverWidget.background': '#0D1020EE',
    'editorHoverWidget.border': '#6C5CE740',
    'editorError.foreground': '#FF6B6B',
    'editorWarning.foreground': '#FFD166',
    'editorInfo.foreground': '#00E5FF',
    'minimap.background': '#030614',
    'scrollbar.shadow': '#00000000',
    'scrollbarSlider.background': '#2A2F4550',
    'scrollbarSlider.hoverBackground': '#3A456050',
    'scrollbarSlider.activeBackground': '#4A556050',
    'input.background': '#0D1020',
    'input.border': '#2A2F45',
    'focusBorder': '#6C5CE760',
    'list.activeSelectionBackground': '#6C5CE720',
    'list.hoverBackground': '#1A1F3510',
    'sideBar.background': '#030614',
    'sideBar.border': '#1A1F35',
    'activityBar.background': '#030614',
    'statusBar.background': '#030614',
    'statusBar.foreground': '#8899AA',
    'titleBar.activeBackground': '#030614',
  },
};

// 「类星体暗」— 更柔和的暗色
export const quasarDarkTheme: editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'keyword', foreground: '9B8AFF' },
    { token: 'string', foreground: 'E8C547' },
    { token: 'number', foreground: '5EEAD4' },
    { token: 'comment', foreground: '636D83', fontStyle: 'italic' },
    { token: 'type.identifier', foreground: 'E2E8F0' },
    { token: 'entity.name.function', foreground: 'E2E8F0' },
    { token: 'variable', foreground: 'B8C5D6' },
    { token: 'tag', foreground: '7C6FF7' },
  ],
  colors: {
    'editor.background': '#0B1120',
    'editor.foreground': '#B8C5D6',
    'editorCursor.foreground': '#5EEAD4',
    'editorLineNumber.foreground': '#334155',
    'editorLineNumber.activeForeground': '#7C6FF7',
    'editor.selectionBackground': '#7C6FF720',
    'editorSuggestWidget.background': '#0F1729DD',
    'editorSuggestWidget.border': '#7C6FF740',
    'editorSuggestWidget.selectedBackground': '#7C6FF725',
    'editorWidget.background': '#0F1729',
    'editorWidget.border': '#1E293B',
    'minimap.background': '#0B1120',
  },
};

// 主題注册函数（在 Monaco 加载后调用）
export function registerCosmosThemes(monaco: any) {
  monaco.editor.defineTheme('deep-space', deepSpaceTheme);
  monaco.editor.defineTheme('quasar-dark', quasarDarkTheme);
}

// Helper to get theme name string for Monaco
export function getMonacoTheme(theme: string): string {
  switch (theme) {
    case 'quasar-dark':
      return 'quasar-dark';
    case 'white-hole':
      return 'vs'; // 使用 VS 内置亮色主题
    case 'deep-space':
    default:
      return 'deep-space';
  }
}