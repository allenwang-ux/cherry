# 排班 LINE Bot - Google Sheets 讀取範例

先讓 Node.js 能讀到 Google Sheets，再接 LINE Bot webhook。

## 1. 安裝套件

```bash
npm install
```

## 2. 建立 Google Service Account

1. 到 Google Cloud Console 建立專案。
2. 啟用 Google Sheets API。
3. 建立 Service Account，下載 JSON key。
4. 把 Google Sheet 分享給 Service Account 的 email，權限給「檢視者」即可。

## 3. 建立 `.env`

```bash
cp .env.example .env
```

填入：

- `GOOGLE_SHEET_ID`: 試算表網址中的 ID
- `GOOGLE_SHEET_RANGE`: 例如 `排班!A1:E20`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`: JSON key 裡的 `client_email`
- `GOOGLE_PRIVATE_KEY`: JSON key 裡的 `private_key`

## 4. 讀取資料

```bash
npm run read-sheet
npm run schedules
```

建議 Sheet 欄位先設成：

| 日期 | 班別 | 員工 | 備註 |
| --- | --- | --- | --- |
| 2026-05-04 | A | 小明 | 吧台 |

欄位名稱也支援部分別名，例如 `姓名`、`班次`、`崗位`。

班別固定支援：

```text
A / B / C / H / I
```

## 5. 啟動 LINE Bot webhook

到 LINE Developers 建立 Messaging API channel，將以下資料填到 `.env`：

- `LINE_CHANNEL_ACCESS_TOKEN`
- `LINE_CHANNEL_SECRET`

啟動伺服器：

```bash
npm run dev
```

本機 webhook 路徑是：

```text
http://localhost:3000/webhook
```

若要讓 LINE 打得到本機，可以用 ngrok 或部署到 Render、Railway、Fly.io 等平台。

目前支援的訊息：

- `今日排班`
- `明日排班`
- `5/4 排班`
- `本週排班`
- `小明排班`
- `填班`

## 6. 填班 UI 與 LINE Login

填班頁：

```text
http://localhost:3000/schedule
```

正式給員工使用時，建議建立 `LINE Login channel`，再建立 LIFF app：

1. LINE Developers Console 建立 `LINE Login channel`
2. 在 LINE Login channel 裡新增 LIFF app
3. Endpoint URL 設成你的公開網址，例如 `https://your-domain.com/schedule`
4. Scope 勾選 `profile`、`openid`
5. 將 LIFF ID 填到 `.env` 的 `LIFF_ID`
6. 將 LINE Login channel ID 填到 `.env` 的 `LINE_LOGIN_CHANNEL_ID`

Bot 收到 `填班` 會回覆 `PUBLIC_BASE_URL/schedule`。

填班成功後會：

- 寫回主班表的 `員工` 欄
- 自動新增或追加 `填班紀錄` 分頁
- 紀錄填寫時間、LINE userId、顯示名稱、日期、班別、備註

管理者功能：

- 可看到所有員工欄位
- 可點任何人的日期欄位代排班
- 可用「移除班別」清空某人的某一天班別
- 可在頁面查看最近操作紀錄，包含 LINE userId、顯示名稱、動作、日期、班別
- 可按「輸出 PDF」，用瀏覽器列印視窗另存 PDF 或直接列印

管理者設定方式：

```text
ADMIN_DISPLAY_NAMES=你的 LINE 顯示名稱
```

或用 LINE userId 設定，較穩定：

```text
ADMIN_LINE_USER_IDS=Uxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

多人管理者用逗號分隔：

```text
ADMIN_DISPLAY_NAMES=王小明,店長
ADMIN_LINE_USER_IDS=Uaaa,Ubbb
```

## 不接 LINE 先測回覆

```bash
npm run simulate -- 今日排班
npm run simulate -- 明日排班
npm run simulate -- 小明排班
```

## 本機健康檢查

啟動後可以打：

```text
http://localhost:3000/healthz
```

也可以用 debug API 測真實 Google Sheets 回覆：

```bash
curl -X POST http://localhost:3000/debug/reply \
  -H "Content-Type: application/json" \
  -d '{"text":"今日排班"}'
```

## Cloud Run 部署

Cloud Run 部署後，請將服務網址填回：

- LINE Developers Messaging API 的 Webhook URL：`https://你的-cloud-run-url/webhook`
- LIFF Endpoint URL：`https://你的-cloud-run-url/schedule`
- Cloud Run 環境變數 `PUBLIC_BASE_URL=https://你的-cloud-run-url`

正式環境建議：

```text
ALLOW_DEV_LOGIN=false
```
