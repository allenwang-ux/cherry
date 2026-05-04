import { formatDate, getWeekDates, parseDateText } from './date-utils.js';
import { getSchedules, getSchedulesByDate } from './sheets.js';
import { SHIFT_CODES } from './shift-config.js';

export async function createReplyText(userText, options = {}) {
  const text = userText.trim();
  const scheduleProvider = options.scheduleProvider ?? getSchedules;
  const dateScheduleProvider = options.dateScheduleProvider ?? getSchedulesByDate;
  const now = options.now ?? new Date();

  if (isHelpText(text)) {
    return getHelpText();
  }

  if (['填班', '我要填班', '班表系統', '開放填班'].includes(text)) {
    return `請點這裡進入填班系統：\n${getScheduleUrl(options)}`;
  }

  if (text === '本週排班' || text === '這週排班') {
    const schedules = await scheduleProvider();
    return formatScheduleReply('本週排班', filterSchedulesByDates(schedules, getWeekDates(now)));
  }

  const employeeName = parseEmployeeName(text);
  if (employeeName) {
    const schedules = await scheduleProvider();
    const matchedSchedules = schedules.filter((schedule) => schedule.employee.includes(employeeName));
    return formatScheduleReply(`${employeeName} 的排班`, matchedSchedules);
  }

  if (text.includes('排班')) {
    const dateText = parseDateText(text, now);
    if (dateText) {
      return formatScheduleReply(`${dateText} 排班`, await dateScheduleProvider(dateText));
    }
  }

  return getHelpText();
}

export function formatScheduleReply(title, schedules) {
  if (schedules.length === 0) {
    return `${title}\n目前沒有排班資料。`;
  }

  const lines = schedules.map((schedule) => {
    const date = title.includes(schedule.date) ? '' : `${schedule.date} `;
    const note = schedule.note ? ` ${schedule.note}` : '';
    const employee = schedule.employee || '未填';
    return `${date}${schedule.shift} ${employee}${note}`.trim();
  });

  return [title, ...lines].join('\n');
}

function filterSchedulesByDates(schedules, dateTexts) {
  const dateSet = new Set(dateTexts);
  return schedules.filter((schedule) => dateSet.has(schedule.date));
}

function isHelpText(text) {
  return ['help', 'Help', 'HELP', '說明', '幫助', '指令'].includes(text);
}

function parseEmployeeName(text) {
  const match = text.match(/^(?:查詢?|看)?\s*(.+?)\s*(?:的)?排班$/);

  if (!match) {
    return null;
  }

  const name = match[1].trim();
  if (['今日', '今天', '明日', '明天', '本週', '這週'].includes(name) || /\d/.test(name)) {
    return null;
  }

  return name;
}

function getHelpText() {
  return [
    '可用指令：',
    '今日排班',
    '明日排班',
    '5/4 排班',
    '本週排班',
    '小明排班',
    '填班',
    `班別：${SHIFT_CODES.join(' / ')}`,
  ].join('\n');
}

function getScheduleUrl(options = {}) {
  const configuredUrl = String(process.env.PUBLIC_BASE_URL || '').trim();
  const requestUrl = String(options.publicBaseUrl || '').trim();
  const fallbackUrl = `http://localhost:${process.env.PORT || 3000}`;
  const baseUrl = isUsableBaseUrl(configuredUrl)
    ? configuredUrl
    : isUsableBaseUrl(requestUrl)
      ? requestUrl
      : fallbackUrl;

  return `${baseUrl.replace(/\/$/, '')}/schedule`;
}

function isUsableBaseUrl(value) {
  return Boolean(value) && /^https?:\/\//.test(value) && !value.includes('TO_BE_FILLED');
}
