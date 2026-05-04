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
      --ink: #4a2430;
      --muted: #8f6672;
      --line: #f2bfcb;
      --line-strong: #e78298;
      --brand: #e83f67;
      --brand-dark: #b91f47;
      --bg: #fff6f8;
      --panel: #ffffff;
      --cream: #fffaf0;
      --today: #fff1cf;
      --mine: #ffe5ed;
      --weekend: #c9274b;
      --danger: #b42318;
      --shadow: 0 18px 46px rgba(180, 63, 95, 0.13);
    }
    * {
      box-sizing: border-box;
    }
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background:
        radial-gradient(circle at 18px 18px, rgba(232, 63, 103, 0.08) 0 2px, transparent 3px),
        linear-gradient(135deg, #fff8fb 0%, #fff2f5 42%, #fffaf0 100%);
      background-size: 42px 42px, auto;
      color: var(--ink);
      min-height: 100vh;
    }
    header {
      align-items: center;
      background:
        linear-gradient(90deg, rgba(255, 255, 255, 0.98), rgba(255, 248, 250, 0.98)),
        var(--panel);
      border-bottom: 2px solid var(--line);
      display: flex;
      gap: 12px;
      justify-content: space-between;
      padding: 14px 18px;
      position: sticky;
      top: 0;
      z-index: 20;
      box-shadow: 0 10px 28px rgba(180, 63, 95, 0.1);
    }
    .brand {
      align-items: center;
      display: flex;
      gap: 12px;
      min-width: 0;
    }
    .brand-copy {
      min-width: 0;
    }
    h1 {
      font-size: 20px;
      line-height: 1.2;
      margin: 0;
      letter-spacing: 0;
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
      background: #fff;
      border: 1px solid var(--line);
      border-radius: 999px;
      box-shadow: 0 8px 22px rgba(180, 63, 95, 0.1);
      padding: 5px;
    }
    .icon-button {
      align-items: center;
      background: var(--cream);
      border: 1px solid var(--line);
      border-radius: 999px;
      color: var(--brand-dark);
      cursor: pointer;
      display: grid;
      font-size: 18px;
      font-weight: 800;
      height: 38px;
      line-height: 1;
      place-items: center;
      width: 38px;
    }
    .icon-button:hover {
      background: var(--brand);
      border-color: var(--brand);
      color: #fff;
    }
    .month-title {
      color: var(--ink);
      font-size: 17px;
      font-weight: 900;
      min-width: 86px;
      text-align: center;
    }
    main {
      padding: 18px 12px 28px;
    }
    .brand-logo {
      background: #fff;
      border: 2px solid #fff;
      border-radius: 18px;
      box-shadow: 0 10px 22px rgba(40, 82, 63, 0.16);
      flex: 0 0 auto;
      height: 58px;
      object-fit: cover;
      width: 58px;
    }
    .dev-login {
      display: none;
      gap: 8px;
      margin: 0 auto 12px;
      max-width: 820px;
    }
    .dev-login input {
      border: 1px solid var(--line);
      border-radius: 14px;
      flex: 1;
      font-size: 15px;
      padding: 10px 12px;
    }
    .dev-login button,
    .line-login-button,
    .primary {
      background: linear-gradient(180deg, #f05278, var(--brand));
      border: 0;
      border-radius: 999px;
      box-shadow: 0 8px 18px rgba(232, 63, 103, 0.22);
      color: #fff;
      cursor: pointer;
      font-size: 15px;
      font-weight: 900;
      padding: 10px 12px;
    }
    .login-panel {
      align-items: center;
      background: rgba(255, 255, 255, 0.94);
      border: 1px solid var(--line);
      border-radius: 18px;
      box-shadow: var(--shadow);
      display: none;
      gap: 12px;
      justify-content: space-between;
      margin: 0 auto 12px;
      max-width: 820px;
      padding: 14px;
    }
    .login-title {
      font-size: 16px;
      font-weight: 900;
      margin-bottom: 3px;
    }
    .login-copy {
      color: var(--muted);
      font-size: 13px;
      line-height: 1.45;
    }
    .line-login-button {
      flex: 0 0 auto;
      min-height: 42px;
      padding: 10px 18px;
    }
    .notice {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 16px;
      box-shadow: var(--shadow);
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
      margin: 0 auto 12px;
      max-width: 1180px;
    }
    .profile-panel,
    .admin-panel {
      align-items: center;
      background: rgba(255, 255, 255, 0.88);
      border: 1px solid var(--line);
      border-radius: 18px;
      box-shadow: var(--shadow);
      display: none;
      flex-wrap: wrap;
      gap: 8px;
      margin: 0 auto 10px;
      max-width: 1180px;
      padding: 10px;
    }
    .profile-panel {
      display: none;
      justify-content: space-between;
    }
    .profile-panel .profile-actions {
      align-items: center;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .profile-panel strong {
      font-size: 14px;
    }
    .admin-panel label {
      color: var(--muted);
      font-size: 13px;
      font-weight: 800;
    }
    .profile-panel input,
    .admin-panel select,
    .admin-panel input {
      border: 1px solid var(--line);
      border-radius: 999px;
      font-size: 15px;
      min-height: 38px;
      padding: 8px 10px;
    }
    .profile-panel input {
      min-width: 150px;
    }
    .admin-panel select {
      min-width: 150px;
    }
    .admin-panel input {
      min-width: 140px;
    }
    .admin-panel .secondary {
      min-height: 38px;
    }
    .admin-tools {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-left: auto;
    }
    .history-panel {
      background: rgba(255, 255, 255, 0.9);
      border: 1px solid var(--line);
      border-radius: 18px;
      box-shadow: var(--shadow);
      display: none;
      margin: 0 auto 12px;
      max-width: 1180px;
      overflow: hidden;
    }
    .history-panel h2 {
      background: #ffe9ef;
      border-bottom: 1px solid var(--line);
      font-size: 15px;
      margin: 0;
      padding: 10px 12px;
    }
    .history-list {
      display: grid;
      gap: 1px;
      max-height: 220px;
      overflow: auto;
    }
    .history-item {
      background: #fff;
      display: grid;
      gap: 4px;
      grid-template-columns: 150px 1fr;
      padding: 9px 12px;
    }
    .history-time {
      color: var(--muted);
      font-size: 12px;
      font-weight: 800;
    }
    .history-main {
      font-size: 13px;
      font-weight: 800;
      line-height: 1.45;
    }
    .history-user-id {
      color: var(--muted);
      display: block;
      font-size: 12px;
      font-weight: 600;
      word-break: break-all;
    }
    .legend span {
      background: rgba(255, 255, 255, 0.9);
      border: 1px solid var(--line);
      border-radius: 999px;
      box-shadow: 0 8px 18px rgba(180, 63, 95, 0.08);
      padding: 7px 11px;
    }
    .table-wrap {
      background: var(--panel);
      border: 2px solid var(--line);
      border-radius: 18px;
      box-shadow: var(--shadow);
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
    .staff-head {
      overflow: hidden;
      padding: 0 3px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    th,
    td {
      border: 1px solid var(--line);
      height: 46px;
      padding: 0;
      text-align: center;
      vertical-align: middle;
    }
    th {
      background: #ffe9ef;
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
      width: 82px;
      z-index: 4;
    }
    .date-head {
      background: #ffdbe5;
    }
    .date-cell {
      background: #fffafc;
      color: var(--ink);
      font-weight: 800;
    }
    .weekday {
      color: var(--muted);
      display: inline-block;
      font-size: 12px;
      margin-left: 3px;
    }
    .holiday-name {
      color: var(--weekend);
      display: block;
      font-size: 11px;
      font-weight: 900;
      line-height: 1.2;
      margin-top: 2px;
    }
    tr.weekend .date-cell {
      color: var(--weekend);
    }
    tr.day-off .date-cell {
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
      background: #ffd3df;
      outline: 3px solid var(--brand);
      outline-offset: -3px;
    }
    .shift-code {
      background: #fff;
      border: 1px solid var(--line-strong);
      border-radius: 999px;
      box-shadow: 0 4px 10px rgba(180, 63, 95, 0.1);
      color: var(--brand-dark);
      display: inline-block;
      font-size: 16px;
      font-weight: 900;
      line-height: 1;
      min-width: 36px;
      padding: 6px 9px;
    }
    .empty-cell {
      color: #d4a3ae;
      font-size: 18px;
    }
    dialog {
      border: 0;
      border-radius: 22px;
      box-shadow: 0 22px 70px rgba(74, 36, 48, 0.28);
      max-width: calc(100vw - 28px);
      padding: 0;
      width: 360px;
    }
    dialog::backdrop {
      background: rgba(15, 23, 42, 0.32);
    }
    .modal {
      background: linear-gradient(180deg, #fff, #fff6f8);
      padding: 20px;
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
      border-radius: 16px;
      color: var(--ink);
      cursor: pointer;
      font-size: 18px;
      font-weight: 900;
      height: 46px;
    }
    .shift-option.active {
      background: linear-gradient(180deg, #f05278, var(--brand));
      border-color: var(--brand);
      box-shadow: 0 8px 18px rgba(232, 63, 103, 0.22);
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
      border-radius: 999px;
      color: var(--ink);
      cursor: pointer;
      font-size: 15px;
      font-weight: 800;
      padding: 10px 12px;
    }
    @media (max-width: 720px) {
      header {
        align-items: center;
        flex-direction: row;
        gap: 8px;
        padding: 8px;
      }
      .brand {
        gap: 8px;
      }
      .brand-logo {
        border-radius: 12px;
        height: 40px;
        width: 40px;
      }
      h1 {
        font-size: 15px;
      }
      .user {
        font-size: 11px;
      }
      .icon-button {
        height: 32px;
        width: 32px;
      }
      .month-title {
        font-size: 14px;
        min-width: 72px;
      }
      .month-nav {
        flex: 0 0 auto;
        justify-content: space-between;
      }
      main {
        padding: 8px 4px 18px;
      }
      .notice {
        border-radius: 12px;
        font-size: 12px;
        margin-bottom: 6px;
        padding: 8px 10px;
      }
      .login-panel {
        align-items: stretch;
        border-radius: 12px;
        flex-direction: column;
        gap: 10px;
        margin-bottom: 6px;
        padding: 10px;
      }
      .line-login-button {
        width: 100%;
      }
      .legend {
        gap: 4px;
        margin-bottom: 6px;
        padding: 0 2px;
      }
      .legend span {
        font-size: 11px;
        padding: 4px 7px;
      }
      .profile-panel,
      .admin-panel {
        border-radius: 12px;
        gap: 6px;
        margin-bottom: 6px;
        padding: 7px;
      }
      .profile-panel {
        align-items: stretch;
        flex-direction: column;
      }
      .profile-panel .profile-actions {
        width: 100%;
      }
      .profile-panel input,
      .profile-panel .secondary {
        flex: 1 1 118px;
        font-size: 12px;
        min-height: 32px;
        padding: 6px 8px;
      }
      .admin-panel label {
        width: 100%;
      }
      .admin-panel select,
      .admin-panel input,
      .admin-panel .secondary {
        font-size: 12px;
        min-height: 32px;
        padding: 6px 8px;
      }
      .admin-panel select {
        flex: 1 1 118px;
        min-width: 0;
      }
      .admin-panel input {
        flex: 1 1 118px;
        min-width: 0;
      }
      .date-head,
      .date-cell {
        width: 43px;
      }
      .table-wrap {
        border-radius: 12px;
        overflow-x: hidden;
      }
      table {
        min-width: 0;
        width: 100%;
      }
      th,
      td {
        font-size: 10px;
        height: 34px;
      }
      th:not(.date-head),
      td:not(.date-cell) {
        width: calc((100vw - 51px) / var(--staff-count, 10));
      }
      th {
        font-size: 10px;
        height: 58px;
      }
      .staff-head {
        align-items: center;
        display: inline-flex;
        height: 52px;
        justify-content: center;
        line-height: 1;
        max-width: 18px;
        overflow: hidden;
        text-overflow: clip;
        white-space: normal;
        writing-mode: vertical-rl;
      }
      .date-cell {
        font-size: 12px;
      }
      .weekday {
        font-size: 10px;
        margin-left: 1px;
      }
      .holiday-name {
        font-size: 8px;
      }
      .shift-code {
        border: 0;
        box-shadow: none;
        font-size: 12px;
        min-width: 0;
        padding: 3px 4px;
      }
      .admin-tools {
        margin-left: 0;
        width: 100%;
      }
      .history-item {
        grid-template-columns: 1fr;
        padding: 7px 9px;
      }
      .history-panel {
        border-radius: 12px;
        margin-bottom: 6px;
      }
      .history-list {
        max-height: 120px;
      }
    }
    @media print {
      body {
        background: #fff;
      }
      header,
      main {
        padding: 0;
      }
      .brand-logo,
      .month-nav,
      .dev-login,
      .login-panel,
      .notice,
      .profile-panel,
      .admin-panel,
      .legend,
      .history-panel {
        display: none !important;
      }
      .brand {
        margin: 0 0 10px;
      }
      .user {
        color: #555;
      }
      .table-wrap {
        border: 1px solid #222;
        border-radius: 0;
        box-shadow: none;
        max-width: none;
        overflow: visible;
      }
      table {
        font-size: 11px;
        min-width: 0;
      }
      th,
      td {
        border-color: #222;
        height: 28px;
      }
      th,
      .date-head,
      .date-cell,
      tr.today td,
      td.mine {
        background: #fff !important;
      }
      .shift-code {
        border: 0;
        box-shadow: none;
        color: #000;
        padding: 0;
      }
      .holiday-name {
        color: #000;
        font-size: 9px;
      }
    }
  </style>
</head>
<body>
  <header>
    <div class="brand">
      <img class="brand-logo" src="/assets/logo11.png" alt="清福全">
      <div class="brand-copy">
        <h1>清心填班系統</h1>
        <div class="user" id="user">登入中</div>
      </div>
    </div>
    <div class="month-nav" aria-label="月份切換">
      <button class="icon-button" type="button" id="prevMonth" aria-label="上個月">‹</button>
      <div class="month-title" id="monthTitle"></div>
      <button class="icon-button" type="button" id="nextMonth" aria-label="下個月">›</button>
    </div>
  </header>
  <main>
    <section class="login-panel" id="loginPanel" aria-label="LINE 登入">
      <div>
        <div class="login-title">請先登入 LINE</div>
        <div class="login-copy" id="loginCopy">登入後會自動把你的 LINE 名稱加入班表欄位。</div>
      </div>
      <button class="line-login-button" type="button" id="lineLoginButton">使用 LINE 登入</button>
    </section>
    <div class="dev-login" id="devLogin">
      <input id="devName" value="測試員工" aria-label="測試名稱">
      <button type="button" id="devLoginButton">使用測試身份</button>
    </div>
    <div class="notice" id="notice">讀取班表中</div>
    <div class="profile-panel" id="profilePanel">
      <strong>我的名稱</strong>
      <div class="profile-actions">
        <input id="myDisplayName" placeholder="我的顯示名稱" aria-label="我的顯示名稱">
        <button class="secondary" type="button" id="renameSelf">儲存名稱</button>
      </div>
    </div>
    <div class="admin-panel" id="adminPanel">
      <label for="targetEmployee">管理排班</label>
      <select id="targetEmployee"></select>
      <input id="renameEmployeeName" placeholder="改成新姓名" aria-label="改成新姓名">
      <button class="secondary" type="button" id="renameEmployee">修改名稱</button>
      <input id="newEmployeeName" placeholder="新增員工姓名" aria-label="新增員工姓名">
      <button class="secondary" type="button" id="addEmployee">加入欄位</button>
      <button class="secondary" type="button" id="removeEmployee">移除員工</button>
      <div class="admin-tools">
        <button class="secondary" type="button" id="refreshHistory">操作紀錄</button>
        <button class="secondary" type="button" id="printSchedule">輸出 PDF</button>
      </div>
    </div>
    <section class="history-panel" id="historyPanel" aria-label="操作紀錄">
      <h2>最近操作紀錄</h2>
      <div class="history-list" id="historyList"></div>
    </section>
    <div class="legend">
      <span>點自己的欄位填班</span>
      <span>班別：${SHIFT_CODES.join(' / ')}</span>
      <span>X：不能上班</span>
      <span>可複選，例如 A+I</span>
      <span>紅字：台灣休假日</span>
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
        <button class="secondary" type="button" id="clearShift">移除班別</button>
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
    const taiwanHolidays = {
      '2026-01-01': '元旦',
      '2026-02-16': '春節',
      '2026-02-17': '春節',
      '2026-02-18': '春節',
      '2026-02-19': '春節',
      '2026-02-20': '春節',
      '2026-02-27': '和平紀念日',
      '2026-04-03': '兒清連假',
      '2026-04-06': '兒清連假',
      '2026-05-01': '勞動節',
      '2026-06-19': '端午節',
      '2026-09-25': '中秋連假',
      '2026-09-28': '教師節',
      '2026-10-09': '國慶日',
      '2026-10-26': '光復節',
      '2026-12-25': '行憲紀念日',
    };

    let profile = null;
    let actor = null;
    let idToken = '';
    let schedules = [];
    let employees = [];
    let activeMonth = new Date();
    let editingDate = '';
    let editingEmployee = '';
    let selectedShifts = new Set();
    let refreshTimer = null;
    let isLoadingSchedules = false;

    const tableHead = document.querySelector('#tableHead');
    const tableBody = document.querySelector('#tableBody');
    const notice = document.querySelector('#notice');
    const user = document.querySelector('#user');
    const loginPanel = document.querySelector('#loginPanel');
    const loginCopy = document.querySelector('#loginCopy');
    const devLogin = document.querySelector('#devLogin');
    const devName = document.querySelector('#devName');
    const profilePanel = document.querySelector('#profilePanel');
    const myDisplayName = document.querySelector('#myDisplayName');
    const monthTitle = document.querySelector('#monthTitle');
    const dialog = document.querySelector('#shiftDialog');
    const modalDate = document.querySelector('#modalDate');
    const shiftPicker = document.querySelector('#shiftPicker');
    const adminPanel = document.querySelector('#adminPanel');
    const targetEmployee = document.querySelector('#targetEmployee');
    const renameEmployeeName = document.querySelector('#renameEmployeeName');
    const newEmployeeName = document.querySelector('#newEmployeeName');
    const historyPanel = document.querySelector('#historyPanel');
    const historyList = document.querySelector('#historyList');

    document.querySelector('#prevMonth').addEventListener('click', () => changeMonth(-1));
    document.querySelector('#nextMonth').addEventListener('click', () => changeMonth(1));
    document.querySelector('#cancelShift').addEventListener('click', () => dialog.close());
    document.querySelector('#clearShift').addEventListener('click', () => {
      selectedShifts.clear();
      renderShiftPicker();
    });
    document.querySelector('#saveShift').addEventListener('click', saveShift);
    document.querySelector('#addEmployee').addEventListener('click', addEmployee);
    document.querySelector('#removeEmployee').addEventListener('click', removeEmployee);
    document.querySelector('#refreshHistory').addEventListener('click', loadHistory);
    document.querySelector('#printSchedule').addEventListener('click', () => window.print());
    document.querySelector('#lineLoginButton').addEventListener('click', () => startLineLogin(true));
    document.querySelector('#renameSelf').addEventListener('click', renameSelf);
    document.querySelector('#renameEmployee').addEventListener('click', renameSelectedEmployee);
    document.querySelector('#devLoginButton').addEventListener('click', async () => {
      profile = {
        userId: 'dev-user',
        displayName: devName.value.trim() || '測試員工',
      };
      user.textContent = profile.displayName;
      devLogin.style.display = 'none';
      const sessionOk = await loadSession();
      if (!sessionOk) return;
      renderProfilePanel();
      await loadSchedules();
      startLiveRefresh();
    });

    boot();

    async function boot() {
      try {
        if (LIFF_ID) {
          await liff.init({ liffId: LIFF_ID });
          if (!liff.isLoggedIn()) {
            showLoginPrompt('請點下方按鈕登入 LINE，登入後就可以填班。');
            return;
          }
          const sessionOk = await completeLineSession();
          if (sessionOk) {
            await loadSchedules();
            startLiveRefresh();
          }
          return;
        }

        devLogin.style.display = 'flex';
        notice.textContent = '尚未設定 LIFF，請先用測試身份預覽。';
        user.textContent = '測試模式';
        render();
      } catch (error) {
        if (isLoginError(error)) {
          showLoginPrompt('LINE 登入狀態已失效，請重新登入。');
          return;
        }

        showError(error.message || '登入失敗');
      }
    }

    async function completeLineSession() {
      profile = await liff.getProfile();
      idToken = liff.getIDToken();
      if (!idToken) {
        showLoginPrompt('目前沒有取得 LINE 登入授權，請重新登入。');
        return false;
      }

      user.textContent = profile.displayName;
      const sessionOk = await loadSession();
      if (!sessionOk) return false;
      loginPanel.style.display = 'none';
      return true;
    }

    function startLineLogin(force = false) {
      if (!LIFF_ID) {
        showError('尚未設定 LIFF ID，暫時無法使用 LINE 登入。');
        return;
      }

      if (force && window.liff?.isLoggedIn?.()) {
        liff.logout();
      }

      const redirectUri = window.location.origin + window.location.pathname;
      liff.login({ redirectUri });
    }

    function showLoginPrompt(message) {
      loginCopy.textContent = message;
      loginPanel.style.display = 'flex';
      notice.style.display = 'none';
      user.textContent = '尚未登入';
    }

    async function loadSchedules(options = {}) {
      if (isLoadingSchedules) return;
      isLoadingSchedules = true;
      const silent = options.silent === true;
      try {
        if (!silent) {
          notice.className = 'notice';
          notice.textContent = '讀取班表中';
          notice.style.display = 'block';
        }
        const response = await fetch('/api/schedules');
        const data = await response.json();
        if (!response.ok) {
          showError(data.error || '讀取班表失敗');
          return;
        }
        schedules = data.schedules || [];
        employees = data.employees || [];
        if (!silent) {
          notice.style.display = 'none';
        }
        render();
      } finally {
        isLoadingSchedules = false;
      }
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
      if (actor?.isRemoved) {
        user.textContent = profile.displayName;
        showError('此帳號已被管理員從員工名單移除。');
        return false;
      }
      if (actor?.isAdmin) {
        user.textContent = actor.displayName + ' 管理者';
        await loadHistory();
      } else {
        user.textContent = actor.displayName;
      }
      profile.displayName = actor.displayName;
      renderProfilePanel();
      return true;
    }

    function renderProfilePanel() {
      if (!actor || actor.isRemoved) {
        profilePanel.style.display = 'none';
        return;
      }

      profilePanel.style.display = 'flex';
      myDisplayName.value = actor.displayName || profile?.displayName || '';
    }

    function render() {
      const dates = getMonthDates(activeMonth);
      const staffNames = getStaffNames();
      const today = formatDate(new Date());
      monthTitle.textContent = formatMonthTitle(activeMonth);
      document.documentElement.style.setProperty('--staff-count', String(Math.max(staffNames.length, 1)));

      tableHead.innerHTML = '<tr><th class="date-head">日期</th>' + staffNames
        .map((name) => \`<th><span class="staff-head">\${escapeHtml(name)}</span></th>\`)
        .join('') + '</tr>';

      renderAdminPanel(staffNames);

      tableBody.innerHTML = dates.map((dateText) => {
        const date = parseDate(dateText);
        const weekend = date.getDay() === 0 || date.getDay() === 6;
        const holidayName = taiwanHolidays[dateText] || '';
        const dayOff = weekend || holidayName;
        const rowClass = [
          weekend ? 'weekend' : '',
          dayOff ? 'day-off' : '',
          dateText === today ? 'today' : '',
        ].filter(Boolean).join(' ');
        const cells = staffNames.map((name) => renderCell(dateText, name)).join('');
        return \`
          <tr class="\${rowClass}">
            <td class="date-cell">
              \${date.getDate()}<span class="weekday">\${weekdays[date.getDay()]}</span>
              \${holidayName ? \`<span class="holiday-name">\${escapeHtml(holidayName)}</span>\` : ''}
            </td>
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
      const names = employees.map((employee) => employee.displayName).filter(Boolean);
      return [...new Set(names)];
    }

    function renderAdminPanel(staffNames) {
      if (!actor?.isAdmin) {
        adminPanel.style.display = 'none';
        historyPanel.style.display = 'none';
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

    async function renameSelf() {
      const newName = myDisplayName.value.trim();
      if (!newName || !actor) return;

      await renameEmployeeRequest({
        currentName: actor.displayName,
        newName,
        self: true,
      });
    }

    async function renameSelectedEmployee() {
      const currentName = targetEmployee.value;
      const newName = renameEmployeeName.value.trim();
      if (!currentName || !newName) return;

      await renameEmployeeRequest({
        currentName,
        newName,
        self: currentName === actor?.displayName,
      });
      renameEmployeeName.value = '';
    }

    async function renameEmployeeRequest({ currentName, newName, self }) {
      const response = await fetch('/api/employees/rename', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentName,
          newName,
          idToken,
          devProfile: profile,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        showError(data.error || '修改名稱失敗');
        return;
      }

      if (self) {
        actor.displayName = data.employee.displayName;
        profile.displayName = data.employee.displayName;
        user.textContent = actor.isAdmin ? actor.displayName + ' 管理者' : actor.displayName;
        renderProfilePanel();
      }
      await loadSchedules();
      await loadHistory();
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
      if (shift) {
        schedules.push(data.schedule);
      }
      dialog.close();
      await loadSchedules({ silent: true });
      await loadHistory();
    }

    function startLiveRefresh() {
      if (refreshTimer) window.clearInterval(refreshTimer);
      refreshTimer = window.setInterval(async () => {
        if (document.hidden || dialog.open || !profile || actor?.isRemoved) return;
        await loadSchedules({ silent: true });
        if (actor?.isAdmin) await loadHistory();
      }, 5000);
    }

    document.addEventListener('visibilitychange', async () => {
      if (!document.hidden && profile && !actor?.isRemoved) {
        await loadSchedules({ silent: true });
        if (actor?.isAdmin) await loadHistory();
      }
    });

    async function loadHistory() {
      if (!actor?.isAdmin) return;

      const response = await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idToken,
          devProfile: profile,
          limit: 80,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        showError(data.error || '讀取操作紀錄失敗');
        return;
      }

      historyPanel.style.display = 'block';
      historyList.innerHTML = (data.history || []).map((record) => {
        const userId = record.lineUserId ? \`<span class="history-user-id">LINE userId: \${escapeHtml(record.lineUserId)}</span>\` : '';
        return \`
          <div class="history-item">
            <div class="history-time">\${escapeHtml(record.createdAt)}</div>
            <div class="history-main">
              \${escapeHtml(record.displayName)}｜\${escapeHtml(record.action)}｜\${escapeHtml(record.date)}｜\${escapeHtml(record.shift)}
              \${userId}
            </div>
          </div>
        \`;
      }).join('') || '<div class="history-item"><div class="history-main">尚無操作紀錄</div></div>';
    }

    async function addEmployee() {
      const name = newEmployeeName.value.trim();
      if (!name) return;

      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: name,
          idToken,
          devProfile: profile,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        showError(data.error || '新增員工失敗');
        return;
      }

      newEmployeeName.value = '';
      await loadSchedules();
      await loadHistory();
    }

    async function removeEmployee() {
      const name = targetEmployee.value;
      if (!name) return;

      if (name === profile?.displayName) {
        showError('不能移除目前登入的管理員。');
        return;
      }

      const confirmed = window.confirm(\`確定要移除 \${name} 嗎？移除後此人不會出現在欄位中。\`);
      if (!confirmed) return;

      const response = await fetch('/api/employees/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: name,
          idToken,
          devProfile: profile,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        showError(data.error || '移除員工失敗');
        return;
      }

      await loadSchedules();
      await loadHistory();
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

    function isLoginError(error) {
      const message = String(error?.message || '');
      return message.includes('LINE login') || message.includes('Invalid LINE') || message.includes('登入');
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
