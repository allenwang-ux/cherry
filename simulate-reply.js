import { createReplyText } from './bot.js';
import { sampleSchedules } from './sample-schedules.js';

const text = process.argv.slice(2).join(' ').trim() || '今日排班';
const now = new Date('2026-05-04T08:00:00+08:00');

const reply = await createReplyText(text, {
  now,
  scheduleProvider: async () => sampleSchedules,
  dateScheduleProvider: async (dateText) => {
    return sampleSchedules.filter((schedule) => schedule.date === dateText);
  },
});

console.log(reply);
