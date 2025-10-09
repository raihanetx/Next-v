export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export function formatPrice(
  price: number,
  currency: 'BDT' | 'USD',
  usdRate: number = 110
): string {
  if (currency === 'USD') {
    if (!price || !usdRate) return '$0.00';
    const usdPrice = price / usdRate;
    return `$${usdPrice.toFixed(2)}`;
  }
  return `৳${Number(price).toFixed(2)}`;
}

export function generateOrderId(): string {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD${timestamp}${random}`;
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString();
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}