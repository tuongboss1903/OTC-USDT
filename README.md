# USDT P2P Trading Platform

Nền tảng giao dịch P2P USDT an toàn, nhanh chóng và đáng tin cậy. Kết nối người mua và người bán trên toàn thế giới.

## 🚀 Tính năng

- **Giao dịch P2P**: Mua và bán USDT một cách an toàn
- **Quản lý đơn hàng**: Tạo và quản lý các đơn hàng giao dịch
- **Hồ sơ người dùng**: Quản lý thông tin cá nhân và lịch sử giao dịch
- **Nâng cấp tài khoản**: Các gói nâng cấp với nhiều quyền lợi
- **Thống kê thị trường**: Theo dõi biến động giá và volume giao dịch
- **Tích hợp TradingView**: Biểu đồ phân tích kỹ thuật chuyên nghiệp

## 🛠️ Công nghệ sử dụng

- **Frontend Framework**: HTML5, CSS3, JavaScript (ES6+)
- **CSS Framework**: Tailwind CSS 3.4
- **Animation**: GSAP 3.13
- **Charts**: Chart.js 4.5
- **Icons**: Lucide Icons
- **Build Tool**: Node.js với custom build script

## 📦 Cài đặt

### Yêu cầu

- Node.js (v14 trở lên)
- npm hoặc pnpm

### Các bước cài đặt

1. Clone repository:
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd OTC_2_bk
```

2. Cài đặt dependencies:
```bash
npm install
# hoặc
pnpm install
```

3. Build project:
```bash
npm run build
```

4. Development mode (watch files):
```bash
npm run dev
# hoặc
npm run watch
```

## 📜 Scripts

- `npm run build` - Build project một lần
- `npm run build:min` - Build và minify CSS
- `npm run build:icon` - Build custom icons
- `npm run dev` - Chạy development mode với watch
- `npm run watch` - Watch files và tự động rebuild

## 📁 Cấu trúc thư mục

```
OTC_2_bk/
├── src/              # Source files
│   ├── assets/       # CSS, JS, images
│   ├── auth/         # Authentication pages
│   ├── blocks/       # Reusable HTML blocks
│   └── *.html        # Main pages
├── dist/             # Build output
├── build.js          # Build script
└── package.json      # Dependencies
```

## 🌐 Pages

- **Home**: Trang chủ với overview thị trường
- **Buy/Sell**: Trang mua/bán USDT
- **Order Create**: Tạo đơn hàng mới
- **P2P List**: Danh sách giao dịch P2P
- **Profile**: Hồ sơ người dùng
- **Upgrade Account**: Nâng cấp tài khoản
- **Category**: Danh mục giao dịch
- **News**: Tin tức và blog

## 🔧 Cấu hình

API endpoint được cấu hình trong file HTML:
```javascript
const API_URL = "https://panel.dongnai.net/api/v2/";
```

## 📝 License

ISC

## 👥 Contributors

- Your name here

## 📞 Liên hệ

Nếu có câu hỏi hoặc đề xuất, vui lòng tạo issue trên GitHub.

---

Made with ❤️ for the crypto trading community

