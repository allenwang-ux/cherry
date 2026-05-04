import test from 'node:test';
import assert from 'node:assert/strict';
import { createReplyText } from './bot.js';

const schedules = [
  {
    date: '2026-05-04',
    shift: 'A',
    employee: '小明',
    startTime: '09:00',
    endTime: '14:00',
    note: '吧台',
  },
  {
    date: '2026-05-05',
    shift: 'B',
    employee: '小美',
    startTime: '17:00',
    endTime: '22:00',
    note: '',
  },
];

function options() {
  return {
    now: new Date('2026-05-04T08:00:00+08:00'),
    scheduleProvider: async () => schedules,
    dateScheduleProvider: async (dateText) => schedules.filter((schedule) => schedule.date === dateText),
  };
}

test('replies with today schedule', async () => {
  const reply = await createReplyText('今日排班', options());
  assert.match(reply, /2026-05-04 排班/);
  assert.match(reply, /A 小明 吧台/);
});

test('replies with tomorrow schedule', async () => {
  const reply = await createReplyText('明日排班', options());
  assert.match(reply, /2026-05-05 排班/);
  assert.match(reply, /B 小美/);
});

test('replies with employee schedule', async () => {
  const reply = await createReplyText('小明排班', options());
  assert.match(reply, /小明 的排班/);
  assert.match(reply, /2026-05-04 A 小明/);
});

test('uses request base url for schedule link when env is placeholder', async () => {
  const originalPublicBaseUrl = process.env.PUBLIC_BASE_URL;
  process.env.PUBLIC_BASE_URL = 'TO_BE_FILLED_AFTER_DEPLOY';

  try {
    const reply = await createReplyText('填班', {
      ...options(),
      publicBaseUrl: 'https://qingxin-scheduler.example.run.app',
    });

    assert.match(reply, /https:\/\/qingxin-scheduler\.example\.run\.app\/schedule/);
    assert.doesNotMatch(reply, /TO_BE_FILLED/);
  } finally {
    if (originalPublicBaseUrl === undefined) {
      delete process.env.PUBLIC_BASE_URL;
    } else {
      process.env.PUBLIC_BASE_URL = originalPublicBaseUrl;
    }
  }
});

test('replies with help text for unknown message', async () => {
  const reply = await createReplyText('你好', options());
  assert.match(reply, /可用指令/);
});
