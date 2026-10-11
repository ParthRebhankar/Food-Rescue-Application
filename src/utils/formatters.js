/**
 * Utility formatters for prices, dates, discount percentages, and categories.
 */

export function formatCurrency(amount) {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(num);
}

export function calculateDiscountPercent(originalPrice, discountedPrice) {
  const orig = Number(originalPrice);
  const disc = Number(discountedPrice);
  if (!orig || orig <= 0 || disc >= orig) return 0;
  return Math.round(((orig - disc) / orig) * 100);
}

export function formatDateTime(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date);
}

export function formatPickupDeadline(deadline) {
  if (!deadline) return 'No deadline';
  const target = new Date(deadline);
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();

  if (diffMs <= 0) {
    return 'Expired';
  }

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (diffHours < 1) {
    return `Ends in ${diffMinutes}m`;
  }
  if (diffHours < 24) {
    return `Ends in ${diffHours}h ${diffMinutes}m`;
  }
  const days = Math.floor(diffHours / 24);
  return `${days}d remaining`;
}

export function getCategoryBadgeClasses(category) {
  switch (category) {
    case 'Bakery':
      return 'bg-amber-100 text-amber-900 border-amber-200';
    case 'Restaurant':
      return 'bg-orange-100 text-orange-900 border-orange-200';
    case 'Grocery':
      return 'bg-emerald-100 text-emerald-900 border-emerald-200';
    case 'Other':
    default:
      return 'bg-forest-100 text-forest-900 border-forest-200';
  }
}

export function getStatusBadgeClasses(status) {
  switch (status) {
    case 'reserved':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'picked_up':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'cancelled':
      return 'bg-rose-100 text-rose-800 border-rose-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}
