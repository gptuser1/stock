import { Hono } from 'hono';
import { createDb, DbError } from './db';
import { refreshValuations } from './fetcher';
import { renderFrontend } from './frontend';

type Bindings = {
  D1_API_TOKEN: string;
  TENCENT_API_BASE?: string;
  YAHOO_API_BASE?: string;
};

type Variables = {
  token: string;
};

interface FundBody {
  fund_name?: string;
  fund_code?: string;
  holdings?: string;
}

// favicon SVG（简约现代风格：深色背景 + 红色上升折线，体现金融/基金估值主题）
const FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="7" fill="#0f172a"/>
  <rect x="5" y="5" width="22" height="22" rx="4" fill="none" stroke="#4f46e5" stroke-width="1.5" opacity="0.25"/>
  <path d="M7 22 L12 16 L16 19 L22 10" fill="none" stroke="#ef4444" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="22" cy="10" r="1.8" fill="#ef4444"/>
  <rect x="6" y="24" width="20" height="1.5" rx="0.75" fill="#4f46e5" opacity="0.4"/>
</svg>`;

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// 统一错误响应
function errorResponse(c: any, e: unknown, defaultMsg = '服务器内部错误') {
  if (e instanceof DbError) {
    return c.json({ error: e.message }, e.status as any);
  }
  const msg = e instanceof Error ? e.message : defaultMsg;
  return c.json({ error: msg }, 500);
}

// ─── 自动建表 ───
let tableReady = false;
let tableInitError: string | null = null;

async function ensureTable(token: string): Promise<boolean> {
  if (tableReady) return true;
  if (tableInitError) return false;

  const db = createDb(token);
  try {
    await db.query(`CREATE TABLE IF NOT EXISTS stock_fund_holdings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fund_name TEXT NOT NULL,
      fund_code TEXT DEFAULT '',
      holdings TEXT NOT NULL DEFAULT '[]',
      holdings_detail TEXT NOT NULL DEFAULT '[]',
      estimated_change REAL DEFAULT 0,
      estimated_time TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now','localtime')),
      updated_at TEXT DEFAULT (datetime('now','localtime'))
    )`);
    // 兼容已存在的旧表：尝试添加 holdings_detail 字段（已存在则忽略错误）
    try {
      await db.query(`ALTER TABLE stock_fund_holdings ADD COLUMN holdings_detail TEXT NOT NULL DEFAULT '[]'`);
    } catch {
      // 字段已存在，忽略
    }
    tableReady = true;
    return true;
  } catch (e) {
    const msg = e instanceof DbError ? e.message : '建表失败';
    tableInitError = msg;
    console.error('Table init error:', msg);
    return false;
  }
}

// 生成与D1默认格式一致的localtime字符串
function localtimeNow(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

// 验证holdings JSON
function validateHoldings(holdings: string): string | null {
  try {
    const parsed = JSON.parse(holdings);
    if (!Array.isArray(parsed)) return 'holdings必须是一个数组';
    for (const item of parsed) {
      if (!item.name || !item.code || !item.market) {
        return '每条持仓必须包含name、code、market字段';
      }
      if (!['A', 'HK', 'US', 'KR', 'TW', 'JP'].includes(item.market)) {
        return `不支持的市场: ${item.market}`;
      }
    }
    return null;
  } catch {
    return 'holdings不是有效的JSON格式';
  }
}

// ─── 鉴权中间件 ───
app.use('/api/*', async (c, next) => {
  const auth = c.req.header('Authorization');
  if (!auth || !auth.startsWith('Bearer ')) {
    return c.json({ error: '缺少Authorization头，格式: Bearer <token>' }, 401);
  }
  const token = auth.slice(7).trim();
  if (!token) {
    return c.json({ error: '令牌不能为空' }, 401);
  }
  if (token !== c.env.D1_API_TOKEN) {
    return c.json({ error: '令牌无效' }, 401);
  }
  c.set('token', token);
  await next();
});

// ─── 路由 ───

// 前端页面
app.get('/', async (c) => {
  const dbReady = await ensureTable(c.env.D1_API_TOKEN);
  if (!dbReady) {
    return c.html(`<!DOCTYPE html><html><body style="font-family:sans-serif;padding:40px;text-align:center;">
      <h2>⚠️ 数据库初始化失败</h2>
      <p style="color:#666;">${tableInitError}</p>
      <p style="color:#999;font-size:13px;">请检查D1_API_TOKEN和D1服务是否正常</p>
    </body></html>`);
  }
  return c.html(renderFrontend());
});

// favicon
app.get('/favicon.svg', async (c) => {
  return new Response(FAVICON_SVG, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400',
    },
  });
});

// 验证令牌
app.get('/api/verify', async (c) => {
  return c.json({ ok: true, message: '令牌有效' });
});

// 获取基金列表
app.get('/api/funds', async (c) => {
  await ensureTable(c.var.token);
  const db = createDb(c.var.token);
  try {
    const funds = await db.list();
    return c.json({ results: funds, count: funds.length });
  } catch (e) {
    return errorResponse(c, e, '获取列表失败');
  }
});

// 获取单个基金
app.get('/api/funds/:id', async (c) => {
  const db = createDb(c.var.token);
  try {
    const fund = await db.get(Number(c.req.param('id')));
    return c.json({ results: [fund] });
  } catch (e) {
    return errorResponse(c, e, '获取基金失败');
  }
});

// 新增基金
app.post('/api/funds', async (c) => {
  await ensureTable(c.var.token);
  const db = createDb(c.var.token);

  let body: FundBody;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: '请求体必须是有效的JSON' }, 400);
  }

  if (!body.fund_name?.trim()) {
    return c.json({ error: '基金名称不能为空' }, 400);
  }

  const holdings = body.holdings || '[]';
  const validationError = validateHoldings(holdings);
  if (validationError) {
    return c.json({ error: validationError }, 400);
  }

  try {
    const result = await db.create({
      fund_name: body.fund_name.trim(),
      fund_code: (body.fund_code || '').trim(),
      holdings,
      created_at: localtimeNow(),
      updated_at: localtimeNow(),
    });
    return c.json(result, 201);
  } catch (e) {
    return errorResponse(c, e, '创建失败');
  }
});

// 批量导入基金
app.post('/api/funds/batch', async (c) => {
  await ensureTable(c.var.token);
  const db = createDb(c.var.token);

  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: '请求体必须是有效的JSON' }, 400);
  }

  if (!Array.isArray(body)) {
    return c.json({ error: '请求体必须是JSON数组' }, 400);
  }

  if (body.length === 0) {
    return c.json({ error: '数组不能为空' }, 400);
  }

  const results: any[] = [];
  const errors: { index: number; error: string }[] = [];

  for (let i = 0; i < body.length; i++) {
    const item = body[i];
    if (!item || typeof item !== 'object') {
      errors.push({ index: i, error: '条目必须是对象' });
      continue;
    }
    if (!item.fund_name?.trim()) {
      errors.push({ index: i, error: '基金名称不能为空' });
      continue;
    }
    const holdings = typeof item.holdings === 'string' ? item.holdings : JSON.stringify(item.holdings || []);
    const validationError = validateHoldings(holdings);
    if (validationError) {
      errors.push({ index: i, error: validationError });
      continue;
    }
    try {
      const result = await db.create({
        fund_name: item.fund_name.trim(),
        fund_code: (item.fund_code || '').trim(),
        holdings,
        created_at: localtimeNow(),
        updated_at: localtimeNow(),
      });
      results.push(result);
    } catch (e) {
      errors.push({ index: i, error: e instanceof Error ? e.message : '创建失败' });
    }
  }

  return c.json({
    success: results.length,
    failed: errors.length,
    results,
    errors,
  }, results.length > 0 ? 201 : 400);
});

// 更新基金
app.put('/api/funds/:id', async (c) => {
  const db = createDb(c.var.token);

  let body: FundBody;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: '请求体必须是有效的JSON' }, 400);
  }

  const data: Record<string, any> = { updated_at: localtimeNow() };

  if (body.fund_name !== undefined) {
    if (!body.fund_name.trim()) {
      return c.json({ error: '基金名称不能为空' }, 400);
    }
    data.fund_name = body.fund_name.trim();
  }

  if (body.fund_code !== undefined) {
    data.fund_code = body.fund_code.trim();
  }

  if (body.holdings !== undefined) {
    const validationError = validateHoldings(body.holdings);
    if (validationError) {
      return c.json({ error: validationError }, 400);
    }
    data.holdings = body.holdings;
  }

  try {
    const result = await db.update(Number(c.req.param('id')), data);
    return c.json(result);
  } catch (e) {
    return errorResponse(c, e, '更新失败');
  }
});

// 删除基金
app.delete('/api/funds/:id', async (c) => {
  const db = createDb(c.var.token);
  try {
    await db.remove(Number(c.req.param('id')));
    return c.json({ message: '删除成功' });
  } catch (e) {
    return errorResponse(c, e, '删除失败');
  }
});

// 手动触发刷新估值
app.post('/api/trigger', async (c) => {
  await ensureTable(c.var.token);
  const db = createDb(c.var.token);

  try {
    const { funds: updated, stats } = await refreshValuations(
      () => db.list(),
      (id, data) => db.update(id, data),
      c.env,
    );

    return c.json({
      results: updated,
      stats: {
        total_funds: stats.totalFunds,
        updated_funds: stats.updatedFunds,
        failed_funds: stats.failedFunds,
        total_holdings: stats.totalHoldings,
        matched_holdings: stats.matchedHoldings,
        match_rate: stats.totalHoldings > 0
          ? Math.round((stats.matchedHoldings / stats.totalHoldings) * 10000) / 100 + '%'
          : '0%',
        markets: stats.markets,
        time_ms: stats.timeElapsed,
      },
    });
  } catch (e) {
    return errorResponse(c, e, '刷新估值失败');
  }
});

// 健康检查
app.get('/api/health', async (c) => {
  try {
    const db = createDb(c.env.D1_API_TOKEN);
    await db.query('SELECT 1');
    return c.json({ status: 'ok', db: 'connected', table_ready: tableReady });
  } catch (e) {
    return c.json({ status: 'error', db: 'disconnected', error: e instanceof Error ? e.message : 'unknown' }, 503);
  }
});

export default app;