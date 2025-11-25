const path = require('path');

module.exports = {
  plugins: [
    require('postcss-import')({
      // Đảm bảo rằng PostCSS sẽ resolve @import từ thư mục 'src/assets/css'
      path: [path.resolve(__dirname, 'src/assets/css')]
    }),
    require('tailwindcss'),
    require('autoprefixer'),
  ],
};
