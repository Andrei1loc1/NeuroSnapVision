export function getDateRange(searchParams: URLSearchParams) {
  const startParam = searchParams.get("start");
  const endParam = searchParams.get("end");
  const dateParam = searchParams.get("date");

  if (startParam || endParam) {
    const start = startParam ? new Date(startParam) : startOfDay(new Date());
    const end = endParam ? new Date(endParam) : endOfDay(start);
    return { start, end };
  }

  const date = dateParam ? new Date(dateParam) : new Date();
  return {
    start: startOfDay(date),
    end: endOfDay(date),
  };
}

export function startOfDay(date: Date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function endOfDay(date: Date) {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}
