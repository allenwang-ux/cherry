import 'dotenv/config';
import { getScheduleRows } from './sheets.js';

const rows = await getScheduleRows();

if (rows.length === 0) {
  console.log('No data found.');
} else {
  console.table(rows);
}
