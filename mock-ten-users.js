import express from 'express';
import { renderSchedulePage } from './schedule-page.js';

const app = express();
const port = Number(process.env.PORT || 3005);

const employees = [
  'FengFengWang',
  'Cherry Wu',
  'Grace',
  'Jackie',
  '怡君',
  '小金',
  '阿星',
  '子淇',
  '蔡',
  '小潘',
].map((displayName, index) => ({
  displayName,
  lineUserId: `mock-user-${index + 1}`,
  sortOrder: index + 1,
}));

const shifts = ['A', 'B', 'C', 'H', 'I', 'X'];
let schedules = [];

for (let day = 1; day <= 31; day += 1) {
  employees.forEach((employee, employeeIndex) => {
    if ((day + employeeIndex) % 4 === 0) return;
    schedules.push({
      date: `2026-05-${String(day).padStart(2, '0')}`,
      shift: shifts[(day + employeeIndex) % shifts.length],
      employee: employee.displayName,
      note: '',
    });
  });
}

app.use('/assets', express.static('public'));

app.get('/schedule', (req, res) => {
  const html = renderSchedulePage().replace(
    'boot();',
    `boot();
    window.setTimeout(() => {
      const input = document.querySelector('#devName');
      if (input) input.value = 'FengFengWang';
      document.querySelector('#devLoginButton')?.click();
    }, 80);`,
  );
  res.type('html').send(html);
});

app.get('/api/schedules', (req, res) => {
  res.json({ schedules, employees });
});

app.post('/api/session', express.json(), (req, res) => {
  const displayName = req.body?.devProfile?.displayName || 'FengFengWang';
  res.json({
    actor: {
      userId: 'mock-admin',
      displayName,
      isAdmin: true,
      isRemoved: false,
    },
  });
});

app.post('/api/my-shifts', express.json(), (req, res) => {
  const date = String(req.body?.date || '');
  const shift = String(req.body?.shift || '');
  const employee = String(req.body?.targetName || req.body?.devProfile?.displayName || 'FengFengWang');

  schedules = schedules.filter((schedule) => !(schedule.date === date && schedule.employee === employee));

  if (shift) {
    const schedule = { date, shift, employee, note: '' };
    schedules.push(schedule);
    res.json({ schedule });
    return;
  }

  res.json({ schedule: { date, shift, employee, note: '' } });
});

app.post('/api/history', express.json(), (req, res) => {
  res.json({
    history: [
      {
        createdAt: '2026-05-05 02:15:00',
        displayName: 'FengFengWang',
        lineUserId: 'mock-admin',
        action: '代排 Cherry Wu',
        date: '2026-05-01',
        shift: 'H',
      },
    ],
  });
});

app.post('/api/employees', express.json(), (req, res) => {
  const displayName = String(req.body?.displayName || '').trim();
  if (displayName && !employees.some((employee) => employee.displayName === displayName)) {
    employees.push({ displayName, lineUserId: '', sortOrder: employees.length + 1 });
  }
  res.json({ employee: { displayName } });
});

app.post('/api/employees/remove', express.json(), (req, res) => {
  res.json({ employee: { displayName: req.body?.displayName || '' } });
});

app.post('/api/employees/rename', express.json(), (req, res) => {
  res.json({ employee: { displayName: req.body?.newName || '' } });
});

app.post('/api/employees/move', express.json(), (req, res) => {
  res.json({ employee: { displayName: req.body?.displayName || '', moved: true } });
});

app.listen(port, () => {
  console.log(`Mock ten-user scheduler is running on http://localhost:${port}/schedule`);
});
