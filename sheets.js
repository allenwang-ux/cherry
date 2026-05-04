import { google } from 'googleapis';
import { isAllowedShift, normalizeShiftCode } from './shift-config.js';

const {
  GOOGLE_SHEET_ID,
  GOOGLE_SHEET_RANGE = '排班!A1:E20',
  GOOGLE_SERVICE_ACCOUNT_EMAIL,
  GOOGLE_PRIVATE_KEY,
} = process.env;

const EMPLOYEE_SHEET_NAME = '員工名單';
const HISTORY_SHEET_NAME = '填班紀錄';

function assertGoogleSheetsEnv() {
  if (!GOOGLE_SHEET_ID || !GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY) {
    throw new Error('Missing Google Sheets env vars. Copy .env.example to .env and fill it in.');
  }
}

function createSheetsClient() {
  assertGoogleSheetsEnv();

  const auth = new google.auth.JWT({
    email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return google.sheets({ version: 'v4', auth });
}

export async function getScheduleRows() {
  const sheets = createSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: GOOGLE_SHEET_ID,
    range: GOOGLE_SHEET_RANGE,
  });

  return response.data.values ?? [];
}

export async function getSchedules() {
  const rows = await getScheduleRows();
  const [header, ...dataRows] = rows;

  if (!header) {
    return [];
  }

  const columnMap = createColumnMap(header);

  return dataRows
    .map((row, index) => ({
      rowNumber: index + 2,
      date: getCell(row, columnMap, 'date'),
      shift: normalizeShiftCode(getCell(row, columnMap, 'shift')),
      employee: getCell(row, columnMap, 'employee'),
      startTime: getCell(row, columnMap, 'startTime'),
      endTime: getCell(row, columnMap, 'endTime'),
      note: getCell(row, columnMap, 'note'),
    }))
    .filter((schedule) => schedule.date && isAllowedShift(schedule.shift));
}

export async function getSchedulesByDate(dateText) {
  const schedules = await getSchedules();
  return schedules.filter((schedule) => schedule.date === dateText);
}

export async function getEmployees() {
  const sheets = createSheetsClient();
  const records = await getEmployeeRecords(sheets);

  return records
    .filter((record) => record.status === 'active' && record.displayName)
    .map((record) => ({
      lineUserId: record.lineUserId,
      displayName: record.displayName,
    }));
}

export async function registerEmployee(actor) {
  const sheets = createSheetsClient();
  const records = await getEmployeeRecords(sheets);
  const existing = records.find((record) => {
    return (actor.userId && record.lineUserId === actor.userId) || record.displayName === actor.displayName;
  });

  if (existing) {
    if (existing.status === 'removed') {
      return {
        ...actor,
        isRemoved: true,
      };
    }

    const updates = [];
    if (!existing.lineUserId && actor.userId) {
      updates.push({
        range: `${quoteSheetName(EMPLOYEE_SHEET_NAME)}!B${existing.rowNumber}`,
        values: [[actor.userId]],
      });
    }
    if (existing.displayName !== actor.displayName) {
      updates.push({
        range: `${quoteSheetName(EMPLOYEE_SHEET_NAME)}!C${existing.rowNumber}`,
        values: [[actor.displayName]],
      });
    }

    for (const update of updates) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: GOOGLE_SHEET_ID,
        range: update.range,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: update.values },
      });
    }

    return {
      ...actor,
      isRemoved: false,
    };
  }

  await sheets.spreadsheets.values.append({
    spreadsheetId: GOOGLE_SHEET_ID,
    range: `${quoteSheetName(EMPLOYEE_SHEET_NAME)}!A:D`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[formatTaipeiDateTime(new Date()), actor.userId, actor.displayName, 'active']],
    },
  });

  await appendSignupHistory(sheets, {
    actor,
    action: '登入加入員工名單',
    schedule: {},
  });

  return {
    ...actor,
    isRemoved: false,
  };
}

export async function addEmployeeByName({ actor, displayName }) {
  const employeeName = String(displayName || '').trim();

  if (!employeeName) {
    const error = new Error('Employee name is required.');
    error.statusCode = 400;
    throw error;
  }

  const sheets = createSheetsClient();
  const records = await getEmployeeRecords(sheets);
  const existing = records.find((record) => record.displayName === employeeName);

  if (existing) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: `${quoteSheetName(EMPLOYEE_SHEET_NAME)}!D${existing.rowNumber}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [['active']],
      },
    });
  } else {
    await sheets.spreadsheets.values.append({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: `${quoteSheetName(EMPLOYEE_SHEET_NAME)}!A:D`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[formatTaipeiDateTime(new Date()), '', employeeName, 'active']],
      },
    });
  }

  await appendSignupHistory(sheets, {
    actor,
    action: `新增員工 ${employeeName}`,
    schedule: {},
  });

  return { displayName: employeeName };
}

export async function removeEmployeeByName({ actor, displayName }) {
  const employeeName = String(displayName || '').trim();

  if (!employeeName) {
    const error = new Error('Employee name is required.');
    error.statusCode = 400;
    throw error;
  }

  const sheets = createSheetsClient();
  const records = await getEmployeeRecords(sheets);
  const matched = records.filter((record) => record.displayName === employeeName);

  if (matched.length === 0) {
    const error = new Error('Employee not found.');
    error.statusCode = 404;
    throw error;
  }

  for (const record of matched) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: `${quoteSheetName(EMPLOYEE_SHEET_NAME)}!D${record.rowNumber}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [['removed']],
      },
    });
  }

  await appendSignupHistory(sheets, {
    actor,
    action: `移除員工 ${employeeName}`,
    schedule: {},
  });

  return { displayName: employeeName };
}

export async function assignSchedule(rowNumber, actor) {
  const sheets = createSheetsClient();
  const { sheetName, header, columnMap } = await getScheduleSheetContext(sheets);
  const employeeColumn = columnMap.employee;

  if (employeeColumn < 0) {
    throw new Error('Sheet needs an 員工 column.');
  }

  const schedules = await getSchedules();
  const schedule = schedules.find((item) => item.rowNumber === Number(rowNumber));

  if (!schedule) {
    const error = new Error('Schedule row not found.');
    error.statusCode = 404;
    throw error;
  }

  if (!isAllowedShift(schedule.shift)) {
    const error = new Error('This shift code is not supported.');
    error.statusCode = 400;
    throw error;
  }

  if (schedule.employee) {
    const error = new Error('This shift is already taken.');
    error.statusCode = 409;
    throw error;
  }

  const employeeCell = `${quoteSheetName(sheetName)}!${toColumnLetter(employeeColumn + 1)}${schedule.rowNumber}`;

  await sheets.spreadsheets.values.update({
    spreadsheetId: GOOGLE_SHEET_ID,
    range: employeeCell,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[actor.displayName]],
    },
  });

  await appendSignupHistory(sheets, {
    actor,
    schedule,
    action: '填班',
  });

  return {
    ...schedule,
    employee: actor.displayName,
  };
}

export async function upsertUserShift({ date, shift, actor, targetName }) {
  const normalizedShift = normalizeShiftCode(shift);
  const employeeName = String(targetName || actor.displayName).trim();

  if (!date || !isAllowedShift(normalizedShift)) {
    const error = new Error('Use valid date and shift codes: A, B, C, H, I, X.');
    error.statusCode = 400;
    throw error;
  }

  if (!employeeName) {
    const error = new Error('Employee name is required.');
    error.statusCode = 400;
    throw error;
  }

  const sheets = createSheetsClient();
  const { sheetName, columnMap, width } = await getScheduleSheetContext(sheets);

  if (columnMap.date < 0 || columnMap.shift < 0 || columnMap.employee < 0) {
    throw new Error('Sheet needs 日期, 班別, 員工 columns.');
  }

  const schedules = await getSchedules();
  const existing = schedules.find((schedule) => {
    return schedule.date === date && schedule.employee === employeeName;
  });

  if (existing) {
    const shiftCell = `${quoteSheetName(sheetName)}!${toColumnLetter(columnMap.shift + 1)}${existing.rowNumber}`;

    await sheets.spreadsheets.values.update({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: shiftCell,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[normalizedShift]],
      },
    });

    await appendSignupHistory(sheets, {
      actor,
      schedule: { ...existing, shift: normalizedShift },
      action: actor.displayName === employeeName ? '更新班別' : `代排 ${employeeName}`,
    });

    return { ...existing, shift: normalizedShift };
  }

  const row = Array.from({ length: width }, () => '');
  row[columnMap.date] = date;
  row[columnMap.shift] = normalizedShift;
  row[columnMap.employee] = employeeName;

  await sheets.spreadsheets.values.append({
    spreadsheetId: GOOGLE_SHEET_ID,
    range: `${quoteSheetName(sheetName)}!A:Z`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [row],
    },
  });

  const schedule = {
    date,
    shift: normalizedShift,
    employee: employeeName,
    note: '',
  };

  await appendSignupHistory(sheets, {
    actor,
    schedule,
    action: actor.displayName === employeeName ? '填班' : `代排 ${employeeName}`,
  });

  return schedule;
}

export async function removeUserShift({ date, actor, targetName }) {
  const employeeName = String(targetName || actor.displayName).trim();

  if (!date || !employeeName) {
    const error = new Error('Use valid date and employee name.');
    error.statusCode = 400;
    throw error;
  }

  const sheets = createSheetsClient();
  const { sheetName, columnMap, width } = await getScheduleSheetContext(sheets);
  const schedules = await getSchedules();
  const existing = schedules.find((schedule) => {
    return schedule.date === date && schedule.employee === employeeName;
  });

  if (!existing) {
    const error = new Error('Schedule row not found.');
    error.statusCode = 404;
    throw error;
  }

  const emptyRow = Array.from({ length: width }, () => '');

  await sheets.spreadsheets.values.update({
    spreadsheetId: GOOGLE_SHEET_ID,
    range: `${quoteSheetName(sheetName)}!A${existing.rowNumber}:${toColumnLetter(width)}${existing.rowNumber}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [emptyRow],
    },
  });

  await appendSignupHistory(sheets, {
    actor,
    schedule: existing,
    action: actor.displayName === employeeName ? '移除班別' : `代移除 ${employeeName}`,
  });

  return existing;
}

export async function getSignupHistory(limit = 80) {
  const sheets = createSheetsClient();
  await ensureHistorySheet(sheets);

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: GOOGLE_SHEET_ID,
    range: `${quoteSheetName(HISTORY_SHEET_NAME)}!A2:G`,
  });

  const rows = response.data.values ?? [];

  return rows
    .map((row) => ({
      createdAt: String(row[0] ?? ''),
      lineUserId: String(row[1] ?? ''),
      displayName: String(row[2] ?? ''),
      action: String(row[3] ?? ''),
      date: String(row[4] ?? ''),
      shift: String(row[5] ?? ''),
      note: String(row[6] ?? ''),
    }))
    .filter((record) => record.createdAt)
    .slice(-limit)
    .reverse();
}

async function appendSignupHistory(sheets, record) {
  await ensureHistorySheet(sheets);

  await sheets.spreadsheets.values.append({
    spreadsheetId: GOOGLE_SHEET_ID,
    range: `${quoteSheetName(HISTORY_SHEET_NAME)}!A:G`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [
        [
          formatTaipeiDateTime(new Date()),
          record.actor.userId,
          record.actor.displayName,
          record.action,
          record.schedule?.date || '',
          record.schedule?.shift || '',
          record.schedule?.note || '',
        ],
      ],
    },
  });
}

async function ensureHistorySheet(sheets) {
  if (await sheetExists(sheets, HISTORY_SHEET_NAME)) {
    return;
  }

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: GOOGLE_SHEET_ID,
    requestBody: {
      requests: [
        {
          addSheet: {
            properties: {
              title: HISTORY_SHEET_NAME,
            },
          },
        },
      ],
    },
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId: GOOGLE_SHEET_ID,
    range: `${quoteSheetName(HISTORY_SHEET_NAME)}!A1:G1`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [['填寫時間', 'LINE userId', '顯示名稱', '動作', '日期', '班別', '備註']],
    },
  });
}

async function getEmployeeRecords(sheets) {
  await ensureEmployeeSheet(sheets);

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: GOOGLE_SHEET_ID,
    range: `${quoteSheetName(EMPLOYEE_SHEET_NAME)}!A2:D`,
  });

  const rows = response.data.values ?? [];

  return rows
    .map((row, index) => ({
      rowNumber: index + 2,
      joinedAt: String(row[0] ?? ''),
      lineUserId: String(row[1] ?? ''),
      displayName: String(row[2] ?? ''),
      status: String(row[3] ?? 'active') || 'active',
    }))
    .filter((record) => record.displayName);
}

async function ensureEmployeeSheet(sheets) {
  if (await sheetExists(sheets, EMPLOYEE_SHEET_NAME)) {
    return;
  }

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: GOOGLE_SHEET_ID,
    requestBody: {
      requests: [
        {
          addSheet: {
            properties: {
              title: EMPLOYEE_SHEET_NAME,
            },
          },
        },
      ],
    },
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId: GOOGLE_SHEET_ID,
    range: `${quoteSheetName(EMPLOYEE_SHEET_NAME)}!A1:D1`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [['加入時間', 'LINE userId', '顯示名稱', '狀態']],
    },
  });

  await seedEmployeeSheetFromSchedules(sheets);
}

async function sheetExists(sheets, sheetName) {
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId: GOOGLE_SHEET_ID,
  });

  return spreadsheet.data.sheets.some((sheet) => sheet.properties.title === sheetName);
}

async function seedEmployeeSheetFromSchedules(sheets) {
  const rowsResponse = await sheets.spreadsheets.values.get({
    spreadsheetId: GOOGLE_SHEET_ID,
    range: GOOGLE_SHEET_RANGE,
  });
  const rows = rowsResponse.data.values ?? [];
  const [header, ...dataRows] = rows;

  if (!header) return;

  const columnMap = createColumnMap(header);
  if (columnMap.employee < 0) return;

  const names = [...new Set(dataRows.map((row) => String(row[columnMap.employee] ?? '').trim()).filter(Boolean))];
  if (names.length === 0) return;

  await sheets.spreadsheets.values.append({
    spreadsheetId: GOOGLE_SHEET_ID,
    range: `${quoteSheetName(EMPLOYEE_SHEET_NAME)}!A:D`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: names.map((name) => [formatTaipeiDateTime(new Date()), '', name, 'active']),
    },
  });
}

async function getScheduleSheetContext(sheets) {
  const rowsResponse = await sheets.spreadsheets.values.get({
    spreadsheetId: GOOGLE_SHEET_ID,
    range: GOOGLE_SHEET_RANGE,
  });
  const rows = rowsResponse.data.values ?? [];
  const header = rows[0] ?? [];

  return {
    sheetName: getSheetNameFromRange(GOOGLE_SHEET_RANGE),
    header,
    width: Math.max(header.length, 8),
    columnMap: createColumnMap(header),
  };
}

function createColumnMap(header) {
  const aliases = {
    date: ['日期', 'date'],
    shift: ['班別', '班次', 'shift'],
    employee: ['員工', '姓名', 'employee', 'name'],
    startTime: ['開始時間', '上班時間', 'startTime', 'start time', 'start'],
    endTime: ['結束時間', '下班時間', 'endTime', 'end time', 'end'],
    note: ['備註', '崗位', '位置', 'note', 'position'],
  };

  return Object.fromEntries(
    Object.entries(aliases).map(([field, names]) => {
      const index = header.findIndex((columnName) => names.includes(String(columnName).trim()));
      return [field, index];
    }),
  );
}

function getCell(row, columnMap, field) {
  const index = columnMap[field];
  return index >= 0 ? String(row[index] ?? '').trim() : '';
}

function getSheetNameFromRange(range) {
  const [sheetName] = range.split('!');
  return sheetName.replace(/^'|'$/g, '');
}

function quoteSheetName(sheetName) {
  return `'${sheetName.replace(/'/g, "''")}'`;
}

function toColumnLetter(columnNumber) {
  let letter = '';
  let value = columnNumber;

  while (value > 0) {
    const remainder = (value - 1) % 26;
    letter = String.fromCharCode(65 + remainder) + letter;
    value = Math.floor((value - 1) / 26);
  }

  return letter;
}

function formatTaipeiDateTime(date) {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date);
}
