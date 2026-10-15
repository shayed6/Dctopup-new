/**
 * Clean, unambiguous date & time formatter for orders and transactions.
 * Formats time as "hh:mm A, DD MMM YYYY" (e.g. "03:08 PM, 03 Oct 2026").
 * Prevents 3-part colon strings (seconds) that cause minutes/seconds confusion.
 */
export const formatOrderDateTime = (dateInput?: Date | string | number | null): string => {
  if (!dateInput) return '';
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);

  const hours = d.getHours();
  const minutes = d.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  const padHours = String(formattedHours).padStart(2, '0');
  const padMinutes = String(minutes).padStart(2, '0');

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = String(d.getDate()).padStart(2, '0');
  const month = months[d.getMonth()];
  const year = d.getFullYear();

  return `${padHours}:${padMinutes} ${ampm}, ${day} ${month} ${year}`;
};

export const formatTimeOnly = (dateInput?: Date | string | number | null): string => {
  if (!dateInput) return '';
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);

  const hours = d.getHours();
  const minutes = d.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  const padHours = String(formattedHours).padStart(2, '0');
  const padMinutes = String(minutes).padStart(2, '0');

  return `${padHours}:${padMinutes} ${ampm}`;
};
