import { z } from "zod";

export const loginSchema = z.object({
  emailOrPhone: z.string().min(1, "Vui lòng nhập email hoặc số điện thoại"),
  password: z.string().min(6, "Mật khẩu phải từ 6 ký tự trở lên"),
  remember: z.boolean().optional(),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Họ và tên phải từ 2 ký tự trở lên"),
    email: z.string().email("Email không hợp lệ"),
    phone: z
      .string()
      .min(10, "Số điện thoại không hợp lệ")
      .regex(/^[0-9+]+$/, "Số điện thoại chỉ được chứa số"),
    password: z.string().min(6, "Mật khẩu phải từ 6 ký tự trở lên"),
    confirmPassword: z.string().min(6, "Vui lòng xác nhận lại mật khẩu"),
    agreeTerms: z.boolean().refine((val) => val === true, "Bạn phải đồng ý với điều khoản sử dụng"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export const checkoutSchema = z.object({
  recipientName: z.string().min(2, "Vui lòng nhập họ và tên người nhận"),
  phone: z
    .string()
    .min(10, "Vui lòng nhập số điện thoại hợp lệ")
    .regex(/^[0-9+]+$/, "Số điện thoại chỉ chứa số"),
  email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  address: z.string().min(5, "Vui lòng nhập địa chỉ nhận hàng chi tiết"),
  deliveryType: z.enum(["DELIVERY", "PICKUP"]).default("DELIVERY"),
  storeId: z.string().optional().nullable(),
  note: z.string().max(500, "Ghi chú không quá 500 ký tự").optional(),
  includePlasticCutlery: z.boolean().default(true),
  paymentMethod: z.enum(["COD", "BANKING", "MOMO", "VNPAY"]).default("COD"),
  couponCode: z.string().optional().nullable(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1, "Số lượng tối thiểu là 1"),
      })
    )
    .min(1, "Giỏ hàng không có sản phẩm nào"),
});

export const productSchema = z.object({
  name: z.string().min(2, "Tên món ăn ít nhất 2 ký tự"),
  slug: z.string().min(2, "Slug không được để trống"),
  shortDescription: z.string().max(500).optional().nullable(),
  description: z.string().optional().nullable(),
  price: z.coerce.number().positive("Giá bán phải lớn hơn 0"),
  salePrice: z.coerce.number().positive("Giá khuyến mãi phải lớn hơn 0").optional().nullable(),
  imageUrl: z.string().min(1, "Vui lòng cung cấp hình ảnh món ăn"),
  categoryId: z.string().min(1, "Vui lòng chọn danh mục"),
  isBestSeller: z.boolean().default(false),
  isNew: z.boolean().default(false),
  isAvailable: z.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
});

export const categorySchema = z.object({
  name: z.string().min(2, "Tên danh mục ít nhất 2 ký tự"),
  slug: z.string().min(2, "Slug không được để trống"),
  description: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable().or(z.literal("")),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const bannerSchema = z.object({
  title: z.string().min(2, "Tiêu đề ít nhất 2 ký tự"),
  description: z.string().optional().nullable(),
  imageUrl: z.string().min(1, "Vui lòng cung cấp hình ảnh banner"),
  link: z.string().optional().nullable(),
  position: z.string().default("HERO"),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const promotionSchema = z
  .object({
    title: z.string().min(2, "Tiêu đề ít nhất 2 ký tự"),
    slug: z.string().min(2, "Slug không được để trống"),
    description: z.string().optional().nullable(),
    imageUrl: z.string().min(1, "Vui lòng cung cấp hình ảnh khuyến mãi"),
    discountType: z.enum(["PERCENT", "FIXED", "COMBO"]).default("PERCENT"),
    discountValue: z.coerce.number().min(0, "Giá trị giảm không được âm"),
    comboPrice: z.coerce.number().positive("Giá combo phải lớn hơn 0").optional().nullable(),
    comboItems: z
      .array(
        z.object({
          productId: z.string().min(1),
          quantity: z.number().int().positive().default(1),
        })
      )
      .optional()
      .nullable(),
    startDate: z.string().min(1, "Vui lòng chọn ngày bắt đầu"),
    endDate: z.string().min(1, "Vui lòng chọn ngày kết thúc"),
    isActive: z.boolean().default(true),
  })
  .superRefine((promotion, context) => {
    if (promotion.endDate < promotion.startDate) {
      context.addIssue({
        code: "custom",
        message: "Ngày kết thúc phải sau hoặc bằng ngày bắt đầu",
        path: ["endDate"],
      });
    }

    if (promotion.discountType === "PERCENT" && promotion.discountValue > 100) {
      context.addIssue({
        code: "custom",
        message: "Mức giảm theo phần trăm không được vượt quá 100%",
        path: ["discountValue"],
      });
    }

    if (promotion.discountType === "PERCENT" && promotion.discountValue <= 0) {
      context.addIssue({
        code: "custom",
        message: "Giá trị giảm phải lớn hơn 0",
        path: ["discountValue"],
      });
    }

    if (promotion.discountType === "FIXED" && promotion.discountValue <= 0) {
      context.addIssue({
        code: "custom",
        message: "Giá trị giảm phải lớn hơn 0",
        path: ["discountValue"],
      });
    }

    if (promotion.discountType === "COMBO") {
      if (!promotion.comboPrice || promotion.comboPrice <= 0) {
        context.addIssue({
          code: "custom",
          message: "Vui lòng nhập giá combo",
          path: ["comboPrice"],
        });
      }
      if (!promotion.comboItems || promotion.comboItems.length === 0) {
        context.addIssue({
          code: "custom",
          message: "Vui lòng chọn ít nhất 1 món cho combo",
          path: ["comboItems"],
        });
      }
    }
  });

export const couponSchema = z.object({
  code: z.string().min(3, "Mã coupon ít nhất 3 ký tự").toUpperCase(),
  discountType: z.enum(["PERCENT", "FIXED"]).default("PERCENT"),
  discountValue: z.coerce.number().positive("Mức giảm phải lớn hơn 0"),
  minimumOrderValue: z.coerce.number().min(0).default(0),
  maximumDiscount: z.coerce.number().positive().optional().nullable(),
  usageLimit: z.coerce.number().int().positive().optional().nullable(),
  startDate: z.string().min(1, "Vui lòng chọn ngày bắt đầu"),
  endDate: z.string().min(1, "Vui lòng chọn ngày kết thúc"),
  isActive: z.boolean().default(true),
});

export const storeSchema = z.object({
  name: z.string().min(2, "Tên chi nhánh ít nhất 2 ký tự"),
  address: z.string().min(5, "Địa chỉ chi tiết"),
  phone: z.string().min(8, "Số điện thoại cửa hàng"),
  openingHours: z.string().default("08:00 - 22:00"),
  imageUrl: z.string().optional().nullable().or(z.literal("")),
  latitude: z.coerce.number().optional().nullable(),
  longitude: z.coerce.number().optional().nullable(),
  isActive: z.boolean().default(true),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type BannerInput = z.infer<typeof bannerSchema>;
export type PromotionInput = z.infer<typeof promotionSchema>;
export type CouponInput = z.infer<typeof couponSchema>;
export type StoreInput = z.infer<typeof storeSchema>;
