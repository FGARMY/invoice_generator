import { LineItem, Discount, Tax } from '@/types/invoice';

export function calcLineTotal(item: LineItem): number {
  return item.quantity * item.unitPrice;
}

export function calcSubtotal(items: LineItem[]): number {
  return items.reduce((sum, item) => sum + calcLineTotal(item), 0);
}

export function calcDiscountAmount(subtotal: number, discount: Discount): number {
  if (discount.value <= 0) return 0;
  if (discount.type === 'flat') {
    return Math.min(discount.value, subtotal);
  }
  return (subtotal * discount.value) / 100;
}

export function calcTaxAmount(
  subtotal: number,
  discount: Discount,
  tax: Tax
): number {
  const afterDiscount = subtotal - calcDiscountAmount(subtotal, discount);
  if (tax.rate <= 0) return 0;
  return (afterDiscount * tax.rate) / 100;
}

/**
 * For GST, returns the split amounts.
 * Intra-state: CGST (rate/2) + SGST (rate/2)
 * Inter-state: IGST (full rate)
 */
export function calcGSTSplit(
  subtotal: number,
  discount: Discount,
  tax: Tax
): { cgst: number; sgst: number; igst: number } {
  const totalTax = calcTaxAmount(subtotal, discount, tax);
  if (!tax.isGST) {
    return { cgst: 0, sgst: 0, igst: 0 };
  }
  if (tax.gstType === 'interState') {
    return { cgst: 0, sgst: 0, igst: totalTax };
  }
  // intra-state: split equally
  const half = totalTax / 2;
  return { cgst: half, sgst: half, igst: 0 };
}

export function calcItemTax(item: LineItem): number {
  if (item.taxRate <= 0) return 0;
  return (calcLineTotal(item) * item.taxRate) / 100;
}

export function calcGrandTotal(
  subtotal: number,
  discount: Discount,
  tax: Tax,
  shipping: number
): number {
  const discountAmount = calcDiscountAmount(subtotal, discount);
  const taxAmount = calcTaxAmount(subtotal, discount, tax);
  return subtotal - discountAmount + taxAmount + (shipping || 0);
}
