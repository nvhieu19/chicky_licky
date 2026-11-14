import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { checkoutSchema } from "@/lib/validations";
import { generateOrderCode } from "@/lib/utils";

const FREE_SHIPPING_THRESHOLD = 150000;
const STANDARD_SHIPPING_FEE = 15000;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message || "Thông tin đơn hàng không hợp lệ" },
        { status: 400 }
      );
    }

    const {
      recipientName,
      phone,
      email,
      address,
      deliveryType,
      storeId,
      note,
      paymentMethod,
      couponCode,
      items,
    } = parsed.data;

    // Check optional authenticated user session
    const session = await getSession();
    const sessionUser = session?.userId
      ? await prisma.user.findUnique({
          where: { id: session.userId },
          select: { id: true, isActive: true },
        })
      : null;
    const orderUserId = sessionUser?.isActive ? sessionUser.id : null;

    if (session?.userId && !orderUserId) {
      console.warn("Order submitted with a stale or inactive user session; creating as guest.");
    }

    // 1. Fetch real prices & details from database (Security Rule: Never trust client price)
    const productIds = items.map((i) => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        isAvailable: true,
      },
    });

    if (dbProducts.length === 0) {
      return NextResponse.json(
        { message: "Không tìm thấy sản phẩm hoặc sản phẩm đã ngừng bán" },
        { status: 400 }
      );
    }

    // Map items with server prices
    let subtotal = 0;
    const orderItemsData = items.map((item) => {
      const product = dbProducts.find((p) => p.id === item.productId);
      if (!product) {
        throw new Error(`Sản phẩm không tồn tại`);
      }
      const unitPrice = product.salePrice ? Number(product.salePrice) : Number(product.price);
      const itemSubtotal = unitPrice * item.quantity;
      subtotal += itemSubtotal;

      return {
        productId: product.id,
        productName: product.name,
        productImage: product.imageUrl,
        unitPrice,
        quantity: item.quantity,
        subtotal: itemSubtotal,
      };
    });

    // 2. Validate Coupon server-side
    let discountAmount = 0;
    let validCouponId: string | null = null;

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.trim().toUpperCase() },
      });

      if (coupon && coupon.isActive) {
        const now = new Date();
        const isDateValid = now >= coupon.startDate && now <= coupon.endDate;
        const isLimitValid = !coupon.usageLimit || coupon.usedCount < coupon.usageLimit;
        const isMinOrderValid = subtotal >= Number(coupon.minimumOrderValue);

        if (isDateValid && isLimitValid && isMinOrderValid) {
          validCouponId = coupon.id;
          if (coupon.discountType === "PERCENT") {
            discountAmount = (subtotal * Number(coupon.discountValue)) / 100;
            if (coupon.maximumDiscount && discountAmount > Number(coupon.maximumDiscount)) {
              discountAmount = Number(coupon.maximumDiscount);
            }
          } else {
            discountAmount = Number(coupon.discountValue);
          }
        }
      }
    }

    if (discountAmount > subtotal) {
      discountAmount = subtotal;
    }

    // 3. Calculate shipping fee
    const shippingFee =
      deliveryType === "PICKUP" || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;

    const totalAmount = subtotal - discountAmount + shippingFee;
    const orderCode = generateOrderCode();

    // 4. Create in Database via Transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderCode,
          userId: orderUserId,
          recipientName,
          phone,
          email,
          address,
          subtotal,
          discountAmount,
          shippingFee,
          totalAmount,
          couponCode: validCouponId ? couponCode : null,
          paymentMethod,
          paymentStatus: "PENDING",
          status: "PENDING",
          deliveryType,
          storeId: deliveryType === "PICKUP" ? storeId : null,
          note,
          items: {
            create: orderItemsData,
          },
          statusHistory: {
            create: {
              newStatus: "PENDING",
              changedBy: session?.name || "Khách hàng",
              note: "Đơn hàng mới được tạo trực tuyến",
            },
          },
        },
      });

      // Increment coupon usage count if used
      if (validCouponId) {
        await tx.coupon.update({
          where: { id: validCouponId },
          data: { usedCount: { increment: 1 } },
        });
      }

      return newOrder;
    });

    return NextResponse.json({
      message: "Đặt hàng thành công!",
      order: {
        id: order.id,
        orderCode: order.orderCode,
        totalAmount: Number(order.totalAmount),
      },
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { message: "Đã có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
