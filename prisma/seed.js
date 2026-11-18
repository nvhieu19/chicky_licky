const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding for Chicky Licky...");

  // 1. Clean existing records (in dependency order)
  await prisma.orderStatusHistory.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.cart.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.promotion.deleteMany({});
  await prisma.banner.deleteMany({});
  await prisma.coupon.deleteMany({});
  await prisma.store.deleteMany({});
  await prisma.siteSetting.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("🧹 Cleaned old database records.");

  // 2. Create Users
  const adminSalt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || "AdminPassword123!", adminSalt);

  const admin = await prisma.user.create({
    data: {
      name: process.env.ADMIN_NAME || "Chicky Licky Admin",
      email: (process.env.ADMIN_EMAIL || "admin@chickylicky.vn").toLowerCase(),
      phone: "0901234567",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      isActive: true,
    },
  });

  const userPasswordHash = await bcrypt.hash("123456", 10);
  const customer = await prisma.user.create({
    data: {
      name: "Nguyễn Văn An",
      email: "khachhang@gmail.com",
      phone: "0987654321",
      passwordHash: userPasswordHash,
      role: "USER",
      isActive: true,
    },
  });

  console.log("👤 Created Admin and Demo User.");

  // 3. Create Categories (Chuyên Gà Rán Pop, Cơm Gà, Khoai, Sốt Đẫm Vị)
  const categoriesData = [
    {
      name: "Combo Tiết Kiệm",
      slug: "combo",
      description: "Các gói Combo gà pop, cơm gà, khoai chiên và nước ngọt với giá siêu tiết kiệm.",
      imageUrl: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=600&q=80",
      sortOrder: 1,
    },
    {
      name: "Gà Phủ Sốt",
      slug: "ga-phu-sot",
      description: "Gà pop và gà rán phủ đẫm sốt cay Hàn Quốc, sốt bơ mật ong, sốt mắm tỏi thơm lừng.",
      imageUrl: "https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=600&q=80",
      sortOrder: 2,
    },
    {
      name: "Gà Rán & Gà Pop",
      slug: "ga-ran",
      description: "Gà pop viên giòn rụm và gà rán truyền thống tẩm ướp đậm đà, giòn tan nóng hổi.",
      imageUrl: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80",
      sortOrder: 3,
    },
    {
      name: "Cơm Gà",
      slug: "com-ga",
      description: "Cơm gà mắm tỏi, cơm gà sốt đậu thơm ngon no bụng cho bữa trưa đầy đủ năng lượng.",
      imageUrl: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80",
      sortOrder: 4,
    },
    {
      name: "Ăn Kèm / Topping",
      slug: "an-kem-topping",
      description: "Khoai tây lắc phô mai, hồ lô tê cay, tokbokki chiên giòn và các loại sốt chấm đẫm vị.",
      imageUrl: "https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=80",
      sortOrder: 5,
    },
    {
      name: "Đồ Uống",
      slug: "do-uong",
      description: "Pepsi mát lạnh, trà đào cam sả, ô long lài sữa gạo thanh nhiệt sảng khoái.",
      imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80",
      sortOrder: 6,
    },
  ];

  const categories = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.create({ data: cat });
    categories[cat.slug] = created.id;
  }
  console.log(`📂 Created ${categoriesData.length} Categories.`);

  // 4. Create Products
  const productsData = process.env.SEED_SAMPLE_PRODUCTS === "true" ? [
    // Combo
    {
      name: "Combo Gà Pop Tok Size L",
      slug: "combo-ga-pop-tok-size-l",
      shortDescription: "1 Phần Gà Pop Tok Size L + 1 Khoai tây chiên nhỏ + 1 Pepsi mát lạnh.",
      description: "Combo gà pop giòn rụm kèm bánh gạo tokbokki chiên giòn đẫm sốt cay ngọt, khoai chiên và nước ngọt mát lạnh.",
      price: 75000,
      salePrice: 59000,
      imageUrl: "https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=800&q=80",
      categoryId: categories["combo"],
      isBestSeller: true,
      isNew: true,
      sortOrder: 1,
    },
    {
      name: "Combo Cơm Gà No Nê",
      slug: "combo-com-ga-no-ne",
      shortDescription: "1 Phần Cơm Gà Mắm Tỏi + 1 Canh súp bắp + 1 Pepsi mát lạnh.",
      description: "Bữa trưa no nê với cơm trắng dẻo thơm, gà giòn đượm sốt mắm tỏi đậm đà kèm súp bắp tươi ngon.",
      price: 68000,
      salePrice: 49000,
      imageUrl: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80",
      categoryId: categories["combo"],
      isBestSeller: true,
      isNew: false,
      sortOrder: 2,
    },
    {
      name: "Combo Bạn Thân Hợp Cạ",
      slug: "combo-ban-than-hop-ca",
      shortDescription: "2 Phần Gà Pop đượm sốt + 1 Khoai lắc phô mai + 2 Pepsi.",
      description: "Thích hợp cho đôi bạn thân thưởng thức trọn vẹn hương vị gà pop giòn tan và khoai lắc phô mai béo ngậy.",
      price: 159000,
      salePrice: 129000,
      imageUrl: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80",
      categoryId: categories["combo"],
      isBestSeller: true,
      isNew: false,
      sortOrder: 3,
    },
    // Gà Phủ Sốt
    {
      name: "Gà Pop Sốt Cay Hàn Quốc",
      slug: "ga-pop-sot-cay-han-quoc",
      shortDescription: "Gà pop viên giòn rụm phủ đẫm sốt cay ngọt Hàn Quốc bóng bẩy quyện mè rang.",
      description: "Món ăn best seller với lớp sốt cay nồng ngọt dịu thấm đẫm từng viên gà pop vàng óng.",
      price: 49000,
      salePrice: 45000,
      imageUrl: "https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=800&q=80",
      categoryId: categories["ga-phu-sot"],
      isBestSeller: true,
      isNew: false,
      sortOrder: 4,
    },
    {
      name: "Gà Pop Sốt Bơ Mật Ong",
      slug: "ga-pop-sot-bo-mat-ong",
      shortDescription: "Vị bơ thơm béo ngậy kết hợp mật ong rừng thanh ngọt phủ đẫm gà giòn.",
      description: "Từng miếng gà pop giòn rụm được ngào đều trong chảo sốt bơ mật ong vàng ươm thơm nức mũi.",
      price: 52000,
      salePrice: null,
      imageUrl: "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80",
      categoryId: categories["ga-phu-sot"],
      isBestSeller: false,
      isNew: true,
      sortOrder: 5,
    },
    {
      name: "Gà Pop Sốt Thái Chua Cay",
      slug: "ga-pop-sot-thai-chua-cay",
      shortDescription: "Sốt Thái chua cay bùng nổ vị giác, thơm mùi lá chanh và sả tươi.",
      description: "Sự kết hợp độc đáo giữa gà pop giòn tan và nước sốt Thái đậm đà kích thích vị giác.",
      price: 49000,
      salePrice: null,
      imageUrl: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80",
      categoryId: categories["ga-phu-sot"],
      isBestSeller: true,
      isNew: false,
      sortOrder: 6,
    },
    // Gà Rán & Gà Pop
    {
      name: "Gà Pop Giòn Rụm (Size M)",
      slug: "ga-pop-gion-rum-size-m",
      shortDescription: "Viên gà không xương tẩm ướp đậm đà, chiên vàng ươm ráo dầu.",
      description: "Gà pop chuẩn vị Chicky Licky với lớp vỏ ngoài siêu giòn và phần thịt bên trong mềm mọng.",
      price: 35000,
      salePrice: null,
      imageUrl: "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80",
      categoryId: categories["ga-ran"],
      isBestSeller: true,
      isNew: false,
      sortOrder: 7,
    },
    {
      name: "Gà Pop Giòn Rụm (Size L)",
      slug: "ga-pop-gion-rum-size-l",
      shortDescription: "Phần lớn gấp đôi gà pop viên giòn rụm, thích hợp nhâm nhi cùng bạn bè.",
      description: "Hộp lớn đầy ắp những viên gà pop vàng giòn rụm nóng hổi thơm nức.",
      price: 55000,
      salePrice: 49000,
      imageUrl: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80",
      categoryId: categories["ga-ran"],
      isBestSeller: true,
      isNew: true,
      sortOrder: 8,
    },
    {
      name: "Gà Rán Giòn Truyền Thống (1 Miếng)",
      slug: "ga-ran-gion-truyen-thong",
      shortDescription: "Đùi gà tẩm bột giòn tan, ướp gia vị 11 loại thảo mộc bí truyền.",
      description: "Lớp vỏ ngoài giòn rụm màu vàng óng, thịt gà bên trong mềm ngọt, giữ trọn độ ẩm thơm ngon.",
      price: 36000,
      salePrice: null,
      imageUrl: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80",
      categoryId: categories["ga-ran"],
      isBestSeller: true,
      isNew: false,
      sortOrder: 9,
    },
    // Cơm Gà
    {
      name: "Cơm Gà Mắm Tỏi",
      slug: "com-ga-mam-toi",
      shortDescription: "Cơm trắng dẻo thơm, gà giòn sốt mắm tỏi ớt kẹo sệt, kèm dưa leo giòn mát.",
      description: "Hương vị mắm tỏi đậm chất ẩm thực Việt, vị mặn ngọt hài hòa quyện trong từng thớ thịt gà giòn.",
      price: 48000,
      salePrice: 42000,
      imageUrl: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80",
      categoryId: categories["com-ga"],
      isBestSeller: true,
      isNew: false,
      sortOrder: 10,
    },
    {
      name: "Cơm Gà Sốt Đậu Hạt Điều",
      slug: "com-ga-sot-dau-hat-dieu",
      shortDescription: "Cơm trắng dẻo thơm, gà giòn sốt đậu ngọt bùi rắc hạt điều béo ngậy.",
      description: "Bữa ăn đầy đủ dưỡng chất với gà tươi giòn rụm sốt đậu Hàn Quốc và hạt điều giòn tan.",
      price: 48000,
      salePrice: null,
      imageUrl: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80",
      categoryId: categories["com-ga"],
      isBestSeller: false,
      isNew: true,
      sortOrder: 11,
    },
    // Ăn Kèm / Topping
    {
      name: "Khoai Tây Lắc Phô Mai",
      slug: "khoai-tay-lac-pho-mai",
      shortDescription: "Khoai tây chiên vàng giòn rụm lắc đẫm bột phô mai mặn ngọt.",
      description: "Món ăn kèm khoái khẩu không thể thiếu trong mọi bữa tiệc Chicky Licky.",
      price: 35000,
      salePrice: null,
      imageUrl: "https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=800&q=80",
      categoryId: categories["an-kem-topping"],
      isBestSeller: true,
      isNew: false,
      sortOrder: 12,
    },
    {
      name: "Hồ Lô Lắc Tê Cay",
      slug: "ho-lo-lac-te-cay",
      shortDescription: "Hồ lô chiên căng mọng lắc bột ớt tê cay thơm nồng đậm vị.",
      description: "Từng viên hồ lô nướng căng tròn ngọt thịt, lắc bột ớt thơm cay hấp dẫn.",
      price: 32000,
      salePrice: null,
      imageUrl: "https://images.unsplash.com/photo-1548340748-6d2b7d7da280?auto=format&fit=crop&w=800&q=80",
      categoryId: categories["an-kem-topping"],
      isBestSeller: false,
      isNew: true,
      sortOrder: 13,
    },
    // Đồ uống
    {
      name: "Pepsi Tươi Mát Lạnh",
      slug: "pepsi-tuoi-mat-lanh",
      shortDescription: "Nước ngọt có ga sảng khoái đánh tan dầu mỡ.",
      description: "Ly lớn sảng khoái với đá tinh khiết mát lạnh sảng khoái.",
      price: 18000,
      salePrice: null,
      imageUrl: "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?auto=format&fit=crop&w=800&q=80",
      categoryId: categories["do-uong"],
      isBestSeller: true,
      isNew: false,
      sortOrder: 14,
    },
    {
      name: "Trà Đào Cam Sả Tươi",
      slug: "tra-dao-cam-sa-tuoi",
      shortDescription: "Hương đào thơm mát hòa quyện vị cam thanh và sả dịu ngọt.",
      description: "Thức uống giải khát mát rượi với miếng đào giòn ngọt và tinh chất sả thanh tao.",
      price: 32000,
      salePrice: 28000,
      imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
      categoryId: categories["do-uong"],
      isBestSeller: true,
      isNew: true,
      sortOrder: 15,
    },
  ] : [];

  for (const product of productsData) {
    await prisma.product.create({ data: product });
  }
  console.log(`🍗 Created ${productsData.length} Products.`);

  // 5. Create Banners
  const bannersData = [
    {
      title: "Gà Pop Đẫm Vị - Ăn Trưa Thôi!",
      description: "Combo gà pop giòn rụm và cơm gà ngon tuyệt giá chỉ từ 42.000đ áp dụng Thứ 2 - Thứ 6 hàng tuần.",
      imageUrl: "https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=1200&q=80",
      link: "/menu",
      position: "HERO",
      sortOrder: 1,
      isActive: true,
    },
    {
      title: "Gà Rán Giòn Tan - Thơm Cay Đậm Vị",
      description: "Thưởng thức gà pop và gà rán nóng hổi giòn rụm cùng các loại sốt đặc quyền Chicky Licky.",
      imageUrl: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=1200&q=80",
      link: "/menu",
      position: "HERO",
      sortOrder: 2,
      isActive: true,
    },
    {
      title: "Ưu Đãi Đăng Ký Hội Viên",
      description: "Tích điểm cho mỗi đơn hàng và đổi nhiều quà hấp dẫn cùng Chicky Club.",
      imageUrl: "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=1200&q=80",
      link: "/promotions",
      position: "HERO",
      sortOrder: 3,
      isActive: true,
    },
  ];

  for (const banner of bannersData) {
    await prisma.banner.create({ data: banner });
  }
  console.log(`🖼️ Created ${bannersData.length} Banners.`);

  // 6. Create Promotions
  const promotionsData = [
    {
      title: "Combo Gà Pop Ăn Trưa Giá Sốc 42K - 49K",
      slug: "combo-ga-pop-an-trua-gia-soc",
      description: "Chương trình ưu đãi bữa trưa đặc biệt: Gà pop kèm khoai tây và nước chỉ 42.000đ, Cơm gà giòn mắm tỏi kèm súp và nước ngọt chỉ 49.000đ. Áp dụng từ 10h30 đến 14h00 các ngày trong tuần (không áp dụng Thứ 7, Chủ Nhật và ngày Lễ).",
      imageUrl: "https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=800&q=80",
      discountType: "FIXED",
      discountValue: 23000,
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-12-31"),
      isActive: true,
    },
    {
      title: "Đại Tiệc Cuối Tuần - Mua 2 Tặng 1 Gà Rán Pop",
      slug: "dai-tiec-cuoi-tuan-mua-2-tang-1",
      description: "Vào các ngày Thứ 7 và Chủ Nhật hàng tuần, khi mua từ 2 phần gà pop bất kỳ, quý khách sẽ được tặng ngay 1 phần gà pop giòn rụm hoặc 1 ly Pepsi tươi mát lạnh.",
      imageUrl: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80",
      discountType: "PERCENT",
      discountValue: 33,
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-12-31"),
      isActive: true,
    },
    {
      title: "Ưu Đãi Hội Viên Mới - Tặng 20.000đ Đơn Đầu Tiên",
      slug: "uu-dai-hoi-vien-moi-chicky-club",
      description: "Đăng ký tài khoản Chicky Licky ngay hôm nay để nhận mã giảm giá 20.000đ cho đơn hàng đầu tiên từ 100.000đ cùng hàng ngàn điểm thưởng tích lũy hấp dẫn.",
      imageUrl: "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80",
      discountType: "FIXED",
      discountValue: 20000,
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-12-31"),
      isActive: true,
    },
  ];

  for (const promo of promotionsData) {
    await prisma.promotion.create({ data: promo });
  }
  console.log(`🎁 Created ${promotionsData.length} Promotions.`);

  // 7. Create Coupons
  const couponsData = [
    {
      code: "CHICKY20",
      discountType: "FIXED",
      discountValue: 20000,
      minimumOrderValue: 100000,
      maximumDiscount: 20000,
      usageLimit: 500,
      usedCount: 12,
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-12-31"),
      isActive: true,
    },
    {
      code: "FREESHIP",
      discountType: "FIXED",
      discountValue: 15000,
      minimumOrderValue: 120000,
      maximumDiscount: 15000,
      usageLimit: 1000,
      usedCount: 45,
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-12-31"),
      isActive: true,
    },
    {
      code: "CHICKY10VIP",
      discountType: "PERCENT",
      discountValue: 10,
      minimumOrderValue: 200000,
      maximumDiscount: 50000,
      usageLimit: 200,
      usedCount: 5,
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-12-31"),
      isActive: true,
    },
  ];

  for (const coupon of couponsData) {
    await prisma.coupon.create({ data: coupon });
  }
  console.log(`🎟️ Created ${couponsData.length} Coupons.`);

  // 8. Create Stores
  const storesData = [
    {
      name: "Chicky Licky - Nguyễn Thị Thập",
      address: "Số 420 Nguyễn Thị Thập, P. Tân Quy, Quận 7, TP. Hồ Chí Minh",
      phone: "028 3775 1234",
      openingHours: "07:30 - 22:30",
      imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80",
      latitude: 10.7412,
      longitude: 106.7058,
      isActive: true,
    },
    {
      name: "Chicky Licky - Hai Bà Trưng",
      address: "Số 182 Hai Bà Trưng, P. Đa Kao, Quận 1, TP. Hồ Chí Minh",
      phone: "028 3822 5678",
      openingHours: "08:00 - 23:00",
      imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80",
      latitude: 10.7856,
      longitude: 106.6975,
      isActive: true,
    },
    {
      name: "Chicky Licky - Cầu Giấy Hà Nội",
      address: "Số 235 Đường Cầu Giấy, P. Dịch Vọng, Quận Cầu Giấy, Hà Nội",
      phone: "024 3833 9999",
      openingHours: "08:00 - 22:30",
      imageUrl: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=600&q=80",
      latitude: 21.0333,
      longitude: 105.7944,
      isActive: true,
    },
    {
      name: "Chicky Licky - Lê Duẩn Đà Nẵng",
      address: "Số 98 Lê Duẩn, P. Thạch Thang, Quận Hải Châu, Đà Nẵng",
      phone: "0236 388 6789",
      openingHours: "08:00 - 22:00",
      imageUrl: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=600&q=80",
      latitude: 16.0718,
      longitude: 108.2185,
      isActive: true,
    },
  ];

  for (const store of storesData) {
    await prisma.store.create({ data: store });
  }
  console.log(`🏬 Created ${storesData.length} Stores.`);

  // 9. Create Site Settings
  const settingsData = [
    { key: "SITE_NAME", value: "Chicky Licky" },
    { key: "SITE_TAGLINE", value: "LƯỚT WEB CHỌN MÓN - TRỌN VẸN CUỘC VUI" },
    { key: "HOTLINE", value: "078 992 4777" },
    { key: "DELIVERY_HOTLINE", value: "078 992 4777" },
    { key: "COMPANY_NAME", value: "VIETNAM CHICKY LICKY FAST FOOD CO.LTD" },
    { key: "COMPANY_ADDRESS", value: "Tầng 15, Chicky Tower II, Số 2-4 Đường số 8, Phường Tân Mỹ, Quận 7, TP. Hồ Chí Minh" },
    { key: "COMPANY_PHONE", value: "(84-8) 5416 1072 ~ 79" },
    { key: "COMPANY_EMAIL", value: "cskh@chickylicky.vn" },
    { key: "ANNOUNCEMENT_TEXT", value: "Tích điểm cho mỗi đơn hàng và đổi nhiều quà hấp dẫn cùng Chicky Club!" },
    { key: "ANNOUNCEMENT_LINK", value: "/promotions" },
    { key: "FREE_SHIPPING_MIN", value: "150000" },
    { key: "DEFAULT_SHIPPING_FEE", value: "15000" },
    { key: "FACEBOOK_URL", value: "https://facebook.com/chickylickyvn" },
    { key: "INSTAGRAM_URL", value: "https://instagram.com/chickylickyvn" },
    { key: "ZALO_URL", value: "https://zalo.me/chickylickyvn" },
    {
      key: "BRAND_STORY",
      value: JSON.stringify({
        title: "GIỚI THIỆU VỀ CHICKY LICKY VIỆT NAM",
        paragraphs: [
          "Chicky Licky là thương hiệu đồ ăn nhanh chuyên biệt phục vụ các món gà rán pop giòn rụm, cơm gà nóng hổi, khoai chiên vàng giòn và các loại sốt gà đẫm vị đặc trưng.",
          "Trong suốt hành trình phát triển, Chicky Licky luôn nỗ lực không ngừng để đem đến cho khách hàng trải nghiệm ẩm thực chất lượng, an toàn vệ sinh thực phẩm với các tiêu chuẩn quốc tế nghiêm ngặt như RVA HACCP, ISO 14001 và ISO 9001.",
          "Hiện nay, Chicky Licky đã có mặt tại nhiều tỉnh thành trên cả nước với chuỗi cửa hàng khang trang, hiện đại và dịch vụ giao hàng tận nơi nhanh chóng, thân thiện."
        ]
      })
    }
  ];

  for (const s of settingsData) {
    await prisma.siteSetting.create({ data: s });
  }
  console.log(`⚙️ Created ${settingsData.length} Site Settings.`);

  // 10. Create a Demo Order
  const demoOrder = await prisma.order.create({
    data: {
      orderCode: "CL889921",
      userId: customer.id,
      recipientName: "Nguyễn Văn An",
      phone: "0987654321",
      email: "khachhang@gmail.com",
      address: "123 Lê Văn Lương, P. Tân Kiểng, Q.7, TP.HCM",
      subtotal: 104000,
      discountAmount: 20000,
      shippingFee: 15000,
      totalAmount: 99000,
      couponCode: "CHICKY20",
      paymentMethod: "COD",
      paymentStatus: "PENDING",
      status: "CONFIRMED",
      deliveryType: "DELIVERY",
      note: "Giao trước 12h trưa giúp mình, xin thêm tương ớt.",
      items: {
        create: [
          {
            productName: "Combo Gà Pop Tok Size L",
            productImage: "https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=800&q=80",
            unitPrice: 59000,
            quantity: 1,
            subtotal: 59000,
          },
          {
            productName: "Gà Pop Sốt Cay Hàn Quốc",
            productImage: "https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=800&q=80",
            unitPrice: 45000,
            quantity: 1,
            subtotal: 45000,
          },
        ],
      },
      statusHistory: {
        create: [
          {
            newStatus: "PENDING",
            changedBy: "Hệ thống",
            note: "Khách hàng tạo đơn trực tuyến",
          },
          {
            oldStatus: "PENDING",
            newStatus: "CONFIRMED",
            changedBy: "Admin",
            note: "Đã xác nhận đơn hàng với khách qua điện thoại",
          },
        ],
      },
    },
  });

  console.log(`📦 Created Demo Order: ${demoOrder.orderCode}`);
  console.log("✅ Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
