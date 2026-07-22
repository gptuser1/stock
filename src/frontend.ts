export function renderFrontend(): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>基金估值助手</title>
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<style>
:root {
  --bg: #f0f2f5;
  --card: #ffffff;
  --primary: #4f46e5;
  --primary-hover: #4338ca;
  --primary-light: #eef2ff;
  --danger: #ef4444;
  --danger-hover: #dc2626;
  --text: #1e293b;
  --text-secondary: #64748b;
  --text-muted: #94a3b8;
  --border: #e2e8f0;
  --bar-bg: rgba(255,255,255,0.95);
  --shadow: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
  --shadow-lg: 0 4px 24px rgba(0,0,0,0.08);
  --up: #ef4444;
  --down: #22c55e;
  --input-bg: #f0f2f5;
  --tag-bg: #f1f5f9;
  --success-bg: #f0fdf4;
  --success-border: #bbf7d0;
  --success-text: #16a34a;
  --error-bg: #fef2f2;
  --error-border: #fecaca;
  --loading-bg: #eef2ff;
  --loading-border: #c7d2fe;
  --overlay: rgba(0,0,0,0.5);
  --toast-bg: #1e293b;
  --toast-text: #f8fafc;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #0f172a;
    --card: #1e293b;
    --primary: #818cf8;
    --primary-hover: #6366f1;
    --primary-light: #1e1b4b;
    --danger: #f87171;
    --danger-hover: #ef4444;
    --text: #e2e8f0;
    --text-secondary: #94a3b8;
    --text-muted: #64748b;
    --border: #334155;
    --bar-bg: rgba(15,23,42,0.95);
    --shadow: 0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2);
    --shadow-lg: 0 4px 24px rgba(0,0,0,0.4);
    --up: #f87171;
    --down: #4ade80;
    --input-bg: #1e293b;
    --tag-bg: #334155;
    --success-bg: #052e16;
    --success-border: #166534;
    --success-text: #4ade80;
    --error-bg: #450a0a;
    --error-border: #991b1b;
    --loading-bg: #1e1b4b;
    --loading-border: #3730a3;
    --overlay: rgba(0,0,0,0.7);
    --toast-bg: #f1f5f9;
    --toast-text: #0f172a;
  }
}

* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif; background: var(--bg); color: var(--text); line-height: 1.5; transition: background 0.3s, color 0.3s; }
input, select, button { font-family: inherit; }

/* ─── Toast ─── */
.toast-container {
  position: fixed; top: 80px; right: 20px; z-index: 999;
  display: flex; flex-direction: column; gap: 8px; pointer-events: none;
}
.toast {
  padding: 12px 20px; border-radius: 10px; font-size: 14px; font-weight: 500;
  box-shadow: var(--shadow-lg); pointer-events: auto; max-width: 380px;
  animation: toastIn 0.3s ease; display: flex; align-items: center; gap: 8px;
  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
}
.toast.success { background: var(--success-bg); border: 1px solid var(--success-border); color: var(--success-text); }
.toast.error { background: var(--error-bg); border: 1px solid var(--error-border); color: var(--danger); }
.toast.info { background: var(--loading-bg); border: 1px solid var(--loading-border); color: var(--primary); }
.toast-out { animation: toastOut 0.3s ease forwards; }
@keyframes toastIn { from { opacity: 0; transform: translateX(40px) scale(0.95); } to { opacity: 1; transform: translateX(0) scale(1); } }
@keyframes toastOut { from { opacity: 1; transform: translateX(0) scale(1); } to { opacity: 0; transform: translateX(40px) scale(0.95); } }

/* ─── 令牌栏 ─── */
.token-bar {
  background: var(--bar-bg);
  border-bottom: 1px solid var(--border);
  padding: 14px 24px;
  position: sticky; top: 0; z-index: 100;
  display: flex; align-items: center; gap: 16px;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: background 0.3s, border-color 0.3s;
}
.token-bar .logo { font-size: 20px; font-weight: 700; color: var(--primary); display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
.token-bar .logo span { font-size: 22px; }
.token-bar .token-group { display: flex; align-items: center; gap: 8px; flex: 1; }
.token-bar .token-group input {
  flex: 1; padding: 9px 14px; border: 1px solid var(--border); border-radius: 8px;
  font-size: 14px; outline: none; transition: border-color 0.2s, background 0.3s; background: var(--input-bg); color: var(--text);
  min-width: 0;
}
.token-bar .token-group input:focus { border-color: var(--primary); }
.token-bar .token-group .btn-verify {
  padding: 9px 28px; border: none; border-radius: 8px; font-size: 14px; font-weight: 500;
  cursor: pointer; background: var(--primary); color: #fff; transition: background 0.2s, opacity 0.2s; white-space: nowrap; flex-shrink: 0; min-width: 88px;
}
.token-bar .token-group .btn-verify:hover:not(:disabled) { background: var(--primary-hover); }
.token-bar .token-group .btn-verify:disabled { opacity: 0.6; cursor: not-allowed; }
.token-bar .token-group .btn-verify.ok { background: var(--success-text); }
.token-bar .token-group .btn-verify.ok:hover:not(:disabled) { background: var(--success-text); filter: brightness(0.92); }
.token-bar .token-group .btn-verify.err { background: var(--danger); }
.token-bar .token-group .btn-verify.err:hover:not(:disabled) { background: var(--danger-hover); }
.token-bar .token-group .btn-verify.loading { background: var(--primary); opacity: 0.75; }

/* ─── 容器 ─── */
.container { max-width: 920px; margin: 0 auto; padding: 24px 20px 60px; display: none; }
.container.active { display: block; }

/* ─── 头部 ─── */
.header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
.header h1 { font-size: 24px; font-weight: 700; }
.header-actions { display: flex; gap: 8px; flex-wrap: wrap; }
.btn {
  padding: 9px 18px; border: none; border-radius: 8px; font-size: 14px; font-weight: 500;
  cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; gap: 6px; justify-content: center;
}
.btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none !important; box-shadow: none !important; }
.btn-primary { background: var(--primary); color: #fff; }
.btn-primary:hover:not(:disabled) { background: var(--primary-hover); transform: translateY(-1px); box-shadow: 0 2px 8px rgba(79,70,229,0.3); }
.btn-outline { background: var(--card); color: var(--text); border: 1px solid var(--border); }
.btn-outline:hover:not(:disabled) { background: var(--bg); border-color: var(--text-muted); }
.btn-danger { background: var(--danger); color: #fff; }
.btn-danger:hover:not(:disabled) { background: var(--danger-hover); }
.btn-sm { padding: 5px 12px; font-size: 12px; }
.btn-add-row { padding: 4px 12px; font-size: 12px; }

/* ─── 刷新状态 ─── */
.refresh-status {
  padding: 12px 16px; border-radius: 8px; font-size: 14px; margin-bottom: 20px; display: none;
  animation: fadeIn 0.3s ease;
}
.refresh-status.show { display: flex; align-items: center; gap: 8px; }
.refresh-status.success { background: var(--success-bg); border: 1px solid var(--success-border); color: var(--success-text); }
.refresh-status.error { background: var(--error-bg); border: 1px solid var(--error-border); color: var(--danger); }
.refresh-status.loading { background: var(--loading-bg); border: 1px solid var(--loading-border); color: var(--primary); }

/* ─── 加载骨架屏 ─── */
.skeleton { animation: pulse 1.5s ease-in-out infinite; }
.skeleton-card {
  background: var(--card); border-radius: 12px; padding: 20px; margin-bottom: 12px;
  box-shadow: var(--shadow);
}
.skeleton-line { height: 14px; border-radius: 6px; background: var(--input-bg); margin-bottom: 10px; }
.skeleton-line.w60 { width: 60%; }
.skeleton-line.w40 { width: 40%; }
.skeleton-line.w80 { width: 80%; }
.skeleton-line.w20 { width: 20%; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

@keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }

/* ─── 空状态 ─── */
.empty-state { text-align: center; padding: 80px 20px; }
.empty-state .icon { font-size: 48px; margin-bottom: 16px; opacity: 0.35; }
.empty-state p { font-size: 16px; color: var(--text-muted); margin-bottom: 8px; }
.empty-state .sub { font-size: 13px; color: var(--text-muted); opacity: 0.6; }

/* ─── 基金卡片 ─── */
.fund-card {
  background: var(--card); border-radius: 12px; padding: 20px; margin-bottom: 12px;
  box-shadow: var(--shadow); transition: box-shadow 0.2s, transform 0.2s, background 0.3s;
  animation: fadeIn 0.3s ease;
}
.fund-card:hover { box-shadow: var(--shadow-lg); transform: translateY(-1px); }
.fund-card-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; }
.fund-info { flex: 1; min-width: 0; }
.fund-name { font-size: 17px; font-weight: 600; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.fund-name .tag { font-size: 11px; font-weight: 500; padding: 2px 8px; border-radius: 10px; background: var(--primary-light); color: var(--primary); transition: background 0.3s; }
.fund-code-text { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
.fund-change-wrap { text-align: right; flex-shrink: 0; }
.fund-change { font-size: 26px; font-weight: 700; letter-spacing: -0.5px; }
.fund-change.up { color: var(--up); }
.fund-change.down { color: var(--down); }
.fund-change.flat { color: var(--text-muted); }
.fund-time { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
.fund-divider { height: 1px; background: var(--border); margin: 14px 0; transition: background 0.3s; }
.fund-bottom { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; }
.holdings-preview { font-size: 13px; color: var(--text-secondary); line-height: 1.6; flex: 1; min-width: 0; }
.holdings-preview .stock-tag { display: inline-block; background: var(--tag-bg); padding: 2px 8px; border-radius: 4px; margin: 2px 3px; font-size: 12px; transition: background 0.3s; }
.fund-actions { display: flex; gap: 6px; flex-shrink: 0; }
.btn-detail { flex-shrink: 0; }

/* ─── 模态框 ─── */
.modal-overlay {
  display: none; position: fixed; inset: 0; background: var(--overlay); z-index: 200;
  justify-content: center; align-items: flex-start; padding: 40px 16px;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}
.modal-overlay.show { display: flex; }
.modal {
  background: var(--card); border-radius: 12px; padding: 28px; width: 100%; max-width: 660px;
  max-height: 85vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.15);
  animation: modalIn 0.25s ease; transition: background 0.3s;
}
@keyframes modalIn { from { opacity: 0; transform: scale(0.96) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
.modal-close { float: right; background: none; border: none; font-size: 22px; cursor: pointer; color: var(--text-muted); padding: 4px; line-height: 1; transition: color 0.2s; }
.modal-close:hover { color: var(--text); }
.modal h2 { font-size: 19px; font-weight: 700; margin-bottom: 20px; }

.form-group { margin-bottom: 16px; }
.form-group label { display: block; font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 5px; }
.form-group input, .form-group select {
  width: 100%; padding: 9px 12px; border: 1px solid var(--border); border-radius: 8px;
  font-size: 14px; outline: none; transition: border-color 0.2s, background 0.3s; background: var(--input-bg); color: var(--text);
}
.form-group input:focus, .form-group select:focus { border-color: var(--primary); background: var(--card); }
.form-group .field-error { border-color: var(--danger) !important; }
.form-group .error-text { font-size: 12px; color: var(--danger); margin-top: 3px; display: none; }
.form-group .error-text.show { display: block; }

.form-inline { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.form-inline input, .form-inline select { flex: 1; }
.form-inline .h-name { flex: 2; min-width: 80px; }
.form-inline .h-code { flex: 1.2; min-width: 70px; }
.form-inline .h-market { flex: 0.9; min-width: 70px; }
.form-inline .h-weight { flex: 0.8; min-width: 70px; }
.form-inline .btn-remove {
  background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 18px;
  padding: 6px; border-radius: 4px; transition: all 0.15s; flex-shrink: 0; line-height: 1;
}
.form-inline .btn-remove:hover { color: var(--danger); background: var(--error-bg); }
.holdings-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.holdings-header span { font-size: 13px; font-weight: 600; color: var(--text-secondary); }
.modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--border); transition: border-color 0.3s; }
.modal-actions .btn { padding: 10px 24px; min-width: 80px; }

/* ─── 确认对话框 ─── */
.confirm-overlay {
  display: none; position: fixed; inset: 0; background: var(--overlay); z-index: 300;
  justify-content: center; align-items: center; padding: 16px;
}
.confirm-overlay.show { display: flex; }
.confirm-box {
  background: var(--card); border-radius: 12px; padding: 28px; max-width: 400px; width: 100%;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2); animation: modalIn 0.25s ease;
}
.confirm-box h3 { font-size: 17px; font-weight: 700; margin-bottom: 8px; }
.confirm-box p { font-size: 14px; color: var(--text-secondary); margin-bottom: 20px; }
.confirm-actions { display: flex; gap: 10px; justify-content: flex-end; }
.confirm-actions .btn { padding: 8px 20px; min-width: 70px; justify-content: center; }

/* ─── 模态框标题行（含右侧操作按钮） ─── */
.modal-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; gap: 12px; }
.modal-header-row h2 { margin: 0; }

/* ─── 自动导入模态框 ─── */
.import-textarea {
  width: 100%; min-height: 260px; padding: 12px; border: 1px solid var(--border); border-radius: 8px;
  font-family: 'SF Mono', 'Monaco', 'Consolas', monospace; font-size: 13px; line-height: 1.5;
  resize: vertical; outline: none; transition: border-color 0.2s, background 0.3s; background: var(--input-bg); color: var(--text);
  white-space: pre; overflow-x: auto;
}
.import-textarea:focus { border-color: var(--primary); background: var(--card); }
.template-box {
  background: var(--input-bg); border: 1px solid var(--border); border-radius: 8px; padding: 12px;
  font-family: 'SF Mono', 'Monaco', 'Consolas', monospace; font-size: 12px; line-height: 1.55;
  color: var(--text-secondary); white-space: pre; overflow-x: auto; max-height: 240px; overflow-y: auto;
  transition: background 0.3s, border-color 0.3s;
}
.template-box .t-key { color: var(--primary); }
.template-box .t-str { color: var(--success-text); }
.template-box .t-num { color: var(--danger); }
.market-legend { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; font-size: 12px; color: var(--text-muted); }
.market-legend span { background: var(--tag-bg); padding: 2px 8px; border-radius: 4px; transition: background 0.3s; }

/* ─── 估值详情模态框 ─── */
.detail-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.detail-table th, .detail-table td { padding: 9px 8px; text-align: left; border-bottom: 1px solid var(--border); transition: border-color 0.3s; }
.detail-table th { font-weight: 600; color: var(--text-secondary); font-size: 12px; white-space: nowrap; }
.detail-table td.num { font-variant-numeric: tabular-nums; text-align: right; white-space: nowrap; }
.detail-table tr:last-child td { border-bottom: none; }
.status-tag { display: inline-block; font-size: 11px; font-weight: 500; padding: 2px 8px; border-radius: 10px; white-space: nowrap; }
.status-tag.open { background: var(--success-bg); color: var(--success-text); border: 1px solid var(--success-border); }
.status-tag.closed { background: var(--tag-bg); color: var(--text-muted); }
.status-tag.pre { background: var(--loading-bg); color: var(--primary); border: 1px solid var(--loading-border); }
.status-tag.break { background: var(--loading-bg); color: var(--primary); border: 1px solid var(--loading-border); }
.status-tag.weekend { background: var(--error-bg); color: var(--danger); border: 1px solid var(--error-border); }
.status-tag.unknown { background: var(--tag-bg); color: var(--text-muted); }
.market-badge { font-size: 10px; padding: 1px 5px; border-radius: 3px; background: var(--primary-light); color: var(--primary); margin-left: 4px; transition: background 0.3s; }
.change-up { color: var(--up); }
.change-down { color: var(--down); }
.change-flat { color: var(--text-muted); }

/* ─── 响应式 ─── */
@media (max-width: 640px) {
  .token-bar { padding: 12px 16px; gap: 8px; }
  .token-bar .logo { font-size: 17px; }
  .token-bar .token-group { min-width: 0; }
  .token-bar .token-group input { font-size: 13px; padding: 8px 10px; }
  .token-bar .token-group .btn-verify { padding: 8px 14px; font-size: 13px; min-width: 70px; }
  .container { padding: 16px 12px 40px; }
  .header h1 { font-size: 20px; }
  .header { flex-direction: column; align-items: stretch; }
  .header-actions { justify-content: stretch; }
  .header-actions .btn { flex: 1; justify-content: center; }
  .fund-card { padding: 16px; }
  .fund-card-top { flex-direction: column; gap: 8px; }
  .fund-change-wrap { text-align: left; width: 100%; display: flex; align-items: baseline; gap: 8px; }
  .fund-change { font-size: 22px; }
  .fund-bottom { flex-direction: column; align-items: flex-start; }
  .fund-actions { width: 100%; justify-content: flex-end; }
  .modal { padding: 20px; }
  .form-inline { gap: 6px; }
  .form-inline .h-name { flex: 100%; }
  .form-inline input, .form-inline select { font-size: 13px; padding: 7px 8px; }
  .modal-actions { flex-direction: column; }
  .modal-actions .btn { width: 100%; justify-content: center; }
  .toast-container { top: 76px; right: 12px; left: 12px; }
  .toast { max-width: 100%; font-size: 13px; }
}

@media (max-width: 400px) {
  .token-bar { flex-wrap: wrap; }
  .token-bar .token-group { width: 100%; }
}
</style>
</head>
<body>

<!-- Toast -->
<div class="toast-container" id="toastContainer"></div>

<!-- 确认对话框 -->
<div class="confirm-overlay" id="confirmOverlay">
  <div class="confirm-box">
    <h3 id="confirmTitle">确认删除</h3>
    <p id="confirmMsg">确定要删除该基金吗？此操作不可撤销。</p>
    <div class="confirm-actions">
      <button class="btn btn-outline" id="confirmCancel">取消</button>
      <button class="btn btn-danger" id="confirmOk">删除</button>
    </div>
  </div>
</div>

<!-- 令牌栏 -->
<div class="token-bar">
  <div class="logo"><span>📊</span> 基金估值</div>
  <div class="token-group">
    <input type="password" id="tokenInput" placeholder="输入系统令牌访问" spellcheck="false">
    <button class="btn-verify" id="verifyBtn">验证</button>
  </div>
</div>

<!-- 主内容 -->
<div class="container" id="mainContent">
  <div class="header">
    <h1>基金持仓估值</h1>
    <div class="header-actions">
      <button class="btn btn-outline" id="refreshBtn">🔄 刷新估值</button>
      <button class="btn btn-primary" id="addFundBtn">＋ 新增基金</button>
    </div>
  </div>

  <div class="refresh-status" id="refreshStatus"></div>
  <div id="fundList"></div>
</div>

<!-- 模态框 -->
<div class="modal-overlay" id="modalOverlay">
  <div class="modal">
    <button class="modal-close" id="modalCloseBtn">✕</button>
    <div class="modal-header-row">
      <h2 id="modalTitle">新增基金</h2>
      <button class="btn btn-outline btn-sm" id="gotoImportBtn" style="display:none">📥 自动导入</button>
    </div>
    <div class="form-group">
      <label>基金名称 <span class="error-text" id="nameError" style="display:inline;margin-left:8px;font-weight:400;"></span></label>
      <input type="text" id="fundNameInput" placeholder="如：华夏沪深300ETF" spellcheck="false">
    </div>
    <div class="form-group">
      <label>基金代码 <span style="font-weight:400;color:var(--text-muted)">（可选）</span></label>
      <input type="text" id="fundCodeInput" placeholder="如：510300" spellcheck="false">
    </div>
    <div class="form-group">
      <div class="holdings-header">
        <span>持仓明细</span>
        <button class="btn btn-outline btn-sm btn-add-row" id="addHoldingBtn">＋ 添加一行</button>
      </div>
      <div id="holdingsList"></div>
      <div class="error-text" id="holdingsError"></div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-outline" id="modalCancelBtn">取消</button>
      <button class="btn btn-primary" id="modalSaveBtn">保存</button>
    </div>
  </div>
</div>

<!-- 自动导入模态框 -->
<div class="modal-overlay" id="importOverlay">
  <div class="modal">
    <button class="modal-close" id="importCloseBtn">✕</button>
    <h2>📥 自动导入基金</h2>
    <div class="form-group">
      <label>JSON 数据 <span style="font-weight:400;color:var(--text-muted)">（最外层为数组，支持一次导入多个基金）</span></label>
      <textarea class="import-textarea" id="importTextarea" placeholder='粘贴 JSON 列表，例如：&#10;[&#10;  { "fund_name": "华夏沪深300ETF", "fund_code": "510300", "holdings": [...] }&#10;]' spellcheck="false"></textarea>
    </div>
    <div class="form-group">
      <label>模板示例 <span style="font-weight:400;color:var(--text-muted)">（点击下方按钮填入输入框）</span></label>
      <div class="template-box" id="templateBox"></div>
      <div class="market-legend">
        <span>A=A股</span><span>HK=港股</span><span>US=美股</span>
        <span>KR=韩国</span><span>TW=台湾</span><span>JP=日本</span>
      </div>
      <button class="btn btn-outline btn-sm" id="fillTemplateBtn" style="margin-top:10px">填入模板</button>
    </div>
    <div class="modal-actions">
      <button class="btn btn-outline" id="importCancelBtn">取消</button>
      <button class="btn btn-primary" id="importSubmitBtn">导入</button>
    </div>
  </div>
</div>

<!-- 估值详情模态框 -->
<div class="modal-overlay" id="detailOverlay">
  <div class="modal">
    <button class="modal-close" id="detailCloseBtn">✕</button>
    <h2 id="detailTitle">估值详情</h2>
    <div id="detailBody"></div>
  </div>
</div>

<script>
let token = localStorage.getItem('fv_token') || '';
let editingId = null;
let confirmResolve = null;
let fundsCache = [];

const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

const tokenInput = $('tokenInput'), verifyBtn = $('verifyBtn');
const mainContent = $('mainContent'), fundList = $('fundList');
const refreshBtn = $('refreshBtn'), refreshStatus = $('refreshStatus');
const addFundBtn = $('addFundBtn');
const modalOverlay = $('modalOverlay'), modalTitle = $('modalTitle');
const fundNameInput = $('fundNameInput'), fundCodeInput = $('fundCodeInput');
const nameError = $('nameError'), holdingsError = $('holdingsError');
const holdingsList = $('holdingsList'), addHoldingBtn = $('addHoldingBtn');
const modalSaveBtn = $('modalSaveBtn'), modalCancelBtn = $('modalCancelBtn'), modalCloseBtn = $('modalCloseBtn');
const gotoImportBtn = $('gotoImportBtn');
const importOverlay = $('importOverlay'), importTextarea = $('importTextarea'), templateBox = $('templateBox');
const fillTemplateBtn = $('fillTemplateBtn'), importSubmitBtn = $('importSubmitBtn'), importCancelBtn = $('importCancelBtn'), importCloseBtn = $('importCloseBtn');
const detailOverlay = $('detailOverlay'), detailTitle = $('detailTitle'), detailBody = $('detailBody'), detailCloseBtn = $('detailCloseBtn');
const toastContainer = $('toastContainer');
const confirmOverlay = $('confirmOverlay'), confirmTitle = $('confirmTitle'), confirmMsg = $('confirmMsg');
const confirmOk = $('confirmOk'), confirmCancel = $('confirmCancel');

// ─── Toast ───
function toast(msg, type) {
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  const icons = { success: '✓', error: '✗', info: '⏳' };
  el.innerHTML = (icons[type] || '') + ' ' + msg;
  toastContainer.appendChild(el);
  setTimeout(() => {
    el.classList.add('toast-out');
    setTimeout(() => el.remove(), 300);
  }, 3000);
}

// ─── 确认对话框 ───
function confirm(title, msg) {
  return new Promise(resolve => {
    confirmTitle.textContent = title;
    confirmMsg.textContent = msg;
    confirmResolve = resolve;
    confirmOverlay.classList.add('show');
  });
}
confirmOk.addEventListener('click', () => { confirmOverlay.classList.remove('show'); if (confirmResolve) confirmResolve(true); });
confirmCancel.addEventListener('click', () => { confirmOverlay.classList.remove('show'); if (confirmResolve) confirmResolve(false); });
confirmOverlay.addEventListener('click', e => { if (e.target === confirmOverlay) { confirmOverlay.classList.remove('show'); if (confirmResolve) confirmResolve(false); } });

// ─── 按钮加载状态 ───
function setLoading(btn, loading, text) {
  if (loading) {
    btn._origText = btn.textContent;
    btn.disabled = true;
    btn.textContent = text || '处理中…';
  } else {
    btn.disabled = false;
    btn.textContent = btn._origText || btn.textContent;
  }
}

// ─── 令牌 ───
if (token) { tokenInput.value = token; verifyToken(); }

verifyBtn.addEventListener('click', verifyToken);
tokenInput.addEventListener('keydown', e => { if (e.key === 'Enter') verifyToken(); });
refreshBtn.addEventListener('click', refreshValuation);
addFundBtn.addEventListener('click', () => openModal());
modalCancelBtn.addEventListener('click', closeModal);
modalCloseBtn.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });
addHoldingBtn.addEventListener('click', () => addHoldingRow());
modalSaveBtn.addEventListener('click', saveFund);
gotoImportBtn.addEventListener('click', () => { closeModal(); openImportModal(); });
importCancelBtn.addEventListener('click', closeImportModal);
importCloseBtn.addEventListener('click', closeImportModal);
importOverlay.addEventListener('click', e => { if (e.target === importOverlay) closeImportModal(); });
fillTemplateBtn.addEventListener('click', () => { importTextarea.value = IMPORT_TEMPLATE_RAW; });
importSubmitBtn.addEventListener('click', submitImport);
detailCloseBtn.addEventListener('click', () => detailOverlay.classList.remove('show'));
detailOverlay.addEventListener('click', e => { if (e.target === detailOverlay) detailOverlay.classList.remove('show'); });

async function verifyToken() {
  token = tokenInput.value.trim();
  if (!token) { setBtnStatus('请输入令牌', 'err'); tokenInput.focus(); return; }
  setBtnStatus('验证中…', 'loading', true);
  try {
    const res = await fetch('/api/verify', { headers: { 'Authorization': 'Bearer ' + token } });
    if (res.ok) {
      localStorage.setItem('fv_token', token);
      setBtnStatus('✓ 已授权', 'ok');
      mainContent.classList.add('active');
      loadFunds();
    } else if (res.status === 401) {
      setBtnStatus('✗ 无效', 'err');
      localStorage.removeItem('fv_token');
      mainContent.classList.remove('active');
      toast('令牌无效，请检查后重试', 'error');
    } else {
      setBtnStatus('✗ 失败', 'err');
      toast('验证请求失败，请重试', 'error');
    }
  } catch {
    setBtnStatus('✗ 网络错误', 'err');
    toast('网络请求失败，请检查连接', 'error');
  }
}

function setBtnStatus(text, cls, disabled) {
  verifyBtn.textContent = text;
  verifyBtn.className = 'btn-verify' + (cls ? ' ' + cls : '');
  verifyBtn.disabled = !!disabled;
}

async function api(url, options) {
  const res = await fetch(url, {
    ...options,
    headers: { ...options?.headers, 'Authorization': 'Bearer ' + token },
  });
  if (res.status === 401) {
    setBtnStatus('✗ 已失效', 'err');
    mainContent.classList.remove('active');
    localStorage.removeItem('fv_token');
    toast('令牌已失效，请重新验证', 'error');
    throw new Error('UNAUTHORIZED');
  }
  if (!res.ok) {
    let msg = '请求失败';
    try { const d = await res.json(); if (d.error) msg = d.error; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

// ─── 加载骨架 ───
function showSkeleton() {
  let html = '';
  for (let i = 0; i < 3; i++) {
    html += '<div class="skeleton-card skeleton">';
    html += '<div class="skeleton-line w60"></div>';
    html += '<div class="skeleton-line w40"></div>';
    html += '<div class="skeleton-line w80"></div>';
    html += '</div>';
  }
  fundList.innerHTML = html;
}

async function loadFunds() {
  showSkeleton();
  try {
    const data = await api('/api/funds');
    renderFunds(data.results || []);
  } catch (e) {
    if (e.message === 'UNAUTHORIZED') return;
    fundList.innerHTML = '<div class="empty-state"><div class="icon">⚠️</div><p>加载失败：' + esc(e.message) + '</p></div>';
    toast('加载基金列表失败', 'error');
  }
}

function renderFunds(funds) {
  fundsCache = funds || [];
  if (!funds || !funds.length) {
    fundList.innerHTML = '<div class="empty-state"><div class="icon">📂</div><p>还没有添加任何基金</p><div class="sub">点击右上角「新增基金」开始</div></div>';
    return;
  }
  let html = '';
  for (const f of funds) {
    let change = Number(f.estimated_change) || 0;
    let changeClass = 'flat', changeText = '—';
    if (f.estimated_time) {
      changeClass = change > 0.01 ? 'up' : change < -0.01 ? 'down' : 'flat';
      changeText = (change > 0 ? '+' : '') + change.toFixed(2) + '%';
    }
    let holdings = [];
    try { holdings = JSON.parse(f.holdings || '[]'); } catch {}
    let preview = '';
    if (holdings.length) {
      preview = holdings.slice(0, 6).map(h =>
        '<span class="stock-tag">' + esc(h.name || '') + ' ' + (h.weight || 0) + '%</span>'
      ).join('');
      if (holdings.length > 6) preview += '<span class="stock-tag" style="background:transparent;color:var(--text-muted)">+' + (holdings.length - 6) + '</span>';
    }

    html += '<div class="fund-card">';
    html += '<div class="fund-card-top">';
    html += '<div class="fund-info">';
    html += '<div class="fund-name">' + esc(f.fund_name) + (f.fund_code ? '<span class="tag">' + esc(f.fund_code) + '</span>' : '') + '</div>';
    if (f.fund_code) html += '<div class="fund-code-text">' + esc(f.fund_code) + '</div>';
    html += '</div>';
    html += '<div class="fund-change-wrap"><div class="fund-change ' + changeClass + '">' + changeText + '</div>';
    if (f.estimated_time) html += '<div class="fund-time">' + esc(f.estimated_time) + '</div>';
    html += '</div></div>';
    html += '<div class="fund-divider"></div>';
    html += '<div class="fund-bottom">';
    html += '<button class="btn btn-outline btn-sm btn-detail" onclick="openDetailModal(' + f.id + ')">📊 估值详情</button>';
    if (preview) html += '<div class="holdings-preview">' + preview + '</div>';
    html += '<div class="fund-actions">';
    html += '<button class="btn btn-outline btn-sm" onclick="openModal(' + f.id + ')">编辑</button>';
    html += '<button class="btn btn-danger btn-sm" onclick="deleteFund(' + f.id + ')">删除</button>';
    html += '</div>';
    html += '</div></div>';
  }
  fundList.innerHTML = html;
}

function esc(s) { return String(s || '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]); }

async function refreshValuation() {
  refreshStatus.className = 'refresh-status show loading';
  refreshStatus.innerHTML = '⏳ 正在拉取各市场行情…';
  setLoading(refreshBtn, true, '刷新中…');
  try {
    const data = await api('/api/trigger', { method: 'POST' });
    const stats = data.stats || {};
    const count = (data.results || []).length || 0;
    const detail = stats.total_holdings
      ? '（匹配 ' + stats.match_rate + '，' + (stats.markets || {}).length + ' 个市场）'
      : '';
    refreshStatus.className = 'refresh-status show success';
    refreshStatus.innerHTML = '✓ 估值已更新，' + count + ' 只基金' + detail;
    toast('估值刷新完成，' + count + ' 只基金已更新', 'success');
    setTimeout(() => { refreshStatus.classList.remove('show'); }, 5000);
    loadFunds();
  } catch (e) {
    if (e.message === 'UNAUTHORIZED') return;
    refreshStatus.className = 'refresh-status show error';
    refreshStatus.innerHTML = '✗ 刷新失败：' + e.message;
    toast('估值刷新失败：' + e.message, 'error');
  } finally { setLoading(refreshBtn, false); }
}

async function deleteFund(id) {
  const ok = await confirm('确认删除', '确定要删除该基金吗？此操作不可撤销。');
  if (!ok) return;
  try {
    await api('/api/funds/' + id, { method: 'DELETE' });
    toast('删除成功', 'success');
    loadFunds();
  } catch (e) {
    if (e.message === 'UNAUTHORIZED') return;
    toast('删除失败：' + e.message, 'error');
  }
}

async function openModal(id) {
  editingId = id || null;
  modalTitle.textContent = id ? '编辑基金' : '新增基金';
  // 自动导入入口仅在「新增基金」时显示
  gotoImportBtn.style.display = id ? 'none' : '';
  fundNameInput.value = ''; fundCodeInput.value = '';
  holdingsList.innerHTML = '';
  nameError.textContent = ''; holdingsError.textContent = ''; holdingsError.classList.remove('show');
  fundNameInput.classList.remove('field-error');
  // 重置保存按钮为初始状态
  modalSaveBtn.disabled = false;
  modalSaveBtn.textContent = '保存';
  modalSaveBtn._origText = '保存';

  if (id) {
    setLoading(modalSaveBtn, true, '加载中…');
    try {
      const data = await api('/api/funds/' + id);
      const fund = data.results?.[0] || data;
      if (fund) {
        fundNameInput.value = fund.fund_name || '';
        fundCodeInput.value = fund.fund_code || '';
        let h = []; try { h = JSON.parse(fund.holdings || '[]'); } catch {}
        h.forEach(x => addHoldingRow(x.name, x.code, x.market, x.weight));
      }
    } catch (e) {
      if (e.message === 'UNAUTHORIZED') return;
      toast('加载基金数据失败', 'error');
    } finally { setLoading(modalSaveBtn, false); }
  }
  if (!holdingsList.children.length) addHoldingRow();
  modalOverlay.classList.add('show');
}

function closeModal() {
  modalOverlay.classList.remove('show');
  nameError.textContent = ''; holdingsError.textContent = ''; holdingsError.classList.remove('show');
  modalSaveBtn.disabled = false;
  modalSaveBtn.textContent = '保存';
  modalSaveBtn._origText = '保存';
  fundNameInput.classList.remove('field-error');
  editingId = null;
}

function addHoldingRow(name, code, market, weight) {
  const div = document.createElement('div');
  div.className = 'form-inline';
  div.style.marginBottom = '8px';
  div.innerHTML =
    '<input class="h-name" placeholder="名称" value="' + esc(name||'') + '" spellcheck="false">' +
    '<input class="h-code" placeholder="代码" value="' + esc(code||'') + '" spellcheck="false">' +
    '<select class="h-market">' +
      '<option value="A"' + (market==='A'?' selected':'') + '>A股</option>' +
      '<option value="HK"' + (market==='HK'?' selected':'') + '>港股</option>' +
      '<option value="US"' + (market==='US'?' selected':'') + '>美股</option>' +
      '<option value="KR"' + (market==='KR'?' selected':'') + '>韩国</option>' +
      '<option value="TW"' + (market==='TW'?' selected':'') + '>台湾</option>' +
      '<option value="JP"' + (market==='JP'?' selected':'') + '>日本</option>' +
    '</select>' +
    '<input class="h-weight" type="number" placeholder="%" value="' + (weight||'') + '" step="0.01">' +
    '<button class="btn-remove" onclick="this.parentElement.remove()">✕</button>';
  holdingsList.appendChild(div);
}

async function saveFund() {
  const name = fundNameInput.value.trim();
  nameError.textContent = ''; holdingsError.textContent = ''; holdingsError.classList.remove('show');
  fundNameInput.classList.remove('field-error');

  if (!name) {
    nameError.textContent = '请输入基金名称';
    fundNameInput.classList.add('field-error');
    fundNameInput.focus();
    return;
  }

  const code = fundCodeInput.value.trim();
  const rows = holdingsList.querySelectorAll('.form-inline');
  const holdings = [];
  for (const row of rows) {
    const n = row.querySelector('.h-name').value.trim();
    const c = row.querySelector('.h-code').value.trim();
    const m = row.querySelector('.h-market').value;
    const w = parseFloat(row.querySelector('.h-weight').value) || 0;
    if (!n && !c) continue;
    if (!n) { toast('请填写持仓名称', 'error'); row.querySelector('.h-name').focus(); return; }
    if (!c) { toast('请填写持仓代码', 'error'); row.querySelector('.h-code').focus(); return; }
    holdings.push({ name: n, code: c, market: m, weight: w });
  }
  if (!holdings.length) {
    holdingsError.textContent = '请至少添加一条持仓明细';
    holdingsError.classList.add('show');
    toast('请至少添加一条持仓明细', 'error');
    return;
  }

  const body = { fund_name: name, fund_code: code, holdings: JSON.stringify(holdings) };
  setLoading(modalSaveBtn, true, '保存中…');
  try {
    if (editingId) {
      await api('/api/funds/' + editingId, { method: 'PUT', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } });
      toast('基金已更新', 'success');
    } else {
      await api('/api/funds', { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } });
      toast('基金已添加', 'success');
    }
    closeModal();
    loadFunds();
  } catch (e) {
    if (e.message === 'UNAUTHORIZED') return;
    toast('保存失败：' + e.message, 'error');
  } finally { setLoading(modalSaveBtn, false); }
}

// ─── 自动导入 ───
const IMPORT_TEMPLATE = [
  {
    fund_name: "华夏沪深300ETF",
    fund_code: "510300",
    holdings: [
      { name: "贵州茅台", code: "600519", market: "A", weight: 5.23 },
      { name: "宁德时代", code: "300750", market: "A", weight: 2.10 },
      { name: "腾讯控股", code: "700", market: "HK", weight: 8.10 },
      { name: "苹果", code: "AAPL", market: "US", weight: 4.50 },
      { name: "三星电子", code: "005930", market: "KR", weight: 6.80 },
      { name: "台积电", code: "2330", market: "TW", weight: 10.20 },
      { name: "丰田汽车", code: "7203", market: "JP", weight: 2.30 }
    ]
  },
  {
    fund_name: "科技主题基金",
    fund_code: "",
    holdings: [
      { name: "美团", code: "3690", market: "HK", weight: 7.50 },
      { name: "微软", code: "MSFT", market: "US", weight: 9.20 }
    ]
  }
];
const IMPORT_TEMPLATE_RAW = JSON.stringify(IMPORT_TEMPLATE, null, 2);

function openImportModal() {
  importTextarea.value = '';
  templateBox.textContent = IMPORT_TEMPLATE_RAW;
  importOverlay.classList.add('show');
}

function closeImportModal() {
  importOverlay.classList.remove('show');
}

async function submitImport() {
  const raw = importTextarea.value.trim();
  if (!raw) { toast('请输入 JSON 数据', 'error'); return; }
  let data;
  try { data = JSON.parse(raw); }
  catch (e) { toast('JSON 格式错误：' + e.message, 'error'); return; }
  if (!Array.isArray(data)) { toast('最外层必须是数组', 'error'); return; }

  setLoading(importSubmitBtn, true, '导入中…');
  try {
    const result = await api('/api/funds/batch', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    });
    const ok = result.success || 0, fail = result.failed || 0;
    if (fail === 0) {
      toast('成功导入 ' + ok + ' 只基金', 'success');
    } else if (ok > 0) {
      toast('导入完成：成功 ' + ok + '，失败 ' + fail, 'info');
    } else {
      toast('导入失败：' + (result.errors?.[0]?.error || '未知错误'), 'error');
    }
    closeImportModal();
    loadFunds();
  } catch (e) {
    if (e.message === 'UNAUTHORIZED') return;
    toast('导入失败：' + e.message, 'error');
  } finally { setLoading(importSubmitBtn, false); }
}

// ─── 估值详情 ───
const MARKET_LABELS = { A: 'A股', HK: '港股', US: '美股', KR: '韩国', TW: '台湾', JP: '日本' };

function openDetailModal(id) {
  const fund = fundsCache.find(f => f.id === id);
  if (!fund) { toast('基金数据不存在', 'error'); return; }
  detailTitle.textContent = fund.fund_name;

  let details = [];
  try { details = JSON.parse(fund.holdings_detail || '[]'); } catch {}
  if (!Array.isArray(details) || details.length === 0) {
    detailBody.innerHTML = '<div class="empty-state"><div class="icon">📋</div><p>暂无估值详情</p><div class="sub">请先点击「刷新估值」获取行情数据</div></div>';
    detailOverlay.classList.add('show');
    return;
  }

  let html = '<table class="detail-table"><thead><tr>';
  html += '<th>持仓</th><th>市场</th><th class="num">权重</th><th class="num">涨跌幅</th><th class="num">贡献</th><th>交易所状态</th>';
  html += '</tr></thead><tbody>';

  for (const d of details) {
    const cp = d.changePct;
    const changeClass = (cp == null) ? 'change-flat' : (cp > 0.01 ? 'change-up' : cp < -0.01 ? 'change-down' : 'change-flat');
    const changeText = (cp == null) ? '—' : ((cp > 0 ? '+' : '') + Number(cp).toFixed(2) + '%');
    const contribText = (d.contribution == null) ? '—' : ((d.contribution > 0 ? '+' : '') + Number(d.contribution).toFixed(2) + '%');
    const statusCls = d.status || 'unknown';
    const marketLabel = MARKET_LABELS[d.market] || d.market || '—';

    html += '<tr>';
    html += '<td><div style="font-weight:500">' + esc(d.name) + '</div><div class="fund-code-text">' + esc(d.code) + '</div></td>';
    html += '<td>' + esc(marketLabel) + '</td>';
    html += '<td class="num">' + (d.weight || 0) + '%</td>';
    html += '<td class="num ' + changeClass + '">' + changeText + '</td>';
    html += '<td class="num ' + changeClass + '">' + contribText + '</td>';
    html += '<td><span class="status-tag ' + statusCls + '">' + esc(d.statusLabel || '未知') + '</span></td>';
    html += '</tr>';
  }
  html += '</tbody></table>';

  if (fund.estimated_time) {
    html += '<div class="fund-time" style="margin-top:12px;text-align:right">数据时间：' + esc(fund.estimated_time) + '</div>';
  }

  detailBody.innerHTML = html;
  detailOverlay.classList.add('show');
}
</script>
</body>
</html>`;
}