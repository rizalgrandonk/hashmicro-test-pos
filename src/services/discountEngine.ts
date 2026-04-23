import { CartItem } from "../types/session";

export interface ProductDiscount {
  id: number;
  label: string;
  minQuantity: number;
  minSubtotal: number;
  rate: number;
}

export const PPN_RATE = 0.11;

export interface LineItemResult extends CartItem {
  subtotal: number;
  discountRule: string;
  discountRate: number;
  discountAmount: number;
  netAmount: number;
}

export interface DiscountResult {
  lineItems: LineItemResult[];
  totalNet: number;
  taxAmount: number;
  grandTotal: number;
  roundedGrandTotal: number;
}

export function applyDiscounts(
  cartItems: CartItem[],
  discountsByProductId: Map<number, ProductDiscount[]>,
): DiscountResult {
  const lineItems: LineItemResult[] = [];
  let totalNet = 0;

  for (const item of cartItems) {
    const subtotal = item.unitPrice * item.quantity;

    const discounts = discountsByProductId.get(item.productId) ?? [];
    let appliedDiscount: ProductDiscount | null = null;
    let appliedRate = 0;

    for (const discount of discounts) {
      if (item.quantity >= discount.minQuantity) {
        if (subtotal >= discount.minSubtotal) {
          appliedDiscount = discount;
          appliedRate = discount.rate;
        }
      }
    }

    const discountAmount = subtotal * appliedRate;
    const netAmount = subtotal - discountAmount;

    lineItems.push({
      ...item,
      subtotal,
      discountRule: appliedDiscount ? appliedDiscount.label : "No Discount",
      discountRate: appliedRate,
      discountAmount,
      netAmount,
    });

    totalNet += netAmount;
  }

  const taxAmount = totalNet * PPN_RATE;
  const grandTotal = totalNet + taxAmount;
  const roundedGrandTotal = Math.ceil(grandTotal / 1000) * 1000;

  return { lineItems, totalNet, taxAmount, grandTotal, roundedGrandTotal };
}
