/**
 * Currency utility for Indian Rupees (₹)
 * Provides consistent formatting across the application
 */

export const CURRENCY_SYMBOL = "₹";
export const CURRENCY_CODE = "INR";

/**
 * Format amount in Indian Rupees with proper comma separation
 * Examples: 1000 -> ₹1,000  |  100000 -> ₹1,00,000
 */
export function formatCurrency(amount: number): string {
  return `${CURRENCY_SYMBOL}${formatIndianNumber(amount.toFixed(2))}`;
}

/**
 * Format number with Indian numbering system (lakhs, crores)
 * Examples: 1000 -> 1,000  |  100000 -> 1,00,000  |  10000000 -> 1,00,00,000
 */
export function formatIndianNumber(value: number | string): string {
  const numStr = typeof value === "number" ? value.toString() : value;
  const [integerPart, decimalPart] = numStr.split(".");
  
  // Indian numbering: first group of 3 from right, then groups of 2
  if (integerPart.length <= 3) {
    return decimalPart ? `${integerPart}.${decimalPart}` : integerPart;
  }
  
  const lastThree = integerPart.slice(-3);
  const remaining = integerPart.slice(0, -3);
  const formatted = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree;
  
  return decimalPart ? `${formatted}.${decimalPart}` : formatted;
}

/**
 * Convert USD to INR (approximate conversion rate)
 * Current rate: 1 USD ≈ 83 INR
 */
export function convertUSDtoINR(usdAmount: number): number {
  const CONVERSION_RATE = 83;
  return Math.round(usdAmount * CONVERSION_RATE * 100) / 100;
}

/**
 * Format currency for display in compact form
 * Examples: 1000 -> ₹1K  |  100000 -> ₹1L  |  10000000 -> ₹1Cr
 */
export function formatCurrencyCompact(amount: number): string {
  if (amount >= 10000000) {
    return `${CURRENCY_SYMBOL}${(amount / 10000000).toFixed(1)}Cr`;
  }
  if (amount >= 100000) {
    return `${CURRENCY_SYMBOL}${(amount / 100000).toFixed(1)}L`;
  }
  if (amount >= 1000) {
    return `${CURRENCY_SYMBOL}${(amount / 1000).toFixed(0)}K`;
  }
  return formatCurrency(amount);
}
