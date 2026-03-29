# iso27001-annex-guide

ISO/IEC 27001:2022 Annex A 互動式檢核表 — 涵蓋全部 93 項控制措施，支援角色、頻率、控制域多維篩選。

![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

## 功能

- 🔍 **多維篩選** — 角色（DIR/SEC/DEV/OPS/ADM）、頻率（每日～事件驅動）、控制域（A.5～A.8）、關鍵字搜尋
- 📊 **即時統計** — 顯示項目數、已完成、完成率、待處理
- 👥 **角色面板** — 展開可見代碼、角色、職責範圍、建議人選、各角色進度
- 🆕 **2022 新增標記** — 一鍵篩選 11 項新增控制措施
- 💾 **自動保存** — 勾選狀態儲存在瀏覽器 localStorage
- 🌗 **主題切換** — 系統 / 淺色 / 深色三段式切換，偏好自動記憶
- 📂 **批次操作** — 一鍵展開/收合全部控制項、全選/取消全選可見項目
- 📤 **匯出報表** — 支援匯出 Markdown、DOCX、Excel，僅匯出當前篩選結果

## 快速開始

```bash
# 1. Clone
git clone https://github.com/YOUR_USERNAME/iso27001-annex-guide.git
cd iso27001-annex-guide

# 2. 安裝依賴
npm install

# 3. 啟動開發伺服器
npm run dev
```

打開 `http://localhost:5173`

## 部署到 Vercel

### 方式 A：透過 GitHub（推薦）

1. 把 repo 推到 GitHub
2. 前往 [vercel.com/new](https://vercel.com/new)
3. 點擊 **Import Git Repository**，選擇 `iso27001-annex-guide`
4. Vercel 會自動偵測 Vite 框架，**零設定直接部署**
5. 每次 `git push` 會自動觸發重新部署

### 方式 B：Vercel CLI

```bash
# 安裝 Vercel CLI
npm i -g vercel

# 登入
vercel login

# 部署（首次會引導設定）
vercel

# 部署到正式環境
vercel --prod
```

### 自訂域名

部署完成後在 Vercel Dashboard → Settings → Domains 加入自訂域名。

## 專案結構

```
iso27001-annex-guide/
├── index.html              # HTML 入口
├── package.json            # 依賴與腳本
├── vite.config.js          # Vite 建置設定
├── LICENSE                 # MIT License
├── .gitignore
├── .vscode/
│   ├── extensions.json     # 推薦 VS Code 擴充
│   └── settings.json       # 編輯器設定
└── src/
    ├── main.jsx            # React 掛載點
    ├── App.jsx             # 主應用（資料 + 邏輯 + UI）
    └── export.js           # 匯出功能（Markdown / DOCX / Excel）
```

## 自訂修改

### 新增檢核項目

在 `src/App.jsx` 的 `CHECKLIST_DATA` 陣列中新增：

```jsx
{
  id: "8.35.1",                    // 唯一 ID
  control: "A.8.35",               // 控制項編號
  controlName: "新控制措施名稱",     // 控制項名稱
  section: "A.8",                   // 所屬域：A.5 / A.6 / A.7 / A.8
  freq: "M",                       // 頻率：D / W / M / Q / S / A / E
  role: "DEV",                     // 角色：DIR / SEC / DEV / OPS / ADM
  task: "具體檢核任務描述",          // 任務內容
  isNew: false                     // 是否為 2022 新增
}
```

### 修改角色定義

在 `ROLES` 陣列中修改：

```jsx
{
  id: "SEC",
  emoji: "🛡️",
  label: "SEC",
  full: "資安負責人 / Security Lead",
  scope: "安全監控、事件回應、脆弱性管理、稽核協調",
  suggest: "可由 DIR 兼任或指定資深工程師",
  color: "#f59e0b"
}
```

## 資料儲存

勾選狀態與主題偏好儲存在瀏覽器 `localStorage`：

| Key | 說明 |
|-----|------|
| `iso27001-checks` | 勾選狀態（含完成時間戳記） |
| `iso27001-theme` | 主題偏好（system / light / dark） |

- 清除瀏覽器資料會重置所有勾選與主題設定
- 不同瀏覽器/裝置的狀態互相獨立
- 如需跨裝置同步，可改接後端 API 或 Firebase

## 參考標準

- [ISO/IEC 27001:2022](https://www.iso.org/standard/27001) — 資訊安全管理系統要求
- [ISO/IEC 27002:2022](https://www.iso.org/standard/75652.html) — 資訊安全控制措施指引
- [NIST SP 800-63B-4](https://pages.nist.gov/800-63-4/sp800-63b.html) — 數位身分驗證指引

## License

[MIT](LICENSE)
