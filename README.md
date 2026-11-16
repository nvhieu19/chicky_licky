# Chicky Licky

Ứng dụng website bán đồ ăn được xây dựng bằng Next.js, React, TypeScript, Prisma và MySQL. Dự án không sử dụng Python; cài các gói ứng dụng bằng npm từ `package.json` và `package-lock.json`, không dùng `pip`.

## Yêu cầu

- Node.js 20.9 trở lên (khuyến nghị Node.js 22 LTS) và npm.
- MySQL 8 trở lên.
- Git (nếu tải mã nguồn bằng cách clone repository).

## Cài đặt lần đầu

1. Mở terminal tại thư mục dự án.
2. Cài dependency theo lockfile:

   ```bash
   npm ci
   ```
3. Tạo file cấu hình môi trường từ file mẫu.

   PowerShell:

   ```powershell
   Copy-Item .env.example .env
   ```

   macOS/Linux:

   ```bash
   cp .env.example .env
   ```
4. Tạo database MySQL rỗng (nếu chưa có):

   ```sql
   CREATE DATABASE chicky_licky
     CHARACTER SET utf8mb4
     COLLATE utf8mb4_unicode_ci;
   ```
5. Mở `.env` và cập nhật ít nhất các giá trị sau:

   ```env
   DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/chicky_licky"
   AUTH_SECRET="thay-bang-chuoi-ngau-nhien-it-nhat-32-ky-tu"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ADMIN_NAME="Chicky Licky Admin"
   ADMIN_EMAIL="admin@example.com"
   ADMIN_PASSWORD="thay-bang-mat-khau-manh"
   ```

   Thay `USER` và `PASSWORD` bằng thông tin MySQL của máy cài đặt. Nếu mật khẩu có ký tự đặc biệt, hãy URL-encode mật khẩu trong `DATABASE_URL`. Không dùng `AUTH_SECRET` hay mật khẩu mặc định trong `.env.example` ở môi trường thật.
6. Sinh Prisma Client và đồng bộ cấu trúc database:

   ```bash
   npm run prisma:generate
   npm run prisma:push
   ```
7. (Tùy chọn) Tạo dữ liệu khởi tạo và tài khoản Admin:

   ```bash
   npm run prisma:seed
   ```

   **Cảnh báo:** lệnh seed xóa dữ liệu hiện có trong các bảng trước khi tạo lại dữ liệu. Chỉ chạy trên database mới/rỗng hoặc sau khi đã sao lưu. Mặc định seed không tạo sản phẩm mẫu; chỉ bật việc tạo sản phẩm mẫu khi đặt `SEED_SAMPLE_PRODUCTS=true` trong môi trường chạy.

## Chạy ở chế độ phát triển

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000).

## Build và chạy production

```bash
npm run build
npm start
```

## Lệnh thường dùng

| Lệnh                       | Tác dụng                                                                                               |
| --------------------------- | -------------------------------------------------------------------------------------------------------- |
| `npm run dev`             | Chạy máy chủ phát triển                                                                             |
| `npm run build`           | Tạo bản build production                                                                               |
| `npm start`               | Chạy bản build production                                                                              |
| `npm run lint`            | Kiểm tra ESLint                                                                                         |
| `npm run prisma:generate` | Sinh Prisma Client                                                                                       |
| `npm run prisma:push`     | Đồng bộ Prisma schema với MySQL                                                                      |
| `npm run prisma:seed`     | Xóa dữ liệu hiện tại rồi nạp dữ liệu khởi tạo                                                 |
| `npm run prisma:clean`    | Xóa dữ liệu đơn hàng, giỏ hàng, sản phẩm, danh mục và nội dung; giữ lại tài khoản Admin |

`prisma:clean` cũng xóa dữ liệu trong database. Hãy sao lưu và kiểm tra đúng `DATABASE_URL` trước khi chạy.

## Bàn giao mã nguồn

Gửi mã nguồn cùng `package.json`, `package-lock.json`, `prisma/schema.prisma` và `.env.example`. Không gửi các thư mục `node_modules`, `.next`, `venv`, hoặc file `.env`; khách hàng tự cài dependency, tạo `.env` và điền thông tin database/secret của họ.

Các ảnh thương hiệu tùy chọn được tham chiếu từ thư mục `public`:

- `public/logo.png` — logo dùng ở Header và Footer.
- `public/brand.png` — ảnh ở trang `/brand-story`.

## Tài khoản quản trị

Sau khi chạy seed trên database mới, đăng nhập Admin bằng địa chỉ email và mật khẩu đã cấu hình qua `ADMIN_EMAIL` và `ADMIN_PASSWORD` trong `.env`. Đổi mật khẩu mặc định trước khi dùng ở môi trường thật.


* **Tài khoản Quản trị viên (Admin):**

  * Email: `admin@chickylicky.vn`
  * Mật khẩu: `AdminPassword123!`
  * **Tài khoản Khách hàng demo (User):**
  * Email: `khachhang@gmail.com`
  * Mật khẩu: `ChickyDemo2026!`
