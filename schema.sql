-- 基金估值助手 - 建表SQL（参考用，Worker启动时自动执行）
CREATE TABLE IF NOT EXISTS stock_fund_holdings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fund_name TEXT NOT NULL,
  fund_code TEXT DEFAULT '',
  holdings TEXT NOT NULL DEFAULT '[]',
  estimated_change REAL DEFAULT 0,
  estimated_time TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now','localtime')),
  updated_at TEXT DEFAULT (datetime('now','localtime'))
);