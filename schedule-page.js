import { SHIFT_CODES } from './shift-config.js';

export function renderSchedulePage({ liffId = '' } = {}) {
  return `<!doctype html>
<html lang="zh-Hant">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>清心填班系統</title>
  <style>
    :root {
      color-scheme: light;
      --ink: #1f2933;
      --muted: #667085;
      --line: #cfd8d5;
      --line-strong: #9eadaa;
      --brand: #00b900;
      --brand-dark: #078a18;
      --bg: #f4f6f5;
      --panel: #ffffff;
      --today: #fff7df;
      --mine: #eaf8ec;
      --weekend: #b42318;
      --danger: #b42318;
    }
    * {
      box-sizing: border-box;
    }
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: var(--bg);
      color: var(--ink);
    }
    header {
      align-items: center;
      background: rgba(255, 255, 255, 0.97);
      border-bottom: 1px solid var(--line);
      display: flex;
      gap: 12px;
      justify-content: space-between;
      padding: 12px 14px;
      position: sticky;
      top: 0;
      z-index: 20;
    }
    h1 {
      font-size: 18px;
      line-height: 1.2;
      margin: 0;
    }
    .user {
      color: var(--muted);
      font-size: 13px;
      margin-top: 2px;
    }
    .month-nav {
      align-items: center;
      display: flex;
      gap: 8px;
    }
    .icon-button {
      align-items: center;
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      color: var(--ink);
      cursor: pointer;
      display: grid;
      font-size: 18px;
      font-weight: 800;
      height: 38px;
      line-height: 1;
      place-items: center;
      width: 38px;
    }
    .month-title {
      font-size: 16px;
      font-weight: 900;
      min-width: 86px;
      text-align: center;
    }
    main {
      padding: 12px;
    }
    .dev-login {
      display: none;
      gap: 8px;
      margin: 0 auto 12px;
      max-width: 820px;
    }
    .dev-login input {
      border: 1px solid var(--line);
      border-radius: 8px;
      flex: 1;
      font-size: 15px;
      padding: 10px 12px;
    }
    .dev-login button,
    .primary {
      background: var(--brand);
      border: 0;
      border-radius: 8px;
      color: #fff;
      cursor: pointer;
      font-size: 15px;
      font-weight: 900;
      padding: 10px 12px;
    }
    .notice {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      color: var(--muted);
      margin: 0 auto 12px;
      max-width: 820px;
      padding: 14px;
    }
    .notice.error {
      color: var(--danger);
    }
    .legend {
      color: var(--muted);
      display: flex;
      flex-wrap: wrap;
      font-size: 13px;
      gap: 8px;
      margin: 0 auto 10px;
      max-width: 1180px;
    }
    .admin-panel {
      align-items: center;
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      display: none;
      flex-wrap: wrap;
      gap: 8px;
      margin: 0 auto 10px;
      max-width: 1180px;
      padding: 10px;
    }
    .admin-panel label {
      color: var(--muted);
      font-size: 13px;
      font-weight: 800;
    }
    .admin-panel select,
    .admin-panel input {
      border: 1px solid var(--line);
      border-radius: 8px;
      font-size: 15px;
      min-height: 38px;
      padding: 8px 10px;
    }
    .admin-panel select {
      min-width: 150px;
    }
    .admin-panel input {
      min-width: 140px;
    }
    .legend span {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 999px;
      padding: 5px 9px;
    }
    .table-wrap {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      margin: 0 auto;
      max-width: 1180px;
      overflow: auto;
    }
    table {
      border-collapse: collapse;
      min-width: 720px;
      table-layout: fixed;
      width: 100%;
    }
    th,
    td {
      border: 1px solid var(--line);
      height: 42px;
      padding: 0;
      text-align: center;
      vertical-align: middle;
    }
    th {
      background: #eef3f1;
      color: var(--ink);
      font-size: 14px;
      font-weight: 900;
      position: sticky;
      top: 0;
      z-index: 3;
    }
    .date-head,
    .date-cell {
      left: 0;
      position: sticky;
      width: 76px;
      z-index: 4;
    }
    .date-head {
      background: #e6eeeb;
    }
    .date-cell {
      background: #fbfcfc;
      color: var(--ink);
      font-weight: 800;
    }
    .weekday {
      color: var(--muted);
      display: inline-block;
      font-size: 12px;
      margin-left: 3px;
    }
    tr.weekend .date-cell {
      color: var(--weekend);
    }
    tr.today td {
      background: var(--today);
    }
    td.mine {
      background: var(--mine);
      cursor: pointer;
      font-weight: 900;
    }
    td.mine:hover {
      outline: 2px solid var(--brand);
      outline-offset: -2px;
    }
    .shift-code {
      color: var(--ink);
      font-size: 17px;
      font-weight: 900;
      line-height: 1;
    }
    .empty-cell {
      color: #a7b0ad;
      font-size: 18px;
    }
    dialog {
      border: 0;
      border-radius: 8px;
      box-shadow: 0 18px 50px rgba(15, 23, 42, 0.24);
      max-width: calc(100vw - 28px);
      padding: 0;
      width: 360px;
    }
    dialog::backdrop {
      background: rgba(15, 23, 42, 0.32);
    }
    .modal {
      padding: 18px;
    }
    .modal h2 {
      font-size: 18px;
      margin: 0 0 4px;
    }
    .modal-date {
      color: var(--muted);
      font-size: 14px;
      margin-bottom: 14px;
    }
    .shift-picker {
      display: grid;
      gap: 8px;
      grid-template-columns: repeat(5, 1fr);
    }
    .shift-option {
      background: var(--panel);
      border: 1px solid var(--line-strong);
      border-radius: 8px;
      cursor: pointer;
      font-size: 18px;
      font-weight: 900;
      height: 46px;
    }
    .shift-option.active {
      background: var(--brand);
      border-color: var(--brand);
      color: #fff;
    }
    .modal-actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      margin-top: 16px;
    }
    .secondary {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      color: var(--ink);
      cursor: pointer;
      font-size: 15px;
      font-weight: 800;
      padding: 10px 12px;
    }
    @media (max-width: 720px) {
      header {
        align-items: flex-start;
        flex-direction: column;
      }
      main {
        padding: 10px;
      }
      .date-head,
      .date-cell {
        width: 68px;
      }
      th,
      td {
        height: 40px;
      }
    }
  </style>
</head>
<body>
  <header>
    <div>
      <h1>清心填班系統</h1>
      <div class="user" id="user">登入中</div>
    </div>
    <div class="month-nav" aria-label="月份切換">
      <button class="icon-button" type="button" id="prevMonth" aria-label="上個月">‹</button>
      <div class="month-title" id="monthTitle"></div>
      <button class="icon-button" type="button" id="nextMonth" aria-label="下個月">›</button>
    </div>
  </header>
  <main>
    <div class="dev-login" id="devLogin">
      <input id="devName" value="測試員工" aria-label="測試名稱">
      <button type="button" id="devLoginButton">使用測試身份</button>
    </div>
    <div class="notice" id="notice">讀取班表中</div>
    <div class="admin-panel" id="adminPanel">
      <label for="targetEmployee">管理排班</label>
      <select id="targetEmployee"></select>
      <input id="newEmployeeName" placeholder="新增員工姓名" aria-label="新增員工姓名">
      <button class="secondary" type="button" id="addEmployee">加入欄位</button>
    </div>
    <div class="legend">
      <span>點自己的欄位填班</span>
      <span>班別：${SHIFT_CODES.join(' / ')}</span>
      <span>可複選，例如 A+I</span>
    </div>
    <div class="table-wrap">
      <table aria-label="月份班表">
        <thead id="tableHead"></thead>
        <tbody id="tableBody"></tbody>
      </table>
    </div>
  </main>
  <dialog id="shiftDialog">
    <form method="dialog" class="modal">
      <h2>填寫班別</h2>
      <div class="modal-date" id="modalDate"></div>
      <div class="shift-picker" id="shiftPicker"></div>
      <div class="modal-actions">
        <button class="secondary" type="button" id="clearShift">清空</button>
        <button class="secondary" type="button" id="cancelShift">取消</button>
        <button class="primary" type="button" id="saveShift">儲存</button>
      </div>
    </form>
  </dialog>
  <script src="https://static.line-scdn.net/liff/edge/2/sdk.js"></script>
  <script>
    const LIFF_ID = ${JSON.stringify(liffId)};
    const SHIFT_CODES = ${JSON.stringify(SHIFT_CODES)};
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];

    let profile = null;
    let actor = null;
    let idToken = '';
    let schedules = [];
    let activeMonth = new Date();
    let editingDate = '';
    let editingEmployee = '';
    let selectedShifts = new Set();
    let staffOverrides = [];

    const tableHead = document.querySelector('#tableHead');
    const tableBody = document.querySelector('#tableBody');
    const notice = document.querySelector('#notice');
    const user = document.querySelector('#user');
    const devLogin = document.querySelector('#devLogin');
    const devName = document.querySelector('#devName');
    const monthTitle = document.querySelector('#monthTitle');
    const dialog = document.querySelector('#shiftDialog');
    const modalDate = document.querySelector('#modalDate');
    const shiftPicker = document.querySelector('#shiftPicker');
    const adminPanel = document.querySelector('#adminPanel');
    const targetEmployee = document.querySelector('#targetEmployee');
    const newEmployeeName = document.querySelector('#newEmployeeName');

    document.querySelector('#prevMonth').addEventListener('click', () => changeMonth(-1));
    document.querySelector('#nextMonth').addEventListener('click', () => changeMonth(1));
    document.querySelector('#cancelShift').addEventListener('click', () => dialog.close());
    document.querySelector('#clearShift').addEventListener('click', () => {
      selectedShifts.clear();
      renderShiftPicker();
    });
    document.querySelector('#saveShift').addEventListener('click', saveShift);
    document.querySelector('#addEmployee').addEventListener('click', () => {
      const name = newEmployeeName.value.trim();
      if (!name) return;
      staffOverrides.push(name);
      newEmployeeName.value = '';
      render();
    });
    document.querySelector('#devLoginButton').addEventListener('click', async () => {
      profile = {
        userId: 'dev-user',
        displayName: devName.value.trim() || '測試員工',
      };
      user.textContent = profile.displayName;
      devLogin.style.display = 'none';
      await loadSession();
      await loadSchedules();
    });

    boot();

    async function boot() {
      try {
        if (LIFF_ID) {
          await liff.init({ liffId: LIFF_ID });
          if (!liff.isLoggedIn()) {
            liff.login();
            return;
          }
          profile = await liff.getProfile();
          idToken = liff.getIDToken();
          user.textContent = profile.displayName;
          await loadSession();
          await loadSchedules();
          return;
        }

        devLogin.style.display = 'flex';
        notice.textContent = '尚未設定 LIFF，請先用測試身份預覽。';
        user.textContent = '測試模式';
        render();
      } catch (error) {
        showError(error.message || '登入失敗');
      }
    }

    async function loadSchedules() {
      notice.className = 'notice';
      notice.textContent = '讀取班表中';
      notice.style.display = 'block';
      const response = await fetch('/api/schedules');
      const data = await response.json();
      schedules = data.schedules || [];
      notice.style.display = 'none';
      render();
    }

    async function loadSession() {
      const response = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idToken,
          devProfile: profile,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || '登入狀態讀取失敗');
      }
      actor = data.actor;
      if (actor?.isAdmin) {
        user.textContent = profile.displayName + ' 管理者';
      }
    }

    function render() {
      const dates = getMonthDates(activeMonth);
      const staffNames = getStaffNames();
      const today = formatDate(new Date());
      monthTitle.textContent = formatMonthTitle(activeMonth);

      tableHead.innerHTML = '<tr><th class="date-head">日期</th>' + staffNames
        .map((name) => \`<th>\${escapeHtml(name)}</th>\`)
        .join('') + '</tr>';

      renderAdminPanel(staffNames);

      tableBody.innerHTML = dates.map((dateText) => {
        const date = parseDate(dateText);
        const weekend = date.getDay() === 0 || date.getDay() === 6;
        const rowClass = [weekend ? 'weekend' : '', dateText === today ? 'today' : ''].filter(Boolean).join(' ');
        const cells = staffNames.map((name) => renderCell(dateText, name)).join('');
        return \`
          <tr class="\${rowClass}">
            <td class="date-cell">\${date.getDate()}<span class="weekday">\${weekdays[date.getDay()]}</span></td>
            \${cells}
          </tr>
        \`;
      }).join('');

      document.querySelectorAll('td.editable').forEach((cell) => {
        cell.addEventListener('click', () => openShiftDialog(cell.dataset.date, cell.dataset.employee));
      });
    }

    function renderCell(dateText, name) {
      const shifts = schedules
        .filter((schedule) => schedule.date === dateText && schedule.employee === name)
        .map((schedule) => schedule.shift)
        .filter(Boolean);
      const value = shifts.join('+');
      const editable = actor?.isAdmin || profile?.displayName === name;
      const content = value ? \`<span class="shift-code">\${escapeHtml(value)}</span>\` : '<span class="empty-cell">·</span>';
      return \`<td class="\${editable ? 'mine editable' : ''}" data-date="\${dateText}" data-employee="\${escapeHtml(name)}">\${content}</td>\`;
    }

    function getStaffNames() {
      const names = schedules.map((schedule) => schedule.employee).filter(Boolean);
      if (profile?.displayName) names.push(profile.displayName);
      names.push(...staffOverrides);
      return [...new Set(names)];
    }

    function renderAdminPanel(staffNames) {
      if (!actor?.isAdmin) {
        adminPanel.style.display = 'none';
        return;
      }

      adminPanel.style.display = 'flex';
      const current = targetEmployee.value;
      targetEmployee.innerHTML = staffNames
        .map((name) => \`<option value="\${escapeHtml(name)}">\${escapeHtml(name)}</option>\`)
        .join('');
      if (current && staffNames.includes(current)) {
        targetEmployee.value = current;
      }
    }

    function openShiftDialog(dateText, employeeName) {
      editingDate = dateText;
      editingEmployee = actor?.isAdmin ? employeeName : profile.displayName;
      selectedShifts = new Set(getEmployeeShift(dateText, editingEmployee).split('+').filter(Boolean));
      modalDate.textContent = actor?.isAdmin ? \`\${dateText} · \${editingEmployee}\` : dateText;
      renderShiftPicker();
      dialog.showModal();
    }

    function renderShiftPicker() {
      shiftPicker.innerHTML = SHIFT_CODES.map((shift) => {
        const active = selectedShifts.has(shift);
        return \`<button class="shift-option \${active ? 'active' : ''}" type="button" data-shift="\${shift}">\${shift}</button>\`;
      }).join('');

      document.querySelectorAll('.shift-option').forEach((button) => {
        button.addEventListener('click', () => {
          const shift = button.dataset.shift;
          if (selectedShifts.has(shift)) {
            selectedShifts.delete(shift);
          } else {
            selectedShifts.add(shift);
          }
          renderShiftPicker();
        });
      });
    }

    async function saveShift() {
      if (!profile) {
        showError('請先登入 LINE。');
        return;
      }

      const shift = SHIFT_CODES.filter((code) => selectedShifts.has(code)).join('+');
      if (!shift) {
        showError('請至少選一個班別。');
        return;
      }

      const response = await fetch('/api/my-shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: editingDate,
          shift,
          targetName: editingEmployee,
          idToken,
          devProfile: profile,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        showError(data.error || '填班失敗');
        return;
      }

      schedules = schedules.filter((schedule) => {
        return !(schedule.date === editingDate && schedule.employee === editingEmployee);
      });
      schedules.push(data.schedule);
      dialog.close();
      render();
    }

    function getEmployeeShift(dateText, employeeName) {
      return schedules
        .filter((schedule) => schedule.date === dateText && schedule.employee === employeeName)
        .map((schedule) => schedule.shift)
        .filter(Boolean)
        .join('+');
    }

    function changeMonth(delta) {
      activeMonth = new Date(activeMonth.getFullYear(), activeMonth.getMonth() + delta, 1);
      render();
    }

    function getMonthDates(date) {
      const year = date.getFullYear();
      const month = date.getMonth();
      const lastDay = new Date(year, month + 1, 0).getDate();
      return Array.from({ length: lastDay }, (_, index) => {
        return formatDate(new Date(year, month, index + 1));
      });
    }

    function formatMonthTitle(date) {
      return \`\${date.getFullYear()} / \${String(date.getMonth() + 1).padStart(2, '0')}\`;
    }

    function formatDate(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return \`\${year}-\${month}-\${day}\`;
    }

    function parseDate(dateText) {
      const [year, month, day] = dateText.split('-').map(Number);
      return new Date(year, month - 1, day);
    }

    function showError(message) {
      notice.style.display = 'block';
      notice.className = 'notice error';
      notice.textContent = message;
    }

    function escapeHtml(value) {
      return String(value || '').replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      }[char]));
    }
  </script>
</body>
</html>`;
}
