import 'dotenv/config';
import { getSchedules } from './sheets.js';

const schedules = await getSchedules();

if (schedules.length === 0) {
  console.log('No valid schedules found. Use shift codes: A, B, C, H, I, X.');
} else {
  console.table(schedules);
}
