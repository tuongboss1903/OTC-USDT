# Hướng dẫn cài đặt và cấu hình Git

## 📥 Bước 1: Tải Git

1. Truy cập: https://git-scm.com/download/win
2. Tải file cài đặt (Git-2.x.x-64-bit.exe)
3. Chạy file vừa tải

## ⚙️ Bước 2: Cài đặt Git

Khi cài đặt, **QUAN TRỌNG** - chọn:
- ✅ **"Git from the command line and also from 3rd-party software"**
  - Điều này cho phép dùng Git từ PowerShell/CMD

Các tùy chọn khác có thể giữ mặc định:
- Editor: Chọn Notepad++ hoặc VS Code (nếu có)
- Line endings: "Checkout Windows-style, commit Unix-style"
- Terminal: "Use MinTTY"

## ✅ Bước 3: Xác minh cài đặt

Mở PowerShell hoặc CMD mới và chạy:
```bash
git --version
```

Nếu thấy số phiên bản (ví dụ: `git version 2.43.0`) → Cài đặt thành công! ✅

## 🔧 Bước 4: Cấu hình Git (lần đầu tiên)

Sau khi cài xong, cấu hình tên và email của bạn:

```bash
git config --global user.name "Tên của bạn"
git config --global user.email "email@example.com"
```

Ví dụ:
```bash
git config --global user.name "tuongboss1903"
git config --global user.email "tuonghuynh20011903@gmail.com"
```

## 🚀 Bước 5: Publish lên GitHub

Sau khi cài Git xong, quay lại thư mục dự án và chạy:

```bash
# 1. Khởi tạo git repository
git init

# 2. Thêm tất cả files
git add .

# 3. Commit lần đầu
git commit -m "Initial commit: USDT P2P Trading Platform"

# 4. Tạo repository trên GitHub trước (tại https://github.com/new)
#    Sau đó thêm remote (thay YOUR_USERNAME và YOUR_REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# 5. Push lên GitHub
git branch -M main
git push -u origin main
```

## 📝 Lưu ý

- Sau khi cài Git, **phải mở lại terminal/PowerShell mới** để Git có hiệu lực
- Nếu vẫn không nhận diện Git, thử restart máy tính
- Email dùng trong `git config` nên trùng với email GitHub của bạn

## 🆘 Xử lý lỗi

**Lỗi: "git is not recognized"**
- Đảm bảo đã chọn "Git from the command line" khi cài
- Mở lại terminal mới
- Kiểm tra PATH: `$env:PATH` trong PowerShell

**Lỗi: "Permission denied"**
- Chạy PowerShell/CMD với quyền Administrator


