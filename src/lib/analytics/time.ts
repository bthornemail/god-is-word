// ============================================================================
// time.ts - Time Utilities for Analytics
// ============================================================================

/**
 * Returns today's date in YYYY-MM-DD format
 */
export function getTodayDate(): string {
  const today = new Date();
  return formatDate(today);
}

/**
 * Returns yesterday's date in YYYY-MM-DD format
 */
export function getYesterdayDate(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return formatDate(yesterday);
}

/**
 * Formats a Date object to YYYY-MM-DD string
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parses a YYYY-MM-DD string or ISO timestamp to Date
 */
export function parseDate(dateStr: string): Date {
  // If it's already YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return new Date(dateStr + 'T00:00:00');
  }
  // Otherwise parse as ISO string
  return new Date(dateStr);
}

/**
 * Extracts date from timestamp string
 */
export function getDateFromTimestamp(timestamp: string): string {
  const date = parseDate(timestamp);
  return formatDate(date);
}

/**
 * Checks if two dates are the same day
 */
export function isSameDay(date1: string, date2: string): boolean {
  return date1 === date2;
}

/**
 * Gets hour of day from timestamp (0-23)
 */
export function getHourOfDay(timestamp: string): number {
  const date = parseDate(timestamp);
  return date.getHours();
}

/**
 * Gets day of week (0 = Sunday, 6 = Saturday)
 */
export function getDayOfWeek(date: string): number {
  const d = parseDate(date);
  return d.getDay();
}

/**
 * Gets day of week name
 */
export function getDayOfWeekName(date: string): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[getDayOfWeek(date)];
}

/**
 * Checks if a date is today
 */
export function isToday(dateStr: string): boolean {
  return isSameDay(dateStr, getTodayDate());
}

/**
 * Gets number of days between two dates
 */
export function daysBetween(date1: string, date2: string): number {
  const d1 = parseDate(date1);
  const d2 = parseDate(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

