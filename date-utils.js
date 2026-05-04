const DEFAULT_TIME_ZONE = 'Asia/Taipei';

export function formatDate(date = new Date(), timeZone = DEFAULT_TIME_ZONE) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

export function getWeekDates(baseDate = new Date(), timeZone = DEFAULT_TIME_ZONE) {
  const todayText = formatDate(baseDate, timeZone);
  const [year, month, day] = todayText.split('-').map(Number);
  const localDate = new Date(year, month - 1, day);
  const dayOfWeek = localDate.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(localDate);
    date.setDate(localDate.getDate() + mondayOffset + index);
    return formatDate(date, timeZone);
  });
}

export function getMonthDates(baseDate = new Date(), timeZone = DEFAULT_TIME_ZONE) {
  const todayText = formatDate(baseDate, timeZone);
  const [year, month] = todayText.split('-').map(Number);
  const lastDay = new Date(year, month, 0).getDate();

  return Array.from({ length: lastDay }, (_, index) => {
    return normalizeDateParts(year, month, index + 1);
  });
}

export function parseDateText(text, baseDate = new Date(), timeZone = DEFAULT_TIME_ZONE) {
  const normalized = text.trim();

  if (normalized.includes('今天') || normalized.includes('今日')) {
    return formatDate(baseDate, timeZone);
  }

  if (normalized.includes('明天') || normalized.includes('明日')) {
    return formatDate(addDays(baseDate, 1), timeZone);
  }

  const isoMatch = normalized.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (isoMatch) {
    return normalizeDateParts(isoMatch[1], isoMatch[2], isoMatch[3]);
  }

  const shortMatch = normalized.match(/(\d{1,2})[/-](\d{1,2})/);
  if (shortMatch) {
    const year = formatDate(baseDate, timeZone).slice(0, 4);
    return normalizeDateParts(year, shortMatch[1], shortMatch[2]);
  }

  return null;
}

function normalizeDateParts(year, month, day) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}
