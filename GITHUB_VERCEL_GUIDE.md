# Hướng dẫn Git và Vercel

## 📤 CÁC LỆNH PUSH LÊN GITHUB

### 1. Lần đầu tiên (đã làm xong)
```bash
git init
git add .
git commit -m "Initial commit: USDT P2P Trading Platform"
git branch -M main
git remote add origin https://github.com/tuongboss1903/OTC-USDT.git
git push -u origin main
```

### 2. Khi có thay đổi mới (sử dụng thường xuyên)
```bash
# Xem các file đã thay đổi
git status

# Thêm tất cả file đã thay đổi
git add .

# Hoặc thêm từng file cụ thể
git add tên-file.html

# Commit với message mô tả
git commit -m "Mô tả thay đổi của bạn"

# Push lên GitHub
git push
```

### 3. Các lệnh Git hữu ích khác

```bash
# Xem lịch sử commit
git log

# Xem các thay đổi chưa commit
git diff

# Xem các file đã thay đổi
git status

# Undo thay đổi trong file (chưa add)
git checkout -- tên-file.html

# Undo file đã add (nhưng chưa commit)
git reset HEAD tên-file.html

# Xem remote repository
git remote -v

# Đổi tên branch
git branch -M main
```

---

## 📥 CÁC LỆNH CLONE VỀ MÁY

### 1. Clone repository về máy
```bash
# Clone về thư mục hiện tại
git clone https://github.com/tuongboss1903/OTC-USDT.git

# Clone về thư mục với tên khác
git clone https://github.com/tuongboss1903/OTC-USDT.git ten-thu-muc-moi

# Clone vào thư mục cụ thể
cd D:\Projects
git clone https://github.com/tuongboss1903/OTC-USDT.git
```

### 2. Sau khi clone, cài đặt dependencies
```bash
cd OTC-USDT
npm install
# hoặc
pnpm install
```

### 3. Pull code mới nhất từ GitHub (khi đã có repo local)
```bash
# Lấy code mới nhất từ GitHub
git pull

# Hoặc pull từ branch cụ thể
git pull origin main
```

---

## 🚀 DEPLOY LÊN VERCEL

### Cách 1: Deploy qua Vercel Dashboard (Dễ nhất)

1. **Đăng nhập Vercel:**
   - Vào https://vercel.com
   - Đăng nhập bằng GitHub account

2. **Import Project:**
   - Click "Add New..." → "Project"
   - Chọn repository `tuongboss1903/OTC-USDT`
   - Click "Import"

3. **Cấu hình Project:**
   - **Framework Preset:** Other (hoặc để trống)
   - **Root Directory:** `./` (giữ nguyên)
   - **Build Command:** `npm install && npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install` (hoặc để trống)

4. **Environment Variables (nếu có):**
   - Thêm các biến môi trường nếu cần

5. **Deploy:**
   - Click "Deploy"
   - Chờ build xong (2-5 phút)
   - Vercel sẽ tự động tạo URL cho bạn

### Cách 2: Deploy qua Vercel CLI

```bash
# Cài đặt Vercel CLI (chỉ cần làm 1 lần)
npm install -g vercel

# Đăng nhập Vercel
vercel login

# Deploy lần đầu
vercel

# Deploy production
vercel --prod

# Xem các deployment
vercel ls

# Xem logs
vercel logs
```

### Cách 3: Tự động deploy (Recommended)

Vercel tự động deploy khi bạn push code lên GitHub:

1. **Kết nối GitHub với Vercel:**
   - Vào Vercel Dashboard → Settings → Git
   - Kết nối GitHub account
   - Chọn repository `OTC-USDT`

2. **Tự động deploy:**
   - Mỗi khi bạn `git push` lên GitHub
   - Vercel sẽ tự động build và deploy
   - Bạn sẽ nhận được email thông báo

---

## 🗑️ XÓA PROJECT TRÊN VERCEL

### Cách 1: Xóa qua Vercel Dashboard

1. **Vào Vercel Dashboard:**
   - https://vercel.com/dashboard

2. **Chọn Project:**
   - Click vào project `OTC-USDT`

3. **Vào Settings:**
   - Click tab "Settings" ở trên cùng

4. **Xóa Project:**
   - Scroll xuống cuối trang
   - Tìm section "Danger Zone"
   - Click "Delete Project"
   - Nhập tên project để xác nhận
   - Click "Delete"

### Cách 2: Xóa qua Vercel CLI

```bash
# Xem danh sách projects
vercel ls

# Xóa project (cần project ID)
vercel remove project-name

# Hoặc xóa deployment cụ thể
vercel rm deployment-url
```

### Lưu ý:
- ⚠️ Xóa project sẽ xóa TẤT CẢ deployments và settings
- ⚠️ URL sẽ không còn hoạt động sau khi xóa
- ⚠️ Không thể khôi phục sau khi xóa

---

## 🔄 WORKFLOW THƯỜNG DÙNG

### Workflow hàng ngày:

```bash
# 1. Làm việc với code, chỉnh sửa files

# 2. Kiểm tra thay đổi
git status

# 3. Thêm files vào staging
git add .

# 4. Commit
git commit -m "Mô tả thay đổi"

# 5. Push lên GitHub
git push

# 6. Vercel tự động deploy (nếu đã setup auto-deploy)
# Hoặc vào Vercel Dashboard để deploy thủ công
```

### Khi làm việc trên máy khác:

```bash
# 1. Clone repository
git clone https://github.com/tuongboss1903/OTC-USDT.git
cd OTC-USDT

# 2. Cài đặt dependencies
npm install

# 3. Build project
npm run build

# 4. Làm việc với code...

# 5. Push lên GitHub
git add .
git commit -m "Thay đổi từ máy khác"
git push
```

---

## 📝 TÓM TẮT CÁC LỆNH QUAN TRỌNG

### Git Commands:
```bash
git status              # Xem trạng thái
git add .               # Thêm tất cả files
git commit -m "msg"     # Commit với message
git push                # Push lên GitHub
git pull                # Lấy code mới nhất
git clone <url>         # Clone repository
```

### Vercel Commands:
```bash
vercel                  # Deploy lần đầu
vercel --prod           # Deploy production
vercel ls               # Xem danh sách
vercel remove <name>    # Xóa project
```

---

## 🆘 XỬ LÝ LỖI THƯỜNG GẶP

### Lỗi: "fatal: not a git repository"
```bash
# Giải pháp: Khởi tạo git repository
git init
```

### Lỗi: "fatal: remote origin already exists"
```bash
# Giải pháp: Xóa remote cũ và thêm lại
git remote remove origin
git remote add origin https://github.com/tuongboss1903/OTC-USDT.git
```

### Lỗi: "failed to push some refs"
```bash
# Giải pháp: Pull code mới nhất trước khi push
git pull origin main
git push
```

### Lỗi Vercel: "Missing public directory"
```bash
# Đã fix bằng file vercel.json
# Kiểm tra: Build Command = "npm run build"
# Output Directory = "dist"
```

---

## 📞 HỖ TRỢ

- **GitHub Repository:** https://github.com/tuongboss1903/OTC-USDT
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Git Documentation:** https://git-scm.com/doc
- **Vercel Documentation:** https://vercel.com/docs

