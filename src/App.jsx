import { useState, useMemo, useEffect, useCallback } from "react";

const ROLES = [
  { id: "DIR", emoji: "👤", label: "DIR", full: "R&D Director / ISMS 管理代表", scope: "政策制定、管理審查、風險決策、對外聯繫、最終核准", suggest: "研發主管", color: "#6366f1" },
  { id: "SEC", emoji: "🛡️", label: "SEC", full: "資安負責人 / Security Lead", scope: "安全監控、事件回應、脆弱性管理、稽核協調", suggest: "可由 DIR 兼任或指定資深工程師", color: "#f59e0b" },
  { id: "DEV", emoji: "💻", label: "DEV", full: "開發工程師", scope: "安全編碼、程式碼審查、CI/CD 安全整合、測試", suggest: "全體開發人員", color: "#10b981" },
  { id: "OPS", emoji: "🔧", label: "OPS", full: "維運 / 基礎設施管理", scope: "伺服器、網路、備份、監控、環境管理", suggest: "DevOps / SRE 工程師", color: "#3b82f6" },
  { id: "ADM", emoji: "📋", label: "ADM", full: "行政 / 合規管理", scope: "人事流程、合約管理、文件管理、訓練協調", suggest: "行政人員或 DIR 兼任", color: "#ec4899" },
];

const FREQUENCIES = [
  { id: "D", emoji: "🔴", label: "每日", color: "#ef4444" },
  { id: "W", emoji: "🟠", label: "每週", color: "#f97316" },
  { id: "M", emoji: "🟡", label: "每月", color: "#eab308" },
  { id: "Q", emoji: "🟢", label: "每季", color: "#22c55e" },
  { id: "S", emoji: "🔵", label: "每半年", color: "#3b82f6" },
  { id: "A", emoji: "🟣", label: "每年", color: "#a855f7" },
  { id: "E", emoji: "⚪", label: "事件驅動", color: "#94a3b8" },
];

const SECTIONS = [
  { id: "A.5", label: "A.5 組織控制", count: 37 },
  { id: "A.6", label: "A.6 人員控制", count: 8 },
  { id: "A.7", label: "A.7 實體控制", count: 14 },
  { id: "A.8", label: "A.8 技術控制", count: 34 },
];

const CHECKLIST_DATA = [
  // A.5.1
  { id: "5.1.1", control: "A.5.1", controlName: "資訊安全政策", section: "A.5", freq: "A", role: "DIR", task: "審查頂層資訊安全政策是否仍符合組織目標與法規要求", isNew: false },
  { id: "5.1.2", control: "A.5.1", controlName: "資訊安全政策", section: "A.5", freq: "A", role: "DIR", task: "確認所有主題式政策（存取控制、密碼學、遠端工作等）均已更新", isNew: false },
  { id: "5.1.3", control: "A.5.1", controlName: "資訊安全政策", section: "A.5", freq: "A", role: "ADM", task: "確認政策已傳達給所有員工並取得簽署紀錄", isNew: false },
  { id: "5.1.4", control: "A.5.1", controlName: "資訊安全政策", section: "A.5", freq: "E", role: "DIR", task: "重大組織變更或法規異動時啟動政策審查", isNew: false },
  // A.5.2
  { id: "5.2.1", control: "A.5.2", controlName: "資訊安全角色與責任", section: "A.5", freq: "Q", role: "DIR", task: "確認所有資安角色已指派且紀錄最新", isNew: false },
  { id: "5.2.2", control: "A.5.2", controlName: "資訊安全角色與責任", section: "A.5", freq: "E", role: "ADM", task: "人員異動時更新角色指派文件", isNew: false },
  { id: "5.2.3", control: "A.5.2", controlName: "資訊安全角色與責任", section: "A.5", freq: "A", role: "DIR", task: "審查職務說明書中的安全責任是否完整", isNew: false },
  // A.5.3
  { id: "5.3.1", control: "A.5.3", controlName: "職責分離", section: "A.5", freq: "Q", role: "SEC", task: "審查關鍵流程是否存在職責衝突（申請/核准、開發/部署）", isNew: false },
  { id: "5.3.2", control: "A.5.3", controlName: "職責分離", section: "A.5", freq: "M", role: "SEC", task: "確認特權帳號操作與日常帳號已分離", isNew: false },
  { id: "5.3.3", control: "A.5.3", controlName: "職責分離", section: "A.5", freq: "Q", role: "SEC", task: "若無法完全分離，確認補償性控制有效運作", isNew: false },
  // A.5.4
  { id: "5.4.1", control: "A.5.4", controlName: "管理階層責任", section: "A.5", freq: "Q", role: "DIR", task: "確認管理階層已參與安全相關會議或審查", isNew: false },
  { id: "5.4.2", control: "A.5.4", controlName: "管理階層責任", section: "A.5", freq: "A", role: "DIR", task: "確認安全績效已納入員工考核機制", isNew: false },
  { id: "5.4.3", control: "A.5.4", controlName: "管理階層責任", section: "A.5", freq: "M", role: "DIR", task: "確認安全活動有充足資源（預算、人力、工具）", isNew: false },
  // A.5.5
  { id: "5.5.1", control: "A.5.5", controlName: "與主管機關的聯繫", section: "A.5", freq: "A", role: "DIR", task: "更新主管機關聯繫清單（NCC、TWCERT/CC 等）", isNew: false },
  { id: "5.5.2", control: "A.5.5", controlName: "與主管機關的聯繫", section: "A.5", freq: "A", role: "SEC", task: "確認法定通報程序與時限已文件化", isNew: false },
  { id: "5.5.3", control: "A.5.5", controlName: "與主管機關的聯繫", section: "A.5", freq: "E", role: "DIR", task: "發生重大資安事件時依程序通報", isNew: false },
  // A.5.6
  { id: "5.6.1", control: "A.5.6", controlName: "與特殊利益團體的聯繫", section: "A.5", freq: "Q", role: "SEC", task: "確認已訂閱相關安全通報與威脅情報來源", isNew: false },
  { id: "5.6.2", control: "A.5.6", controlName: "與特殊利益團體的聯繫", section: "A.5", freq: "A", role: "DIR", task: "審查參與的資安社群是否仍具價值", isNew: false },
  { id: "5.6.3", control: "A.5.6", controlName: "與特殊利益團體的聯繫", section: "A.5", freq: "M", role: "SEC", task: "追蹤並分享最新安全公告與漏洞資訊", isNew: false },
  // A.5.7
  { id: "5.7.1", control: "A.5.7", controlName: "威脅情報", section: "A.5", freq: "W", role: "SEC", task: "收集並審閱與組織相關的威脅情報（CVE 公告、產業趨勢）", isNew: true },
  { id: "5.7.2", control: "A.5.7", controlName: "威脅情報", section: "A.5", freq: "M", role: "SEC", task: "評估威脅情報對組織風險態勢的影響", isNew: true },
  { id: "5.7.3", control: "A.5.7", controlName: "威脅情報", section: "A.5", freq: "Q", role: "DIR", task: "將威脅情報發現整合至風險評估與安全運營", isNew: true },
  { id: "5.7.4", control: "A.5.7", controlName: "威脅情報", section: "A.5", freq: "E", role: "SEC", task: "偵測到相關威脅指標（IoC）時啟動應變程序", isNew: true },
  // A.5.8
  { id: "5.8.1", control: "A.5.8", controlName: "專案管理中的資訊安全", section: "A.5", freq: "E", role: "DIR", task: "新專案啟動時執行資訊安全風險評估", isNew: false },
  { id: "5.8.2", control: "A.5.8", controlName: "專案管理中的資訊安全", section: "A.5", freq: "E", role: "SEC", task: "確認專案計畫已納入安全里程碑與驗收標準", isNew: false },
  { id: "5.8.3", control: "A.5.8", controlName: "專案管理中的資訊安全", section: "A.5", freq: "E", role: "SEC", task: "專案結案前完成安全驗收測試", isNew: false },
  // A.5.9
  { id: "5.9.1", control: "A.5.9", controlName: "資訊及相關資產的清冊", section: "A.5", freq: "Q", role: "OPS", task: "盤點並更新資訊資產清冊（硬體、軟體、資料、服務）", isNew: false },
  { id: "5.9.2", control: "A.5.9", controlName: "資訊及相關資產的清冊", section: "A.5", freq: "Q", role: "DIR", task: "確認每項資產已指定擁有者", isNew: false },
  { id: "5.9.3", control: "A.5.9", controlName: "資訊及相關資產的清冊", section: "A.5", freq: "E", role: "OPS", task: "新增或汰除資產時即時更新清冊", isNew: false },
  // A.5.10
  { id: "5.10.1", control: "A.5.10", controlName: "資訊及相關資產的可接受使用", section: "A.5", freq: "A", role: "DIR", task: "審查可接受使用政策", isNew: false },
  { id: "5.10.2", control: "A.5.10", controlName: "資訊及相關資產的可接受使用", section: "A.5", freq: "E", role: "ADM", task: "新進人員入職時簽署可接受使用協議", isNew: false },
  { id: "5.10.3", control: "A.5.10", controlName: "資訊及相關資產的可接受使用", section: "A.5", freq: "A", role: "DIR", task: "確認 BYOD 政策已涵蓋個人裝置使用條件", isNew: false },
  // A.5.11
  { id: "5.11.1", control: "A.5.11", controlName: "資產歸還", section: "A.5", freq: "E", role: "ADM", task: "員工離職時依檢核表回收所有資產", isNew: false },
  { id: "5.11.2", control: "A.5.11", controlName: "資產歸還", section: "A.5", freq: "E", role: "ADM", task: "合約終止時確認外部方歸還或清除組織資料", isNew: false },
  { id: "5.11.3", control: "A.5.11", controlName: "資產歸還", section: "A.5", freq: "Q", role: "ADM", task: "審查未歸還資產清單並追蹤處理", isNew: false },
  // A.5.12
  { id: "5.12.1", control: "A.5.12", controlName: "資訊分類", section: "A.5", freq: "A", role: "DIR", task: "審查資訊分類方案是否符合現行需求", isNew: false },
  { id: "5.12.2", control: "A.5.12", controlName: "資訊分類", section: "A.5", freq: "Q", role: "SEC", task: "確認資產擁有者已依方案完成分類", isNew: false },
  { id: "5.12.3", control: "A.5.12", controlName: "資訊分類", section: "A.5", freq: "E", role: "DEV", task: "新增資訊資產時即時完成分類", isNew: false },
  // A.5.13
  { id: "5.13.1", control: "A.5.13", controlName: "資訊標示", section: "A.5", freq: "M", role: "SEC", task: "抽查文件與資料的標示是否符合分類方案", isNew: false },
  { id: "5.13.2", control: "A.5.13", controlName: "資訊標示", section: "A.5", freq: "Q", role: "OPS", task: "確認自動化標示機制正常運作", isNew: false },
  { id: "5.13.3", control: "A.5.13", controlName: "資訊標示", section: "A.5", freq: "E", role: "DEV", task: "與外部方交換資訊時確認標示的互通性", isNew: false },
  // A.5.14
  { id: "5.14.1", control: "A.5.14", controlName: "資訊傳輸", section: "A.5", freq: "M", role: "SEC", task: "確認敏感資訊傳輸均使用加密通道（TLS、VPN）", isNew: false },
  { id: "5.14.2", control: "A.5.14", controlName: "資訊傳輸", section: "A.5", freq: "Q", role: "SEC", task: "審查資訊傳輸規則與可接受傳輸方式清單", isNew: false },
  { id: "5.14.3", control: "A.5.14", controlName: "資訊傳輸", section: "A.5", freq: "E", role: "ADM", task: "與新外部方建立關係時簽署 NDA 並約定傳輸規範", isNew: false },
  // A.5.15
  { id: "5.15.1", control: "A.5.15", controlName: "存取控制", section: "A.5", freq: "Q", role: "SEC", task: "審查存取控制政策與實施狀況", isNew: false },
  { id: "5.15.2", control: "A.5.15", controlName: "存取控制", section: "A.5", freq: "M", role: "SEC", task: "確認最小權限原則與需知原則落實", isNew: false },
  { id: "5.15.3", control: "A.5.15", controlName: "存取控制", section: "A.5", freq: "Q", role: "SEC", task: "執行存取權限審查（涵蓋實體與邏輯存取）", isNew: false },
  { id: "5.15.4", control: "A.5.15", controlName: "存取控制", section: "A.5", freq: "D", role: "OPS", task: "監控異常存取行為告警", isNew: false },
  // A.5.16
  { id: "5.16.1", control: "A.5.16", controlName: "身分管理", section: "A.5", freq: "M", role: "OPS", task: "審查帳號清單，清理過期或未使用帳號", isNew: false },
  { id: "5.16.2", control: "A.5.16", controlName: "身分管理", section: "A.5", freq: "D", role: "SEC", task: "確認無共用帳號使用", isNew: false },
  { id: "5.16.3", control: "A.5.16", controlName: "身分管理", section: "A.5", freq: "E", role: "OPS", task: "新帳號申請時執行身分驗證程序", isNew: false },
  { id: "5.16.4", control: "A.5.16", controlName: "身分管理", section: "A.5", freq: "E", role: "OPS", task: "人員離職時即時停用帳號", isNew: false },
  // A.5.17
  { id: "5.17.1", control: "A.5.17", controlName: "鑑別資訊", section: "A.5", freq: "A", role: "SEC", task: "審查密碼政策是否符合 NIST SP 800-63B-4 指引", isNew: false },
  { id: "5.17.2", control: "A.5.17", controlName: "鑑別資訊", section: "A.5", freq: "M", role: "OPS", task: "比對已洩漏密碼資料庫，強制更換已洩漏的密碼", isNew: false },
  { id: "5.17.3", control: "A.5.17", controlName: "鑑別資訊", section: "A.5", freq: "Q", role: "SEC", task: "確認 MFA 啟用率達標（目標 100%）", isNew: false },
  { id: "5.17.4", control: "A.5.17", controlName: "鑑別資訊", section: "A.5", freq: "M", role: "DEV", task: "確認密碼以安全雜湊（Argon2id/bcrypt）儲存", isNew: false },
  { id: "5.17.5", control: "A.5.17", controlName: "鑑別資訊", section: "A.5", freq: "A", role: "DIR", task: "評估無密碼驗證方案（Passkeys/FIDO2）的導入進度", isNew: false },
  // A.5.18
  { id: "5.18.1", control: "A.5.18", controlName: "存取權限", section: "A.5", freq: "Q", role: "SEC", task: "執行全面存取權限審查（特別是特權帳號）", isNew: false },
  { id: "5.18.2", control: "A.5.18", controlName: "存取權限", section: "A.5", freq: "E", role: "OPS", task: "人員異動時即時調整權限", isNew: false },
  { id: "5.18.3", control: "A.5.18", controlName: "存取權限", section: "A.5", freq: "M", role: "SEC", task: "審查權限變更的稽核軌跡", isNew: false },
  { id: "5.18.4", control: "A.5.18", controlName: "存取權限", section: "A.5", freq: "Q", role: "SEC", task: "確認 RBAC 角色定義仍符合組織結構", isNew: false },
  // A.5.19
  { id: "5.19.1", control: "A.5.19", controlName: "供應商關係中的資訊安全", section: "A.5", freq: "A", role: "DIR", task: "審查供應商資訊安全政策", isNew: false },
  { id: "5.19.2", control: "A.5.19", controlName: "供應商關係中的資訊安全", section: "A.5", freq: "E", role: "SEC", task: "新供應商引入時執行安全風險評估", isNew: false },
  { id: "5.19.3", control: "A.5.19", controlName: "供應商關係中的資訊安全", section: "A.5", freq: "Q", role: "SEC", task: "確認供應商可接觸的資訊範圍符合最小必要", isNew: false },
  // A.5.20
  { id: "5.20.1", control: "A.5.20", controlName: "供應商協議中的資訊安全考量", section: "A.5", freq: "E", role: "ADM", task: "新合約簽訂時確認已納入安全義務條款", isNew: false },
  { id: "5.20.2", control: "A.5.20", controlName: "供應商協議中的資訊安全考量", section: "A.5", freq: "A", role: "DIR", task: "審查現有供應商合約中的安全條款是否需要更新", isNew: false },
  { id: "5.20.3", control: "A.5.20", controlName: "供應商協議中的資訊安全考量", section: "A.5", freq: "E", role: "ADM", task: "合約終止時確認資料處理程序已執行", isNew: false },
  // A.5.21
  { id: "5.21.1", control: "A.5.21", controlName: "ICT 供應鏈中的資訊安全管理", section: "A.5", freq: "W", role: "DEV", task: "監控已知供應鏈漏洞（Dependabot、SCA）", isNew: false },
  { id: "5.21.2", control: "A.5.21", controlName: "ICT 供應鏈中的資訊安全管理", section: "A.5", freq: "Q", role: "SEC", task: "審查關鍵 ICT 供應商的安全開發實踐", isNew: false },
  { id: "5.21.3", control: "A.5.21", controlName: "ICT 供應鏈中的資訊安全管理", section: "A.5", freq: "M", role: "DEV", task: "確認軟體依賴套件的 SBOM 為最新", isNew: false },
  { id: "5.21.4", control: "A.5.21", controlName: "ICT 供應鏈中的資訊安全管理", section: "A.5", freq: "A", role: "DIR", task: "評估替代供應商計畫", isNew: false },
  // A.5.22
  { id: "5.22.1", control: "A.5.22", controlName: "供應商服務的監控與變更管理", section: "A.5", freq: "Q", role: "SEC", task: "審查供應商安全績效報告（SLA、稽核結果）", isNew: false },
  { id: "5.22.2", control: "A.5.22", controlName: "供應商服務的監控與變更管理", section: "A.5", freq: "E", role: "SEC", task: "供應商服務變更時評估安全影響", isNew: false },
  { id: "5.22.3", control: "A.5.22", controlName: "供應商服務的監控與變更管理", section: "A.5", freq: "A", role: "DIR", task: "重新評估所有供應商的風險等級", isNew: false },
  // A.5.23
  { id: "5.23.1", control: "A.5.23", controlName: "使用雲端服務的資訊安全", section: "A.5", freq: "M", role: "OPS", task: "確認雲端服務使用清單為最新（含影子 IT 掃描）", isNew: true },
  { id: "5.23.2", control: "A.5.23", controlName: "使用雲端服務的資訊安全", section: "A.5", freq: "Q", role: "SEC", task: "審查雲端共同責任模型的落實狀況", isNew: true },
  { id: "5.23.3", control: "A.5.23", controlName: "使用雲端服務的資訊安全", section: "A.5", freq: "Q", role: "OPS", task: "確認雲端資料加密（傳輸中 + 靜態）已啟用", isNew: true },
  { id: "5.23.4", control: "A.5.23", controlName: "使用雲端服務的資訊安全", section: "A.5", freq: "A", role: "DIR", task: "審查雲端服務退出策略與資料可攜性", isNew: true },
  { id: "5.23.5", control: "A.5.23", controlName: "使用雲端服務的資訊安全", section: "A.5", freq: "M", role: "OPS", task: "確認雲端資源的存取控制與日誌記錄正常運作", isNew: true },
  // A.5.24-A.5.37 (condensed)
  { id: "5.24.1", control: "A.5.24", controlName: "資訊安全事件管理規劃與準備", section: "A.5", freq: "A", role: "SEC", task: "審查並更新事件管理政策與程序", isNew: false },
  { id: "5.24.2", control: "A.5.24", controlName: "資訊安全事件管理規劃與準備", section: "A.5", freq: "S", role: "SEC", task: "執行事件回應演練", isNew: false },
  { id: "5.24.3", control: "A.5.24", controlName: "資訊安全事件管理規劃與準備", section: "A.5", freq: "Q", role: "SEC", task: "確認事件回應團隊成員、聯繫清單為最新", isNew: false },
  { id: "5.25.1", control: "A.5.25", controlName: "資訊安全事件的評估與決策", section: "A.5", freq: "E", role: "SEC", task: "安全事件發生時依分類標準評估嚴重度", isNew: false },
  { id: "5.25.2", control: "A.5.25", controlName: "資訊安全事件的評估與決策", section: "A.5", freq: "Q", role: "SEC", task: "審查事件分類標準的有效性", isNew: false },
  { id: "5.26.1", control: "A.5.26", controlName: "資訊安全事件的回應", section: "A.5", freq: "E", role: "SEC", task: "依事件回應計畫執行：遏制→根除→復原", isNew: false },
  { id: "5.26.2", control: "A.5.26", controlName: "資訊安全事件的回應", section: "A.5", freq: "E", role: "DIR", task: "與內外部利害關係人進行溝通", isNew: false },
  { id: "5.27.1", control: "A.5.27", controlName: "從資訊安全事件中學習", section: "A.5", freq: "E", role: "SEC", task: "事件處理後 2 週內完成事後檢討", isNew: false },
  { id: "5.27.2", control: "A.5.27", controlName: "從資訊安全事件中學習", section: "A.5", freq: "Q", role: "DIR", task: "追蹤改進行動的執行狀況", isNew: false },
  { id: "5.28.1", control: "A.5.28", controlName: "證據蒐集", section: "A.5", freq: "E", role: "SEC", task: "事件發生時依程序蒐集數位證據（維持保管鏈）", isNew: false },
  { id: "5.29.1", control: "A.5.29", controlName: "中斷期間的資訊安全", section: "A.5", freq: "S", role: "SEC", task: "確認業務持續計畫已整合資訊安全要求", isNew: false },
  { id: "5.30.1", control: "A.5.30", controlName: "業務持續的 ICT 準備度", section: "A.5", freq: "A", role: "DIR", task: "審查 BIA 結果，確認 RTO/RPO 仍符合業務需求", isNew: true },
  { id: "5.30.2", control: "A.5.30", controlName: "業務持續的 ICT 準備度", section: "A.5", freq: "S", role: "OPS", task: "執行 ICT 災難復原測試", isNew: true },
  { id: "5.30.3", control: "A.5.30", controlName: "業務持續的 ICT 準備度", section: "A.5", freq: "M", role: "OPS", task: "確認備份可用性與復原程序有效", isNew: true },
  { id: "5.31.1", control: "A.5.31", controlName: "法律、法規、規範及契約要求", section: "A.5", freq: "Q", role: "DIR", task: "追蹤法規變更並評估對組織的影響", isNew: false },
  { id: "5.31.2", control: "A.5.31", controlName: "法律、法規、規範及契約要求", section: "A.5", freq: "A", role: "ADM", task: "更新適用法規清冊（個資法、醫療法規等）", isNew: false },
  { id: "5.32.1", control: "A.5.32", controlName: "智慧財產權", section: "A.5", freq: "Q", role: "ADM", task: "盤點軟體授權清冊與合規狀態", isNew: false },
  { id: "5.33.1", control: "A.5.33", controlName: "紀錄保護", section: "A.5", freq: "Q", role: "ADM", task: "確認各類紀錄依保留政策安全儲存", isNew: false },
  { id: "5.33.2", control: "A.5.33", controlName: "紀錄保護", section: "A.5", freq: "M", role: "ADM", task: "執行到期紀錄的安全銷毀程序", isNew: false },
  { id: "5.34.1", control: "A.5.34", controlName: "個人可識別資訊的隱私與保護", section: "A.5", freq: "Q", role: "SEC", task: "確認個資盤點與資料流映射為最新", isNew: false },
  { id: "5.34.2", control: "A.5.34", controlName: "個人可識別資訊的隱私與保護", section: "A.5", freq: "A", role: "DIR", task: "執行或審查資料保護影響評估（DPIA）", isNew: false },
  { id: "5.34.3", control: "A.5.34", controlName: "個人可識別資訊的隱私與保護", section: "A.5", freq: "E", role: "DIR", task: "個資外洩時啟動通報程序", isNew: false },
  { id: "5.35.1", control: "A.5.35", controlName: "資訊安全的獨立審查", section: "A.5", freq: "A", role: "DIR", task: "排程並執行獨立資訊安全審查", isNew: false },
  { id: "5.36.1", control: "A.5.36", controlName: "資訊安全政策的遵循", section: "A.5", freq: "Q", role: "DIR", task: "管理者檢視負責範圍內的安全遵循狀況", isNew: false },
  { id: "5.36.2", control: "A.5.36", controlName: "資訊安全政策的遵循", section: "A.5", freq: "M", role: "SEC", task: "識別並記錄不合規事項", isNew: false },
  { id: "5.37.1", control: "A.5.37", controlName: "文件化的作業程序", section: "A.5", freq: "Q", role: "SEC", task: "審查作業程序文件是否為最新版本", isNew: false },
  { id: "5.37.2", control: "A.5.37", controlName: "文件化的作業程序", section: "A.5", freq: "E", role: "DEV", task: "流程變更時同步更新程序文件", isNew: false },
  // A.6 People Controls
  { id: "6.1.1", control: "A.6.1", controlName: "篩選", section: "A.6", freq: "E", role: "ADM", task: "新進人員聘僱前完成背景查核", isNew: false },
  { id: "6.2.1", control: "A.6.2", controlName: "僱用條款與條件", section: "A.6", freq: "E", role: "ADM", task: "新進人員勞動合約已納入資訊安全責任條款", isNew: false },
  { id: "6.3.1", control: "A.6.3", controlName: "資訊安全意識、教育與訓練", section: "A.6", freq: "A", role: "SEC", task: "執行全員年度資訊安全意識訓練", isNew: false },
  { id: "6.3.2", control: "A.6.3", controlName: "資訊安全意識、教育與訓練", section: "A.6", freq: "E", role: "ADM", task: "新進人員入職時完成安全教育", isNew: false },
  { id: "6.3.3", control: "A.6.3", controlName: "資訊安全意識、教育與訓練", section: "A.6", freq: "Q", role: "SEC", task: "針對開發者、管理員提供專門安全訓練", isNew: false },
  { id: "6.3.4", control: "A.6.3", controlName: "資訊安全意識、教育與訓練", section: "A.6", freq: "Q", role: "SEC", task: "執行社交工程模擬測試（釣魚信測試）", isNew: false },
  { id: "6.4.1", control: "A.6.4", controlName: "懲戒程序", section: "A.6", freq: "A", role: "DIR", task: "確認懲戒程序已文件化並符合勞動法規", isNew: false },
  { id: "6.5.1", control: "A.6.5", controlName: "僱用終止或變更後的責任", section: "A.6", freq: "E", role: "ADM", task: "離職時執行完整離職安全檢核", isNew: false },
  { id: "6.5.2", control: "A.6.5", controlName: "僱用終止或變更後的責任", section: "A.6", freq: "E", role: "OPS", task: "職務變更時調整安全責任與權限", isNew: false },
  { id: "6.6.1", control: "A.6.6", controlName: "保密或不揭露協議", section: "A.6", freq: "E", role: "ADM", task: "接觸機密資訊的人員簽署 NDA", isNew: false },
  { id: "6.6.2", control: "A.6.6", controlName: "保密或不揭露協議", section: "A.6", freq: "Q", role: "ADM", task: "確認所有需簽署 NDA 的人員均已完成簽署", isNew: false },
  { id: "6.7.1", control: "A.6.7", controlName: "遠端工作", section: "A.6", freq: "M", role: "OPS", task: "確認遠端連線安全性（VPN、MFA）", isNew: false },
  { id: "6.7.2", control: "A.6.7", controlName: "遠端工作", section: "A.6", freq: "Q", role: "SEC", task: "審查遠端工作安全政策的落實狀況", isNew: false },
  { id: "6.8.1", control: "A.6.8", controlName: "資訊安全事件通報", section: "A.6", freq: "Q", role: "SEC", task: "確認通報管道暢通且所有人員知悉如何通報", isNew: false },
  { id: "6.8.2", control: "A.6.8", controlName: "資訊安全事件通報", section: "A.6", freq: "M", role: "SEC", task: "審查通報紀錄，確認通報流程運作正常", isNew: false },
  // A.7 Physical Controls
  { id: "7.1.1", control: "A.7.1", controlName: "實體安全邊界", section: "A.7", freq: "Q", role: "OPS", task: "檢查實體安全邊界的完整性", isNew: false },
  { id: "7.2.1", control: "A.7.2", controlName: "實體進入", section: "A.7", freq: "D", role: "OPS", task: "確認門禁控制系統正常運作", isNew: false },
  { id: "7.2.2", control: "A.7.2", controlName: "實體進入", section: "A.7", freq: "M", role: "SEC", task: "審查門禁進出日誌是否有異常", isNew: false },
  { id: "7.2.3", control: "A.7.2", controlName: "實體進入", section: "A.7", freq: "D", role: "ADM", task: "訪客登記、配戴識別證、專人陪同", isNew: false },
  { id: "7.3.1", control: "A.7.3", controlName: "辦公室、房間與設施的安全", section: "A.7", freq: "M", role: "OPS", task: "確認伺服器機房等關鍵設施有額外保護措施", isNew: false },
  { id: "7.4.1", control: "A.7.4", controlName: "實體安全監控", section: "A.7", freq: "D", role: "OPS", task: "確認 CCTV 監控系統持續運作與記錄", isNew: true },
  { id: "7.4.2", control: "A.7.4", controlName: "實體安全監控", section: "A.7", freq: "M", role: "SEC", task: "審查監控覆蓋範圍是否完整", isNew: true },
  { id: "7.5.1", control: "A.7.5", controlName: "環境威脅防護", section: "A.7", freq: "M", role: "OPS", task: "確認消防、防水、溫濕度控制系統正常運作", isNew: false },
  { id: "7.5.2", control: "A.7.5", controlName: "環境威脅防護", section: "A.7", freq: "M", role: "OPS", task: "檢查設備固定與防震措施（台灣地震高風險）", isNew: false },
  { id: "7.6.1", control: "A.7.6", controlName: "安全區域的工作", section: "A.7", freq: "D", role: "SEC", task: "確認安全區域無未授權攝影/錄音裝置", isNew: false },
  { id: "7.7.1", control: "A.7.7", controlName: "桌面淨空與螢幕淨空", section: "A.7", freq: "D", role: "DEV", task: "離開座位時鎖定螢幕、收妥敏感文件", isNew: false },
  { id: "7.7.2", control: "A.7.7", controlName: "桌面淨空與螢幕淨空", section: "A.7", freq: "M", role: "SEC", task: "抽查桌面淨空政策的執行狀況", isNew: false },
  { id: "7.8.1", control: "A.7.8", controlName: "設備安置與保護", section: "A.7", freq: "M", role: "OPS", task: "確認關鍵設備的環境條件在規格範圍內", isNew: false },
  { id: "7.9.1", control: "A.7.9", controlName: "場外資產安全", section: "A.7", freq: "M", role: "OPS", task: "確認場外設備的加密與遠端抹除能力已啟用", isNew: false },
  { id: "7.10.1", control: "A.7.10", controlName: "儲存媒體", section: "A.7", freq: "M", role: "SEC", task: "確認可攜式儲存媒體使用政策落實（USB 限制）", isNew: false },
  { id: "7.11.1", control: "A.7.11", controlName: "支援公用設施", section: "A.7", freq: "M", role: "OPS", task: "測試 UPS 功能與電池狀態", isNew: false },
  { id: "7.11.2", control: "A.7.11", controlName: "支援公用設施", section: "A.7", freq: "D", role: "OPS", task: "監控環境條件（溫度、濕度、電力品質）", isNew: false },
  { id: "7.12.1", control: "A.7.12", controlName: "佈線安全", section: "A.7", freq: "Q", role: "OPS", task: "檢查電力與通訊纜線是否分離布設", isNew: false },
  { id: "7.13.1", control: "A.7.13", controlName: "設備維護", section: "A.7", freq: "M", role: "OPS", task: "依製造商建議時程執行設備維護並記錄", isNew: false },
  { id: "7.14.1", control: "A.7.14", controlName: "設備的安全處置或再利用", section: "A.7", freq: "E", role: "OPS", task: "處置/再利用前安全清除所有敏感資料", isNew: false },
  // A.8 Technological Controls
  { id: "8.1.1", control: "A.8.1", controlName: "使用者端點裝置", section: "A.8", freq: "D", role: "OPS", task: "確認端點保護軟體（EDR/XDR）正常運作與更新", isNew: false },
  { id: "8.1.2", control: "A.8.1", controlName: "使用者端點裝置", section: "A.8", freq: "W", role: "OPS", task: "確認 OS 與應用程式修補為最新", isNew: false },
  { id: "8.1.3", control: "A.8.1", controlName: "使用者端點裝置", section: "A.8", freq: "M", role: "OPS", task: "確認全磁碟加密已在所有端點啟用", isNew: false },
  { id: "8.2.1", control: "A.8.2", controlName: "特權存取權限", section: "A.8", freq: "M", role: "SEC", task: "審查特權帳號清單，確認最小化", isNew: false },
  { id: "8.2.2", control: "A.8.2", controlName: "特權存取權限", section: "A.8", freq: "D", role: "OPS", task: "監控所有特權操作日誌", isNew: false },
  { id: "8.2.3", control: "A.8.2", controlName: "特權存取權限", section: "A.8", freq: "Q", role: "SEC", task: "審查特權帳號的必要性（是否可用 JIT 替代）", isNew: false },
  { id: "8.3.1", control: "A.8.3", controlName: "資訊存取限制", section: "A.8", freq: "Q", role: "SEC", task: "審查應用程式層級的存取控制設定", isNew: false },
  { id: "8.4.1", control: "A.8.4", controlName: "原始碼存取", section: "A.8", freq: "D", role: "DEV", task: "確認 Git 分支保護與 PR 審核規則啟用", isNew: false },
  { id: "8.4.2", control: "A.8.4", controlName: "原始碼存取", section: "A.8", freq: "M", role: "SEC", task: "審查原始碼庫的存取權限與異常存取", isNew: false },
  { id: "8.5.1", control: "A.8.5", controlName: "安全鑑別", section: "A.8", freq: "M", role: "OPS", task: "確認 MFA 在所有關鍵系統啟用", isNew: false },
  { id: "8.5.2", control: "A.8.5", controlName: "安全鑑別", section: "A.8", freq: "A", role: "DIR", task: "評估 FIDO2/WebAuthn 等現代鑑別標準的導入進度", isNew: false },
  { id: "8.6.1", control: "A.8.6", controlName: "容量管理", section: "A.8", freq: "D", role: "OPS", task: "監控系統資源使用率（CPU、記憶體、儲存、網路）", isNew: false },
  { id: "8.6.2", control: "A.8.6", controlName: "容量管理", section: "A.8", freq: "Q", role: "OPS", task: "進行容量規劃，預測未來 3-6 個月需求", isNew: false },
  { id: "8.7.1", control: "A.8.7", controlName: "惡意軟體防護", section: "A.8", freq: "D", role: "OPS", task: "確認防惡意軟體解決方案正常運作與定義更新", isNew: false },
  { id: "8.7.2", control: "A.8.7", controlName: "惡意軟體防護", section: "A.8", freq: "W", role: "SEC", task: "審查惡意軟體偵測與阻擋日誌", isNew: false },
  { id: "8.8.1", control: "A.8.8", controlName: "技術脆弱性管理", section: "A.8", freq: "D", role: "SEC", task: "監控漏洞通報來源（CVE、Dependabot 告警）", isNew: false },
  { id: "8.8.2", control: "A.8.8", controlName: "技術脆弱性管理", section: "A.8", freq: "W", role: "SEC", task: "執行脆弱性掃描並依 CVSS 分級處理", isNew: false },
  { id: "8.8.3", control: "A.8.8", controlName: "技術脆弱性管理", section: "A.8", freq: "W", role: "DEV", task: "追蹤高風險漏洞的修補進度（Critical/High ≤ 7 天）", isNew: false },
  { id: "8.8.4", control: "A.8.8", controlName: "技術脆弱性管理", section: "A.8", freq: "Q", role: "SEC", task: "執行滲透測試", isNew: false },
  { id: "8.9.1", control: "A.8.9", controlName: "組態管理", section: "A.8", freq: "M", role: "OPS", task: "確認安全基準組態已套用至所有系統", isNew: true },
  { id: "8.9.2", control: "A.8.9", controlName: "組態管理", section: "A.8", freq: "W", role: "OPS", task: "監控組態漂移（Drift Detection）", isNew: true },
  { id: "8.9.3", control: "A.8.9", controlName: "組態管理", section: "A.8", freq: "M", role: "DEV", task: "確認 IaC 定義與實際部署一致", isNew: true },
  { id: "8.10.1", control: "A.8.10", controlName: "資訊刪除", section: "A.8", freq: "M", role: "ADM", task: "依保留政策識別並刪除到期資訊", isNew: true },
  { id: "8.10.2", control: "A.8.10", controlName: "資訊刪除", section: "A.8", freq: "E", role: "DEV", task: "收到個資刪除請求時依法處理", isNew: true },
  { id: "8.11.1", control: "A.8.11", controlName: "資料遮蔽", section: "A.8", freq: "M", role: "DEV", task: "確認非正式環境使用遮蔽後的資料", isNew: true },
  { id: "8.12.1", control: "A.8.12", controlName: "資料外洩防護", section: "A.8", freq: "D", role: "SEC", task: "監控 DLP 告警（端點、網路、雲端）", isNew: true },
  { id: "8.12.2", control: "A.8.12", controlName: "資料外洩防護", section: "A.8", freq: "W", role: "SEC", task: "審查 DLP 攔截事件並調整規則", isNew: true },
  { id: "8.13.1", control: "A.8.13", controlName: "資訊備份", section: "A.8", freq: "D", role: "OPS", task: "確認備份作業成功完成", isNew: false },
  { id: "8.13.2", control: "A.8.13", controlName: "資訊備份", section: "A.8", freq: "M", role: "OPS", task: "驗證備份可還原性（隨機抽樣還原測試）", isNew: false },
  { id: "8.14.1", control: "A.8.14", controlName: "資訊處理設施的冗餘", section: "A.8", freq: "Q", role: "OPS", task: "執行故障轉移（Failover）測試", isNew: false },
  { id: "8.15.1", control: "A.8.15", controlName: "日誌記錄", section: "A.8", freq: "D", role: "OPS", task: "確認集中式日誌管理（SIEM）正常接收日誌", isNew: false },
  { id: "8.15.2", control: "A.8.15", controlName: "日誌記錄", section: "A.8", freq: "W", role: "SEC", task: "執行日誌異常告警審查", isNew: false },
  { id: "8.16.1", control: "A.8.16", controlName: "監控活動", section: "A.8", freq: "D", role: "OPS", task: "監控安全告警（SIEM、EDR、NDR）", isNew: true },
  { id: "8.16.2", control: "A.8.16", controlName: "監控活動", section: "A.8", freq: "D", role: "SEC", task: "處理高優先級告警", isNew: true },
  { id: "8.17.1", control: "A.8.17", controlName: "時鐘同步", section: "A.8", freq: "M", role: "OPS", task: "確認所有系統同步至統一 NTP 時間源", isNew: false },
  { id: "8.18.1", control: "A.8.18", controlName: "特權公用程式的使用", section: "A.8", freq: "D", role: "OPS", task: "記錄特權公用程式的使用", isNew: false },
  { id: "8.19.1", control: "A.8.19", controlName: "作業系統上的軟體安裝", section: "A.8", freq: "W", role: "OPS", task: "監控未經授權的軟體安裝", isNew: false },
  { id: "8.20.1", control: "A.8.20", controlName: "網路安全", section: "A.8", freq: "D", role: "OPS", task: "監控網路流量以偵測異常", isNew: false },
  { id: "8.20.2", control: "A.8.20", controlName: "網路安全", section: "A.8", freq: "M", role: "OPS", task: "審查防火牆與 ACL 規則", isNew: false },
  { id: "8.21.1", control: "A.8.21", controlName: "網路服務的安全", section: "A.8", freq: "M", role: "OPS", task: "確認網路服務的鑑別與加密機制正常運作", isNew: false },
  { id: "8.22.1", control: "A.8.22", controlName: "網路區隔", section: "A.8", freq: "M", role: "OPS", task: "確認網路區隔與開發/測試/正式環境隔離正常", isNew: false },
  { id: "8.23.1", control: "A.8.23", controlName: "網頁過濾", section: "A.8", freq: "D", role: "OPS", task: "確認網頁過濾解決方案正常運作", isNew: true },
  { id: "8.23.2", control: "A.8.23", controlName: "網頁過濾", section: "A.8", freq: "W", role: "SEC", task: "審查網頁存取日誌中的異常行為", isNew: true },
  { id: "8.24.1", control: "A.8.24", controlName: "密碼學的使用", section: "A.8", freq: "Q", role: "SEC", task: "確認加密演算法與金鑰長度符合標準", isNew: false },
  { id: "8.24.2", control: "A.8.24", controlName: "密碼學的使用", section: "A.8", freq: "M", role: "DEV", task: "確認 TLS 1.2+ 用於所有敏感通訊", isNew: false },
  { id: "8.25.1", control: "A.8.25", controlName: "安全開發生命週期", section: "A.8", freq: "D", role: "DEV", task: "確認 CI/CD 管線中的安全檢查（SAST、SCA）正常運作", isNew: false },
  { id: "8.25.2", control: "A.8.25", controlName: "安全開發生命週期", section: "A.8", freq: "W", role: "DEV", task: "執行安全程式碼審查（手動 + 自動化）", isNew: false },
  { id: "8.25.3", control: "A.8.25", controlName: "安全開發生命週期", section: "A.8", freq: "S", role: "SEC", task: "執行 DAST 與滲透測試", isNew: false },
  { id: "8.26.1", control: "A.8.26", controlName: "應用程式安全要求", section: "A.8", freq: "E", role: "DEV", task: "新功能需求階段識別安全需求", isNew: false },
  { id: "8.26.2", control: "A.8.26", controlName: "應用程式安全要求", section: "A.8", freq: "Q", role: "SEC", task: "審查 OWASP Top 10 風險的防範狀況", isNew: false },
  { id: "8.27.1", control: "A.8.27", controlName: "安全系統架構與工程原則", section: "A.8", freq: "A", role: "DIR", task: "審查並更新安全架構原則（最小權限、縱深防禦、零信任）", isNew: false },
  { id: "8.28.1", control: "A.8.28", controlName: "安全程式碼撰寫", section: "A.8", freq: "D", role: "DEV", task: "確認 SAST（Semgrep/CodeQL）在 CI 中正常執行", isNew: true },
  { id: "8.28.2", control: "A.8.28", controlName: "安全程式碼撰寫", section: "A.8", freq: "D", role: "DEV", task: "確認 secret detection（Gitleaks/detect-secrets）在 CI 中正常執行", isNew: true },
  { id: "8.28.3", control: "A.8.28", controlName: "安全程式碼撰寫", section: "A.8", freq: "W", role: "DEV", task: "審查並修復 SAST 發現的問題", isNew: true },
  { id: "8.28.4", control: "A.8.28", controlName: "安全程式碼撰寫", section: "A.8", freq: "W", role: "DEV", task: "審查 SCA（Dependabot）發現的依賴套件漏洞", isNew: true },
  { id: "8.29.1", control: "A.8.29", controlName: "開發與驗收中的安全測試", section: "A.8", freq: "D", role: "DEV", task: "確認 CI/CD 自動化安全測試通過", isNew: false },
  { id: "8.29.2", control: "A.8.29", controlName: "開發與驗收中的安全測試", section: "A.8", freq: "E", role: "SEC", task: "重大版本發佈前執行滲透測試", isNew: false },
  { id: "8.30.1", control: "A.8.30", controlName: "委外開發", section: "A.8", freq: "E", role: "DIR", task: "委外合約中定義安全需求與標準", isNew: false },
  { id: "8.31.1", control: "A.8.31", controlName: "開發、測試與正式環境的分離", section: "A.8", freq: "D", role: "OPS", task: "確認開發/測試/Staging/正式環境嚴格分離", isNew: false },
  { id: "8.31.2", control: "A.8.31", controlName: "開發、測試與正式環境的分離", section: "A.8", freq: "M", role: "SEC", task: "確認開發人員無正式環境的直接存取", isNew: false },
  { id: "8.32.1", control: "A.8.32", controlName: "變更管理", section: "A.8", freq: "E", role: "DEV", task: "所有變更依正式流程執行（申請→核准→實施→驗證）", isNew: false },
  { id: "8.32.2", control: "A.8.32", controlName: "變更管理", section: "A.8", freq: "E", role: "SEC", task: "變更實施前評估安全影響", isNew: false },
  { id: "8.33.1", control: "A.8.33", controlName: "測試資訊", section: "A.8", freq: "M", role: "DEV", task: "確認測試環境不使用含個資的正式資料", isNew: false },
  { id: "8.34.1", control: "A.8.34", controlName: "稽核測試期間資訊系統的保護", section: "A.8", freq: "E", role: "DIR", task: "與稽核人員協調測試時程", isNew: false },
  { id: "8.34.2", control: "A.8.34", controlName: "稽核測試期間資訊系統的保護", section: "A.8", freq: "E", role: "OPS", task: "稽核完成後移除測試帳號與工具", isNew: false },
];

const FREQ_ORDER = { D: 0, W: 1, M: 2, Q: 3, S: 4, A: 5, E: 6 };

function FilterChip({ active, onClick, children, color }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "6px 14px",
        borderRadius: "20px",
        border: active ? `2px solid ${color || "#a3e635"}` : "1px solid rgba(255,255,255,0.12)",
        background: active ? `${color || "#a3e635"}18` : "rgba(255,255,255,0.04)",
        color: active ? (color || "#a3e635") : "rgba(255,255,255,0.55)",
        cursor: "pointer",
        fontSize: "13px",
        fontWeight: active ? 600 : 400,
        transition: "all 0.2s",
        whiteSpace: "nowrap",
        fontFamily: "'JetBrains Mono', monospace",
      }}
    >
      {children}
    </button>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: "10px",
      padding: "14px 18px",
      minWidth: "100px",
      textAlign: "center",
    }}>
      <div style={{ fontSize: "28px", fontWeight: 700, color, fontFamily: "'JetBrains Mono', monospace" }}>{value}</div>
      <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</div>
    </div>
  );
}

export default function App() {
  const [checkedItems, setCheckedItems] = useState({});
  const [selectedRoles, setSelectedRoles] = useState(new Set());
  const [selectedFreqs, setSelectedFreqs] = useState(new Set());
  const [selectedSections, setSelectedSections] = useState(new Set());
  const [showNewOnly, setShowNewOnly] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [expandedControls, setExpandedControls] = useState(new Set());
  const [showRolePanel, setShowRolePanel] = useState(false);

  // Load checked state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("iso27001-checks");
      if (saved) setCheckedItems(JSON.parse(saved));
    } catch {}
  }, []);

  const saveChecks = useCallback((newChecks) => {
    try { localStorage.setItem("iso27001-checks", JSON.stringify(newChecks)); } catch {}
  }, []);

  const toggleCheck = useCallback((id) => {
    setCheckedItems(prev => {
      const next = { ...prev, [id]: prev[id] ? undefined : new Date().toISOString() };
      if (!next[id]) delete next[id];
      saveChecks(next);
      return next;
    });
  }, [saveChecks]);

  const toggleFilter = useCallback((set, setter, value) => {
    setter(prev => {
      const next = new Set(prev);
      next.has(value) ? next.delete(value) : next.add(value);
      return next;
    });
  }, []);

  const filteredData = useMemo(() => {
    return CHECKLIST_DATA.filter(item => {
      if (selectedRoles.size && !selectedRoles.has(item.role)) return false;
      if (selectedFreqs.size && !selectedFreqs.has(item.freq)) return false;
      if (selectedSections.size && !selectedSections.has(item.section)) return false;
      if (showNewOnly && !item.isNew) return false;
      if (searchText) {
        const s = searchText.toLowerCase();
        if (!item.task.toLowerCase().includes(s) && !item.control.toLowerCase().includes(s) && !item.controlName.toLowerCase().includes(s)) return false;
      }
      return true;
    });
  }, [selectedRoles, selectedFreqs, selectedSections, showNewOnly, searchText]);

  const grouped = useMemo(() => {
    const map = {};
    filteredData.forEach(item => {
      if (!map[item.control]) map[item.control] = { control: item.control, controlName: item.controlName, section: item.section, isNew: item.isNew, items: [] };
      map[item.control].items.push(item);
    });
    return Object.values(map).sort((a, b) => {
      const [, aN] = a.control.split(".");
      const [, bN] = b.control.split(".");
      return parseFloat(aN) - parseFloat(bN);
    });
  }, [filteredData]);

  const stats = useMemo(() => {
    const total = filteredData.length;
    const checked = filteredData.filter(i => checkedItems[i.id]).length;
    const byFreq = {};
    FREQUENCIES.forEach(f => { byFreq[f.id] = filteredData.filter(i => i.freq === f.id).length; });
    return { total, checked, byFreq };
  }, [filteredData, checkedItems]);

  const clearFilters = () => {
    setSelectedRoles(new Set());
    setSelectedFreqs(new Set());
    setSelectedSections(new Set());
    setShowNewOnly(false);
    setSearchText("");
  };

  const hasFilters = selectedRoles.size || selectedFreqs.size || selectedSections.size || showNewOnly || searchText;

  const roleMap = Object.fromEntries(ROLES.map(r => [r.id, r]));
  const freqMap = Object.fromEntries(FREQUENCIES.map(f => [f.id, f]));

  const toggleAllInControl = (controlKey) => {
    const items = grouped.find(g => g.control === controlKey)?.items || [];
    const allChecked = items.every(i => checkedItems[i.id]);
    setCheckedItems(prev => {
      const next = { ...prev };
      items.forEach(i => {
        if (allChecked) { delete next[i.id]; } else { next[i.id] = new Date().toISOString(); }
      });
      saveChecks(next);
      return next;
    });
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0f",
      color: "#e4e4e7",
      fontFamily: "'Noto Sans TC', 'Inter', sans-serif",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "24px 28px 20px",
        background: "linear-gradient(180deg, rgba(163,230,53,0.03) 0%, transparent 100%)",
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
          <h1 style={{
            fontSize: "22px",
            fontWeight: 700,
            margin: 0,
            background: "linear-gradient(135deg, #a3e635, #4ade80)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            ISO 27001:2022
          </h1>
          <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)", fontWeight: 300 }}>Annex A 團隊日常作業檢核表</span>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
          <StatCard label="顯示項目" value={stats.total} color="#a3e635" />
          <StatCard label="已完成" value={stats.checked} color="#4ade80" />
          <StatCard label="完成率" value={stats.total ? `${Math.round(stats.checked / stats.total * 100)}%` : "—"} color={stats.total && stats.checked / stats.total > 0.8 ? "#4ade80" : "#f59e0b"} />
          <StatCard label="待處理" value={stats.total - stats.checked} color="#f87171" />
        </div>
      </div>

      {/* Role Reference Panel */}
      <div style={{
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(255,255,255,0.015)",
      }}>
        <button
          onClick={() => setShowRolePanel(!showRolePanel)}
          style={{
            width: "100%",
            padding: "12px 28px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.5)",
            cursor: "pointer",
            fontSize: "13px",
            fontFamily: "'JetBrains Mono', monospace",
            textAlign: "left",
          }}
        >
          <span style={{
            transform: showRolePanel ? "rotate(90deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
            fontSize: "11px",
          }}>▶</span>
          <span style={{ fontWeight: 600 }}>角色定義與職責分工</span>
          <span style={{ fontSize: "11px", opacity: 0.6 }}>（{ROLES.length} 個角色）</span>
        </button>

        {showRolePanel && (
          <div style={{ padding: "0 28px 20px", overflowX: "auto" }}>
            <table style={{
              width: "100%",
              borderCollapse: "separate",
              borderSpacing: 0,
              fontSize: "13px",
              borderRadius: "8px",
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.08)",
            }}>
              <thead>
                <tr>
                  {["代碼", "角色", "職責範圍", "建議人選", "項目數"].map((h, i) => (
                    <th key={i} style={{
                      padding: "10px 14px",
                      textAlign: "left",
                      background: "rgba(255,255,255,0.04)",
                      color: "rgba(255,255,255,0.5)",
                      fontWeight: 600,
                      fontSize: "11px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      borderBottom: "1px solid rgba(255,255,255,0.08)",
                      fontFamily: "'JetBrains Mono', monospace",
                      whiteSpace: "nowrap",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROLES.map((r, idx) => {
                  const roleCount = filteredData.filter(i => i.role === r.id).length;
                  const roleChecked = filteredData.filter(i => i.role === r.id && checkedItems[i.id]).length;
                  return (
                    <tr key={r.id} style={{ borderBottom: idx < ROLES.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                      <td style={{
                        padding: "12px 14px",
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                      }}>
                        <span style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "4px 10px",
                          borderRadius: "6px",
                          background: `${r.color}15`,
                          border: `1px solid ${r.color}30`,
                          color: r.color,
                          fontFamily: "'JetBrains Mono', monospace",
                          fontWeight: 700,
                          fontSize: "13px",
                        }}>
                          {r.emoji} {r.label}
                        </span>
                      </td>
                      <td style={{
                        padding: "12px 14px",
                        color: "rgba(255,255,255,0.85)",
                        fontWeight: 500,
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                        whiteSpace: "nowrap",
                      }}>{r.full}</td>
                      <td style={{
                        padding: "12px 14px",
                        color: "rgba(255,255,255,0.6)",
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                        lineHeight: 1.5,
                        maxWidth: "300px",
                      }}>{r.scope}</td>
                      <td style={{
                        padding: "12px 14px",
                        color: "rgba(255,255,255,0.5)",
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                        fontStyle: "italic",
                        whiteSpace: "nowrap",
                      }}>{r.suggest}</td>
                      <td style={{
                        padding: "12px 14px",
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                        fontFamily: "'JetBrains Mono', monospace",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ color: r.color, fontWeight: 700 }}>{roleCount}</span>
                          <div style={{
                            width: 40,
                            height: 4,
                            borderRadius: 2,
                            background: "rgba(255,255,255,0.08)",
                            overflow: "hidden",
                          }}>
                            <div style={{
                              width: roleCount ? `${(roleChecked / roleCount) * 100}%` : "0%",
                              height: "100%",
                              background: r.color,
                              borderRadius: 2,
                              transition: "width 0.3s",
                            }} />
                          </div>
                          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>{roleChecked}/{roleCount}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Filters */}
      <div style={{
        padding: "16px 28px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(255,255,255,0.01)",
      }}>
        {/* Search */}
        <div style={{ marginBottom: 14 }}>
          <input
            type="text"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            placeholder="搜尋控制項目或任務描述..."
            style={{
              width: "100%",
              padding: "10px 16px",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.04)",
              color: "#e4e4e7",
              fontSize: "14px",
              outline: "none",
              fontFamily: "'Noto Sans TC', sans-serif",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Role filters */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "1px", fontFamily: "'JetBrains Mono', monospace" }}>角色</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {ROLES.map(r => (
              <FilterChip key={r.id} active={selectedRoles.has(r.id)} onClick={() => toggleFilter(selectedRoles, setSelectedRoles, r.id)} color={r.color}>
                {r.emoji} {r.label}
              </FilterChip>
            ))}
          </div>
        </div>

        {/* Frequency filters */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "1px", fontFamily: "'JetBrains Mono', monospace" }}>頻率</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {FREQUENCIES.map(f => (
              <FilterChip key={f.id} active={selectedFreqs.has(f.id)} onClick={() => toggleFilter(selectedFreqs, setSelectedFreqs, f.id)} color={f.color}>
                {f.emoji} {f.label}
              </FilterChip>
            ))}
          </div>
        </div>

        {/* Section filters */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "1px", fontFamily: "'JetBrains Mono', monospace" }}>控制域</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {SECTIONS.map(s => (
              <FilterChip key={s.id} active={selectedSections.has(s.id)} onClick={() => toggleFilter(selectedSections, setSelectedSections, s.id)} color="#a3e635">
                {s.label}
              </FilterChip>
            ))}
            <FilterChip active={showNewOnly} onClick={() => setShowNewOnly(!showNewOnly)} color="#f472b6">
              🆕 僅新增項目
            </FilterChip>
          </div>
        </div>

        {hasFilters && (
          <button onClick={clearFilters} style={{
            marginTop: 6,
            padding: "6px 14px",
            borderRadius: "6px",
            border: "1px solid rgba(239,68,68,0.3)",
            background: "rgba(239,68,68,0.08)",
            color: "#f87171",
            cursor: "pointer",
            fontSize: "12px",
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            清除所有篩選
          </button>
        )}
      </div>

      {/* Checklist */}
      <div style={{ padding: "16px 28px 60px" }}>
        {grouped.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, color: "rgba(255,255,255,0.3)" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <div>沒有符合篩選條件的項目</div>
          </div>
        ) : (
          grouped.map(group => {
            const allChecked = group.items.every(i => checkedItems[i.id]);
            const someChecked = group.items.some(i => checkedItems[i.id]);
            const checkedCount = group.items.filter(i => checkedItems[i.id]).length;

            return (
              <div key={group.control} style={{
                marginBottom: 8,
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.06)",
                background: "rgba(255,255,255,0.02)",
                overflow: "hidden",
              }}>
                {/* Control header */}
                <div
                  onClick={() => {
                    setExpandedControls(prev => {
                      const next = new Set(prev);
                      next.has(group.control) ? next.delete(group.control) : next.add(group.control);
                      return next;
                    });
                  }}
                  style={{
                    padding: "12px 16px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    background: allChecked ? "rgba(74,222,128,0.06)" : "transparent",
                    transition: "background 0.2s",
                  }}
                >
                  <span style={{
                    fontSize: "12px",
                    color: "rgba(255,255,255,0.3)",
                    transform: expandedControls.has(group.control) ? "rotate(90deg)" : "rotate(0deg)",
                    transition: "transform 0.2s",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>▶</span>

                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#a3e635",
                    minWidth: "52px",
                  }}>{group.control}</span>

                  <span style={{ fontSize: "14px", fontWeight: 500, flex: 1 }}>
                    {group.controlName}
                    {group.isNew && <span style={{ marginLeft: 6, fontSize: "11px" }}>🆕</span>}
                  </span>

                  {/* Progress */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{
                      width: 50,
                      height: 4,
                      borderRadius: 2,
                      background: "rgba(255,255,255,0.08)",
                      overflow: "hidden",
                    }}>
                      <div style={{
                        width: `${(checkedCount / group.items.length) * 100}%`,
                        height: "100%",
                        background: allChecked ? "#4ade80" : someChecked ? "#f59e0b" : "transparent",
                        borderRadius: 2,
                        transition: "width 0.3s",
                      }} />
                    </div>
                    <span style={{
                      fontSize: "11px",
                      color: "rgba(255,255,255,0.35)",
                      fontFamily: "'JetBrains Mono', monospace",
                      minWidth: "30px",
                    }}>{checkedCount}/{group.items.length}</span>
                  </div>
                </div>

                {/* Items */}
                {expandedControls.has(group.control) && (
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                    {group.items.map(item => {
                      const role = roleMap[item.role];
                      const freq = freqMap[item.freq];
                      const isChecked = !!checkedItems[item.id];
                      return (
                        <div
                          key={item.id}
                          onClick={() => toggleCheck(item.id)}
                          style={{
                            padding: "10px 16px 10px 42px",
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 10,
                            cursor: "pointer",
                            borderBottom: "1px solid rgba(255,255,255,0.03)",
                            background: isChecked ? "rgba(74,222,128,0.03)" : "transparent",
                            transition: "background 0.15s",
                          }}
                        >
                          {/* Checkbox */}
                          <div style={{
                            width: 18,
                            height: 18,
                            borderRadius: 4,
                            border: isChecked ? "2px solid #4ade80" : "1.5px solid rgba(255,255,255,0.2)",
                            background: isChecked ? "#4ade8020" : "transparent",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            marginTop: 1,
                            transition: "all 0.15s",
                          }}>
                            {isChecked && <span style={{ color: "#4ade80", fontSize: 12, fontWeight: 700 }}>✓</span>}
                          </div>

                          {/* Freq badge */}
                          <span style={{
                            fontSize: "11px",
                            padding: "2px 8px",
                            borderRadius: "10px",
                            background: `${freq.color}15`,
                            color: freq.color,
                            fontFamily: "'JetBrains Mono', monospace",
                            fontWeight: 600,
                            flexShrink: 0,
                            border: `1px solid ${freq.color}25`,
                          }}>
                            {freq.emoji} {freq.label}
                          </span>

                          {/* Role badge */}
                          <span style={{
                            fontSize: "11px",
                            padding: "2px 8px",
                            borderRadius: "10px",
                            background: `${role.color}15`,
                            color: role.color,
                            fontFamily: "'JetBrains Mono', monospace",
                            fontWeight: 600,
                            flexShrink: 0,
                            border: `1px solid ${role.color}25`,
                          }}>
                            {role.emoji} {role.label}
                          </span>

                          {/* Task */}
                          <span style={{
                            fontSize: "13px",
                            lineHeight: 1.5,
                            color: isChecked ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.8)",
                            textDecoration: isChecked ? "line-through" : "none",
                            transition: "all 0.15s",
                          }}>
                            {item.task}
                          </span>
                        </div>
                      );
                    })}

                    {/* Batch action */}
                    <div style={{ padding: "8px 16px 8px 42px" }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleAllInControl(group.control); }}
                        style={{
                          fontSize: "11px",
                          color: "rgba(255,255,255,0.3)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: "4px 0",
                          fontFamily: "'JetBrains Mono', monospace",
                        }}
                      >
                        {allChecked ? "↩ 全部取消" : "✓ 全部完成"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
