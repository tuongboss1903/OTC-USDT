# 🚀 Hướng dẫn Deploy lên Vercel NGAY BÂY GIỜ

Bạn đã đăng nhập Vercel trên web rồi, bây giờ cần deploy qua CLI.

## Các bước thực hiện:

### Bước 1: Đăng nhập Vercel CLI
Mở terminal/PowerShell và chạy:
```bash
vercel login
```
- Sẽ mở browser để xác nhận đăng nhập
- Hoặc bạn có thể chọn "Use email" và nhập email

### Bước 2: Link project với Vercel
Sau khi đăng nhập thành công, chạy:
```bash
vercel link
```
- Chọn project: `otc-usdt` (hoặc tên project của bạn trên Vercel)
- Chọn scope: chọn account của bạn

### Bước 3: Deploy lên Production
```bash
vercel --prod --yes
```

---

## Hoặc cách đơn giản hơn: Push lên GitHub

Nếu bạn đã connect GitHub với Vercel trên dashboard, chỉ cần:

```bash
# 1. Thêm tất cả thay đổi
git add .

# 2. Commit
git commit -m "Update project for deployment"

# 3. Push lên GitHub
git push

# Vercel sẽ tự động deploy!
```

Sau đó vào https://vercel.com/huynh-ngoc-anh-tuongs-projects/otc-usdt để xem deployment.

---

## Kiểm tra cấu hình Vercel

File `vercel.json` đã được cấu hình đúng:
- ✅ Build Command: `npm install && npm run build`
- ✅ Output Directory: `dist`
- ✅ Framework: null (static site)

Bạn chỉ cần đăng nhập và deploy!

