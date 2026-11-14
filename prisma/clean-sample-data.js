const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function cleanData() {
  console.log("--- Bắt đầu xóa toàn bộ dữ liệu mẫu ---");

  try {
    // 1. Xóa chi tiết đơn hàng & lịch sử đơn
    await prisma.orderStatusHistory.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.cart.deleteMany();
    console.log("✔ Đã xóa dữ liệu đơn hàng và giỏ hàng mẫu");

    // 2. Xóa toàn bộ sản phẩm mẫu
    await prisma.product.deleteMany();
    console.log("✔ Đã xóa toàn bộ sản phẩm mẫu");

    // 3. Xóa toàn bộ danh mục mẫu
    await prisma.category.deleteMany();
    console.log("✔ Đã xóa toàn bộ danh mục mẫu");

    // 4. Xóa banner, khuyến mãi, mã giảm giá mẫu
    await prisma.banner.deleteMany();
    await prisma.promotion.deleteMany();
    await prisma.coupon.deleteMany();
    console.log("✔ Đã xóa toàn bộ banner, khuyến mãi, coupon mẫu");

    // 5. Xóa cửa hàng mẫu (nếu có)
    await prisma.store.deleteMany();
    console.log("✔ Đã xóa toàn bộ chi nhánh mẫu");

    // 6. Xóa khách hàng mẫu, GIỮ LẠI tài khoản ADMIN
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        role: "USER",
      },
    });
    console.log(`✔ Đã xóa ${deletedUsers.count} tài khoản khách hàng mẫu (Tài khoản Admin được giữ nguyên để đăng nhập)`);

    console.log("\n=======================================================");
    console.log("🎉 XÓA DỮ LIỆU MẪU THÀNH CÔNG 100%!");
    console.log("Hệ thống database MySQL hiện đã hoàn toàn trống.");
    console.log("Bạn có thể truy cập http://localhost:3000/admin để bắt đầu thêm danh mục và món ăn mới từ đầu!");
    console.log("=======================================================\n");
  } catch (error) {
    console.error("❌ Lỗi khi xóa dữ liệu mẫu:", error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanData();
