import 'dotenv/config';
import express from 'express';
import * as line from '@line/bot-sdk';
import { createReplyText } from './bot.js';
import { resolveLineActor } from './line-auth.js';
import { renderSchedulePage } from './schedule-page.js';
import {
  addEmployeeByName,
  assignSchedule,
  getEmployees,
  getSchedules,
  getSignupHistory,
  moveEmployee,
  registerEmployee,
  removeEmployeeByName,
  removeUserShift,
  renameEmployee,
  upsertUserShift,
} from './sheets.js';

const { LINE_CHANNEL_ACCESS_TOKEN, LINE_CHANNEL_SECRET, LIFF_ID, PORT = 3000 } = process.env;

const hasLineConfig = Boolean(LINE_CHANNEL_ACCESS_TOKEN && LINE_CHANNEL_SECRET);

const lineConfig = {
  channelAccessToken: LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: LINE_CHANNEL_SECRET,
};

const client = hasLineConfig
  ? new line.messagingApi.MessagingApiClient({
      channelAccessToken: LINE_CHANNEL_ACCESS_TOKEN,
    })
  : null;

const app = express();

app.use('/assets', express.static('public'));

app.get('/', (req, res) => {
  res.send('Drink shop scheduler LINE Bot is running.');
});

app.get('/schedule', (req, res) => {
  res.type('html').send(renderSchedulePage({ liffId: LIFF_ID }));
});

app.get('/healthz', (req, res) => {
  res.json({
    ok: true,
    lineConfigured: hasLineConfig,
    googleSheetConfigured: Boolean(process.env.GOOGLE_SHEET_ID),
    liffConfigured: Boolean(LIFF_ID),
  });
});

app.get('/api/schedules', async (req, res, next) => {
  try {
    res.json({
      schedules: await getSchedules(),
      employees: await getEmployees(),
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/session', express.json(), async (req, res, next) => {
  try {
    const actor = await resolveLineActor({
      idToken: req.body?.idToken,
      devProfile: req.body?.devProfile,
    });
    res.json({ actor: await registerEmployee(actor) });
  } catch (error) {
    next(error);
  }
});

app.post('/api/signups', express.json(), async (req, res, next) => {
  try {
    const actor = await resolveLineActor({
      idToken: req.body?.idToken,
      devProfile: req.body?.devProfile,
    });
    const schedule = await assignSchedule(Number(req.body?.rowNumber), actor);
    res.json({ schedule });
  } catch (error) {
    next(error);
  }
});

app.post('/api/my-shifts', express.json(), async (req, res, next) => {
  try {
    const actor = await resolveLineActor({
      idToken: req.body?.idToken,
      devProfile: req.body?.devProfile,
    });
    if (actor.isRemoved) {
      res.status(403).json({ error: '此帳號已被管理員從員工名單移除。' });
      return;
    }
    const date = String(req.body?.date ?? '');
    const shift = String(req.body?.shift ?? '');
    const targetName = actor.isAdmin ? String(req.body?.targetName ?? '') : actor.displayName;
    const schedule = shift
      ? await upsertUserShift({ date, shift, actor, targetName })
      : await removeUserShift({ date, actor, targetName });
    res.json({ schedule });
  } catch (error) {
    next(error);
  }
});

app.post('/api/history', express.json(), async (req, res, next) => {
  try {
    const actor = await resolveLineActor({
      idToken: req.body?.idToken,
      devProfile: req.body?.devProfile,
    });

    if (!actor.isAdmin) {
      res.status(403).json({ error: 'Only admins can view operation history.' });
      return;
    }

    res.json({ history: await getSignupHistory(Number(req.body?.limit || 80)) });
  } catch (error) {
    next(error);
  }
});

app.post('/api/employees', express.json(), async (req, res, next) => {
  try {
    const actor = await resolveLineActor({
      idToken: req.body?.idToken,
      devProfile: req.body?.devProfile,
    });

    if (!actor.isAdmin) {
      res.status(403).json({ error: 'Only admins can manage employees.' });
      return;
    }

    res.json({ employee: await addEmployeeByName({ actor, displayName: req.body?.displayName }) });
  } catch (error) {
    next(error);
  }
});

app.post('/api/employees/remove', express.json(), async (req, res, next) => {
  try {
    const actor = await resolveLineActor({
      idToken: req.body?.idToken,
      devProfile: req.body?.devProfile,
    });

    if (!actor.isAdmin) {
      res.status(403).json({ error: 'Only admins can manage employees.' });
      return;
    }
    if (actor.displayName === String(req.body?.displayName || '').trim()) {
      res.status(400).json({ error: '不能移除目前登入的管理員。' });
      return;
    }

    res.json({ employee: await removeEmployeeByName({ actor, displayName: req.body?.displayName }) });
  } catch (error) {
    next(error);
  }
});

app.post('/api/employees/rename', express.json(), async (req, res, next) => {
  try {
    const actor = await resolveLineActor({
      idToken: req.body?.idToken,
      devProfile: req.body?.devProfile,
    });

    const currentName = actor.isAdmin ? String(req.body?.currentName ?? '') : actor.displayName;
    const employee = await renameEmployee({
      actor,
      currentName,
      newName: req.body?.newName,
    });

    res.json({ employee });
  } catch (error) {
    next(error);
  }
});

app.post('/api/employees/move', express.json(), async (req, res, next) => {
  try {
    const actor = await resolveLineActor({
      idToken: req.body?.idToken,
      devProfile: req.body?.devProfile,
    });

    if (!actor.isAdmin) {
      res.status(403).json({ error: 'Only admins can reorder employees.' });
      return;
    }

    res.json({
      employee: await moveEmployee({
        actor,
        displayName: req.body?.displayName,
        direction: req.body?.direction,
      }),
    });
  } catch (error) {
    next(error);
  }
});

app.post('/debug/reply', express.json(), async (req, res) => {
  const text = String(req.body?.text ?? '');

  if (!text) {
    res.status(400).json({ error: 'Missing text.' });
    return;
  }

  res.json({ reply: await createReplyText(text, { publicBaseUrl: getRequestBaseUrl(req) }) });
});

if (hasLineConfig) {
  app.post('/webhook', line.middleware(lineConfig), async (req, res) => {
    try {
      const publicBaseUrl = getRequestBaseUrl(req);
      await Promise.all(req.body.events.map((event) => handleEvent(event, { publicBaseUrl })));
      res.sendStatus(200);
    } catch (error) {
      console.error(error);
      res.sendStatus(500);
    }
  });
} else {
  app.post('/webhook', (req, res) => {
    res.status(503).send('LINE is not configured. Add LINE_CHANNEL_ACCESS_TOKEN and LINE_CHANNEL_SECRET to .env.');
  });
}

async function handleEvent(event, options = {}) {
  if (!client) {
    return null;
  }

  console.log('LINE event', {
    type: event.type,
    sourceType: event.source?.type,
    groupId: event.source?.groupId,
    userId: event.source?.userId,
    messageType: event.message?.type,
    text: event.message?.text,
  });

  if (event.type !== 'message' || event.message.type !== 'text') {
    return null;
  }

  const userText = event.message.text.trim();
  const replyText = await createReplyText(userText, options);

  return client.replyMessage({
    replyToken: event.replyToken,
    messages: [{ type: 'text', text: replyText }],
  });
}

function getRequestBaseUrl(req) {
  const protocol = req.get('x-forwarded-proto') || req.protocol || 'https';
  return `${protocol}://${req.get('host')}`;
}

app.use((error, req, res, next) => {
  if (error) {
    console.error(error);
    res.status(error.statusCode || 500).json({
      error: getClientErrorMessage(error),
    });
    return;
  }

  next();
});

function getClientErrorMessage(error) {
  const message = error.message || '';

  if (message.includes('permission') || error.code === 403 || error.status === 403) {
    return '目前沒有寫入班表權限，請確認 Google Sheet 已分享編輯權限給服務帳戶。';
  }

  if (message.includes('already taken')) {
    return '這個班已經有人填了。';
  }

  return message || '系統暫時無法處理，請稍後再試。';
}

app.listen(PORT, () => {
  console.log(`LINE Bot server is running on http://localhost:${PORT}`);
});
