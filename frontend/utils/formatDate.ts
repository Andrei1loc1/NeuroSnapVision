export function formatDate(
  date: Date | string | number,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = new Date(date);
  return d.toLocaleDateString("ro-RO", {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  });
}

export function formatRelativeDate(date: Date | string | number): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "acum câteva secunde";
  if (diffMins < 60) return `acum ${diffMins} minute`;
  if (diffHours < 24) return `acum ${diffHours} ore`;
  if (diffDays < 7) return `acum ${diffDays} zile`;
  if (diffDays < 30) return `acum ${Math.floor(diffDays / 7)} săptămâni`;
  if (diffDays < 365) return `acum ${Math.floor(diffDays / 30)} luni`;
  return `acum ${Math.floor(diffDays / 365)} ani`;
}

export function formatTime(date: Date | string | number): string {
  const d = new Date(date);
  return d.toLocaleTimeString("ro-RO", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateTime(
  date: Date | string | number,
  options?: Intl.DateTimeFormatOptions
): string {
  return `${formatDate(date, options)} la ${formatTime(date)}`;
}