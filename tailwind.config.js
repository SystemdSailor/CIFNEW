/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'custom-blue': '#1E40AF',
        'custom-gray': '#2F2F2F',
      },
      fontFamily: {
        custom: ['MyCustomFont', 'sans-serif'],  // 这里添加你的自定义字体  如果浏览器无法加载第一个字体，则浏览器会尝试下一个字体
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} 