export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function addDays(isoDate: string, delta: number): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + delta);
  return toISODate(date);
}

export interface YearMonth {
  year: number;
  month: number; // 0-indexiert, wie JS Date
}

export function addMonths({ year, month }: YearMonth, delta: number): YearMonth {
  const total = year * 12 + month + delta;
  return { year: Math.floor(total / 12), month: ((total % 12) + 12) % 12 };
}

export function getMonthDays(year: number, month: number): string[] {
  const days: string[] = [];
  const date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    days.push(toISODate(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}

export function firstWeekdayOffset(year: number, month: number): number {
  const jsDay = new Date(year, month, 1).getDay(); // 0=Sonntag..6=Samstag
  return (jsDay + 6) % 7; // 0=Montag..6=Sonntag
}
