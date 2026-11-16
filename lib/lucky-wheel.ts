import { z } from "zod";

export const LUCKY_WHEEL_SETTINGS_ID = "default";
export const LUCKY_WHEEL_TOTAL_BPS = 10_000;
export const NO_PRIZE_NAME = "Chúc bạn may mắn lần sau";

export async function readLuckyWheelBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}

const imageUrlSchema = z
  .string()
  .min(1, "Vui lòng thêm hình ảnh phần thưởng")
  .max(3_000_000, "Ảnh quá lớn")
  .refine(
    (value) =>
      /^data:image\/(?:jpeg|png|webp);base64,/i.test(value) ||
      (() => {
        try {
          return ["http:", "https:"].includes(new URL(value).protocol);
        } catch {
          return false;
        }
      })(),
    "Hình ảnh phải là URL http(s) hoặc ảnh JPEG, PNG, WEBP"
  );

export const luckyWheelSettingsSchema = z.object({
  title: z.string().trim().min(1).max(191),
  subtitle: z.string().trim().max(500),
  noPrizeMessage: z.string().trim().min(1).max(5000),
  defaultClaimInstruction: z.string().trim().max(5000),
  isEnabled: z.boolean(),
  showFloatingWidget: z.boolean(),
});

export const luckyWheelPrizeSchema = z.object({
  name: z.string().trim().min(1, "Vui lòng nhập tên phần thưởng").max(191),
  description: z.string().trim().max(5000).nullable(),
  imageUrl: imageUrlSchema,
  quantityTotal: z.number().int().min(0).max(1_000_000),
  winRateBps: z.number().int().min(0).max(LUCKY_WHEEL_TOTAL_BPS),
  claimInstruction: z.string().trim().max(5000).nullable(),
  sortOrder: z.number().int().min(0).max(1_000_000),
  isActive: z.boolean(),
});

export function getAdminErrorStatus(error: unknown): number | null {
  if (error instanceof Error && error.message === "UNAUTHORIZED") return 401;
  if (error instanceof Error && error.message === "FORBIDDEN") return 403;
  return null;
}

