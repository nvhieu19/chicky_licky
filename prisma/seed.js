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

  // 3. Create Categories
  const categoriesData = [
    {
      name: "Combo Tiết Kiệm",
      slug: "combo",
      description: "Các gói Combo ăn trưa, combo gia đình, nhóm bạn với giá siêu tiết kiệm.",
      imageUrl: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=600&q=80",
      sortOrder: 1,
    },
    {
      name: "Burger",
      slug: "burger",
      description: "Burger bò nướng, burger gà sốt cay, burger tôm giòn chuẩn vị Chicky Licky.",
      imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80",
      sortOrder: 2,
    },
    {
      name: "Gà Rán",
      slug: "ga-ran",
      description: "Gà rán giòn rụm bên ngoài, mềm ẩm bên trong với công thức tẩm ướp đặc biệt.",
      imageUrl: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80",
      sortOrder: 3,
    },
    {
      name: "Cơm & Mì Ý",
      slug: "com-mi-y",
      description: "Cơm gà sốt cay, cơm thịt bò và mì Ý sốt bò bằm đậm đà thơm ngon.",
      imageUrl: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80",
      sortOrder: 4,
    },
    {
      name: "Thức Ăn Nhẹ",
      slug: "thuc-an-nhe",
      description: "Khoai tây chiên giòn, phô mai que béo ngậy, mực vòng chiên xù giòn tan.",
      imageUrl: "https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=80",
      sortOrder: 5,
    },
    {
      name: "Thức Uống & Tráng Miệng",
      slug: "thuc-uong",
      description: "Nước ngọt có ga mát lạnh, trà đào thanh nhiệt và kem tráng miệng hấp dẫn.",
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
      name: "Combo Ria's Lunch Burger 42K",
      slug: "combo-rias-lunch-burger",
      shortDescription: "1 Burger Gà Giòn + 1 Khoai tây chiên nhỏ + 1 Pepsi mát lạnh.",
      description: "Combo trưa tiết kiệm dành riêng cho học sinh, sinh viên và dân văn phòng. Áp dụng các ngày trong tuần từ 10h30 - 14h00.",
      price: 65000,
      salePrice: 42000,
      imageUrl: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=800&q=80",
      categoryId: categories["combo"],
      isBestSeller: true,
      isNew: true,
      sortOrder: 1,
    },
    {
      name: "Combo Ria's Lunch Gà Rán 49K",
      slug: "combo-rias-lunch-ga-ran",
      shortDescription: "1 Miếng Gà Rán Giòn Cay + 1 Cơm Trắng Súp + 1 Pepsi cỡ vừa.",
      description: "Bữa trưa no nê với đùi gà vàng ươm giòn rụm kèm cơm dẻo và súp bắp tươi ngon.",
      price: 72000,
      salePrice: 49000,
      imageUrl: "https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=800&q=80",
      categoryId: categories["combo"],
      isBestSeller: true,
      isNew: false,
      sortOrder: 2,
    },
    {
      name: "Combo Gia Đình Vui Vẻ",
      slug: "combo-gia-dinh-vui-ve",
      shortDescription: "4 Miếng Gà Rán + 2 Burger Bò + 1 Khoai lắc phô mai + 4 Pepsi.",
      description: "Thích hợp cho bữa tiệc gia đình hoặc nhóm bạn 3-4 người thưởng thức trọn vẹn hương vị Chicky Licky.",
      price: 249000,
      salePrice: 199000,
      imageUrl: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80",
      categoryId: categories["combo"],
      isBestSeller: true,
      isNew: false,
      sortOrder: 3,
    },
    // Burger
    {
      name: "Burger Bò Nướng Bulgogi",
      slug: "burger-bo-nuong-bulgogi",
      shortDescription: "Thịt bò Úc nướng sốt Bulgogi trứ danh, xà lách tươi và phô mai cheddar.",
      description: "Hương vị thịt bò nướng thơm lừng kết hợp với nước sốt Bulgogi đậm đà kiểu Hàn Quốc, kèm rau củ giòn ngọt tự nhiên.",
      price: 49000,
      salePrice: 45000,
      imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
      categoryId: categories["burger"],
      isBestSeller: true,
      isNew: false,
      sortOrder: 4,
    },
    {
      name: "Burger Tôm Giòn Cay",
      slug: "burger-tom-gion-cay",
      shortDescription: "Patty tôm biển nguyên chất chiên xù, xốt thousand island cay nhẹ.",
      description: "Từng con tôm tươi ngọt sần sật bọc bột chiên giòn tan, kích thích vị giác với xốt đặc chế.",
      price: 52000,
      salePrice: null,
      imageUrl: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80",
      categoryId: categories["burger"],
      isBestSeller: false,
      isNew: true,
      sortOrder: 5,
    },
    {
      name: "Burger Phô Mai Chicky Double",
      slug: "burger-pho-mai-chicky-double",
      shortDescription: "2 Lớp thịt bò nướng mọng nước kẹp giữa 2 lát phô mai tan chảy.",
      description: "Sự kết hợp hoàn hảo giữa gấp đôi thịt bò nướng trên lửa hồng và phô mai béo ngậy.",
      price: 69000,
      salePrice: 59000,
      imageUrl: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80",
      categoryId: categories["burger"],
      isBestSeller: true,
      isNew: false,
      sortOrder: 6,
    },
    // Gà Rán
    {
      name: "Gà Rán Giòn Truyền Thống (1 Miếng)",
      slug: "ga-ran-gion-truyen-thong",
      shortDescription: "Miếng đùi hoặc ức gà tẩm bột giòn tan, ướp gia vị 11 loại thảo mộc.",
      description: "Lớp vỏ ngoài giòn rụm màu vàng óng, thịt gà bên trong mềm ngọt, giữ trọn độ ẩm thơm ngon.",
      price: 36000,
      salePrice: null,
      imageUrl: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80",
      categoryId: categories["ga-ran"],
      isBestSeller: true,
      isNew: false,
      sortOrder: 7,
    },
    {
      name: "Gà Rán Sốt Đậu Ngọt Cay (3 Miếng)",
      slug: "ga-ran-sot-dau-ngot-cay",
      shortDescription: "Gà chiên phủ đẫm sốt đậu Hàn Quốc thơm lừng vị cay ngọt quyến rũ.",
      description: "Món ăn gây nghiện của giới trẻ với lớp sốt bóng mượt quyện vừng rang thơm nức.",
      price: 105000,
      salePrice: 95000,
      imageUrl: "https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=800&q=80",
      categoryId: categories["ga-ran"],
      isBestSeller: true,
      isNew: true,
      sortOrder: 8,
    },
    {
      name: "Gà Lắc Phô Mai Tuyết",
      slug: "ga-lac-pho-mai-tuyet",
      shortDescription: "Gà miếng giòn lắc đều bột phô mai tuyết ngọt bùi thơm lừng.",
      description: "Hương vị phô mai ngọt dịu phủ đều từng miếng gà giòn rụm nóng hổi.",
      price: 42000,
      salePrice: null,
      imageUrl: "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80",
      categoryId: categories["ga-ran"],
      isBestSeller: false,
      isNew: true,
      sortOrder: 9,
    },
    // Cơm & Mì Ý
    {
      name: "Cơm Gà Sốt Đậu Hạt Điều",
      slug: "com-ga-sot-dau-hat-dieu",
      shortDescription: "Cơm trắng dẻo thơm, gà giòn sốt đậu, salad dưa leo cà chua thanh mát.",
      description: "Bữa ăn đầy đủ dinh dưỡng với thịt gà chất lượng cao và gạo thơm dẻo.",
      price: 48000,
      salePrice: 42000,
      imageUrl: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80",
      categoryId: categories["com-mi-y"],
      isBestSeller: true,
      isNew: false,
      sortOrder: 10,
    },
    {
      name: "Mì Ý Thịt Bò Bằm Sốt Cà Chua",
      slug: "mi-y-thit-bo-bam-sot-ca-chua",
      shortDescription: "Sợi mì Ý dai mềm, nước sốt cà chua thịt bò bằm tươi rắc phô mai bào.",
      description: "Mì Ý nấu đúng chuẩn truyền thống với nước xốt cà chua đậm đặc và thịt bò xay mềm ngon.",
      price: 45000,
      salePrice: 39000,
      imageUrl: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80",
      categoryId: categories["com-mi-y"],
      isBestSeller: true,
      isNew: false,
      sortOrder: 11,
    },
    // Ăn nhẹ
    {
      name: "Khoai Tây Lắc Phô Mai",
      slug: "khoai-tay-lac-pho-mai",
      shortDescription: "Khoai tây chiên vàng giòn rụm lắc đẫm bột phô mai mặn ngọt.",
      description: "Món ăn kèm khoái khẩu không thể thiếu trong mọi đơn hàng Chicky Licky.",
      price: 35000,
      salePrice: null,
      imageUrl: "https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=800&q=80",
      categoryId: categories["thuc-an-nhe"],
      isBestSeller: true,
      isNew: false,
      sortOrder: 12,
    },
    {
      name: "Phô Mai Que Kéo Sợi (3 Cái)",
      slug: "pho-mai-que-keo-soi",
      shortDescription: "Mozzarella hảo hạng chiên xù, kéo sợi dài béo ngậy.",
      description: "Chiên nóng giòn, lớp phô mai bên trong kéo sợi dẻo bùi cực kỳ đã miệng.",
      price: 38000,
      salePrice: 32000,
      imageUrl: "https://images.unsplash.com/photo-1548340748-6d2b7d7da280?auto=format&fit=crop&w=800&q=80",
      categoryId: categories["thuc-an-nhe"],
      isBestSeller: false,
      isNew: true,
      sortOrder: 13,
    },
    // Đồ uống
    {
      name: "Pepsi Tươi Mát Lạnh",
      slug: "pepsi-tuoi-mat-lanh",
      shortDescription: "Nước ngọt có ga sảng khoái đánh tan dầu mỡ.",
      description: "Ly lớn sảng khoái với đá tinh khiết mát lạnh.",
      price: 18000,
      salePrice: null,
      imageUrl: "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?auto=format&fit=crop&w=800&q=80",
      categoryId: categories["thuc-uong"],
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
      categoryId: categories["thuc-uong"],
      isBestSeller: true,
      isNew: true,
      sortOrder: 15,
    },
  ] : [];

  for (const product of productsData) {
    await prisma.product.create({ data: product });
  }
  console.log(`🍔 Created ${productsData.length} Products.`);

  // 5. Create Banners
  const bannersData = [
    {
      title: "Ria's Lunch - Ăn Trưa Thôi!",
      description: "Combo trưa ngon tuyệt giá chỉ từ 42.000đ áp dụng Thứ 2 - Thứ 6 hàng tuần.",
      imageUrl: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=1200&q=80",
      link: "/menu",
      position: "HERO",
      sortOrder: 1,
      isActive: true,
    },
    {
      title: "Gà Rán Giòn Tan - Thơm Cay Đậm Vị",
      description: "Thưởng thức đùi gà chiên nóng hổi giòn rụm cùng sốt cay đặc quyền Chicky Licky.",
      imageUrl: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=1200&q=80",
      link: "/menu?category=ga-ran",
      position: "HERO",
      sortOrder: 2,
      isActive: true,
    },
    {
      title: "Ưu Đãi Đăng Ký Hội Viên",
      description: "Tích điểm cho mỗi đơn hàng và đổi nhiều quà hấp dẫn cùng Chicky Club.",
      imageUrl: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80",
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
      title: "Ria's Lunch Ăn Trưa Giá Sốc 42K - 49K",
      slug: "rias-lunch-an-trua-gia-soc",
      description: "Chương trình ưu đãi bữa trưa đặc biệt cho khách hàng: Burger kèm khoai tây và nước chỉ 42.000đ, Cơm gà chiên súp và nước ngọt chỉ 49.000đ. Áp dụng từ 10h30 đến 14h00 các ngày trong tuần (không áp dụng Thứ 7, Chủ Nhật và ngày Lễ).",
      imageUrl: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=800&q=80",
      discountType: "FIXED",
      discountValue: 23000,
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-12-31"),
      isActive: true,
    },
    {
      title: "Đại Tiệc Cuối Tuần - Mua 2 Tặng 1 Gà Rán",
      slug: "dai-tiec-cuoi-tuan-mua-2-tang-1",
      description: "Vào các ngày Thứ 7 và Chủ Nhật hàng tuần, khi mua từ 2 miếng gà rán bất kỳ, quý khách sẽ được tặng ngay 1 miếng gà rán giòn rụm hoặc 1 ly Pepsi tươi mát lạnh.",
      imageUrl: "https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=800&q=80",
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
      imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
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
    { key: "SITE_TAGLINE", value: "Gà Giòn Chuẩn Vị - Bữa Ăn Hạnh Phúc" },
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
          "Chicky Licky là chuỗi nhà hàng thức ăn nhanh hiện đại chuyên phục vụ các món gà rán giòn rụm, burger hảo hạng, cơm trưa và mì Ý đậm đà hương vị Á - Âu.",
          "Trong suốt hành trình phát triển, Chicky Licky luôn nỗ lực không ngừng để đem đến cho khách hàng trải nghiệm ẩm thực chất lượng, an toàn vệ sinh thực phẩm với các tiêu chuẩn quốc tế nghiêm ngặt như RVA HACCP, ISO 14001 và ISO 9001.",
          "Hiện nay, Chicky Licky đã có mặt tại nhiều tỉnh thành trên cả nước với hàng chục nhà hàng khang trang, hiện đại và dịch vụ giao hàng tận nơi nhanh chóng, thân thiện."
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
      subtotal: 107000,
      discountAmount: 20000,
      shippingFee: 15000,
      totalAmount: 102000,
      couponCode: "CHICKY20",
      paymentMethod: "COD",
      paymentStatus: "PENDING",
      status: "CONFIRMED",
      deliveryType: "DELIVERY",
      note: "Giao trước 12h trưa giúp mình, xin thêm tương ớt.",
      items: {
        create: [
          {
            productName: "Combo Ria's Lunch Burger 42K",
            productImage: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=800&q=80",
            unitPrice: 42000,
            quantity: 1,
            subtotal: 42000,
          },
          {
            productName: "Burger Bò Nướng Bulgogi",
            productImage: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
            unitPrice: 45000,
            quantity: 1,
            subtotal: 45000,
          },
          {
            productName: "Khoai Tây Lắc Phô Mai",
            productImage: "https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=800&q=80",
            unitPrice: 35000,
            quantity: 1,
            subtotal: 35000,
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
