/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        // 主品牌高亮色
        primary: "#00C8E0",
        // 页面背景渐变色
        "bg-light": "#F8FCFF",
        "bg-dark": "#E6F7FF",
        // 深色运营Banner底色
        "banner-dark": "#1A2333",
        // 盈利/收入文字
        "profit-red": "#F53F3F",
        // 支出/冻结文字
        "expense-dark": "#1D2129",
        // 标签底色
        "tag-light": "#F2F3F5",
        "tag-primary": "#E6F7FF",
        // 文字层级
        "text-primary": "#1D2129",
        "text-secondary": "#4E5969",
        "text-tertiary": "#86909C",
        "text-placeholder": "#C9CDD4",
      },
      borderRadius: {
        // 大容器卡片
        "card-large": "24px",
        // 列表任务卡片
        "card-task": "20px",
        // 胶囊按钮
        "btn-capsule": "16px",
        // 输入框
        "input": "14px",
        // 小标签
        "tag": "10px",
        // 弹窗底部圆角
        "modal": "28px",
      },
      boxShadow: {
        // 普通卡片阴影
        "card": "0 2px 12px rgba(0,200,224,0.06)",
        // 悬浮按钮/Banner阴影
        "float": "0 4px 18px rgba(0,200,224,0.12)",
      },
      fontSize: {
        // 标题22sp
        "title": ["22px", { lineHeight: "1.3", fontWeight: "700" }],
        // 模块标题18sp
        "subtitle": ["18px", { lineHeight: "1.4", fontWeight: "400" }],
        // 正文15sp
        "body": ["15px", { lineHeight: "1.5", fontWeight: "400" }],
        // 标签小字12sp
        "caption": ["12px", { lineHeight: "1.4", fontWeight: "400" }],
      },
    },
  },
  plugins: [],
};
