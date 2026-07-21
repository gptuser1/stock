const API_BASE = 'https://data.klinux.dpdns.org';
const TABLE = 'stock_fund_holdings';
const FETCH_TIMEOUT = 10000;

interface D1Response {
  success: boolean;
  meta?: { served_by: string; changes?: number; duration: number };
  results?: any[];
  error?: string;
}

interface ApiErrorResponse {
  error: string;
}

class DbError extends Error {
  constructor(
    message: string,
    public status: number,
    public context: string
  ) {
    super(message);
    this.name = 'DbError';
  }
}

function headers(token: string): Record<string, string> {
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

async function request<T>(
  token: string,
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: { ...headers(token), ...(options.headers as Record<string, string> || {}) },
    });

    const data = await res.json() as T & ApiErrorResponse;

    if (!res.ok) {
      throw new DbError(
        data.error || `HTTP ${res.status}`,
        res.status,
        url.split('?')[0]
      );
    }

    return data;
  } catch (e) {
    if (e instanceof DbError) throw e;
    if (e instanceof DOMException && e.name === 'AbortError') {
      throw new DbError('请求超时', 408, url.split('?')[0]);
    }
    if (e instanceof TypeError && e.message.includes('fetch')) {
      throw new DbError('网络连接失败，请检查D1 API是否可达', 503, url.split('?')[0]);
    }
    throw new DbError(
      e instanceof Error ? e.message : '未知错误',
      500,
      url.split('?')[0]
    );
  } finally {
    clearTimeout(timeout);
  }
}

export function createDb(token: string) {
  return {
    // 执行任意SQL
    async query(sql: string, params: any[] = []): Promise<D1Response> {
      return request<D1Response>(token, `${API_BASE}/query`, {
        method: 'POST',
        body: JSON.stringify({ query: sql, params }),
      });
    },

    // 查询列表
    async list(): Promise<any[]> {
      const data = await request<D1Response>(
        token,
        `${API_BASE}/rest/${TABLE}?sort_by=created_at&order=desc`
      );
      return data.results || [];
    },

    // 查询单条
    async get(id: number): Promise<any> {
      if (!Number.isInteger(id) || id <= 0) {
        throw new DbError('无效的ID', 400, 'get');
      }
      const data = await request<D1Response>(
        token,
        `${API_BASE}/rest/${TABLE}/${id}`
      );
      if (!data.results || data.results.length === 0) {
        throw new DbError('记录不存在', 404, 'get');
      }
      return data.results[0];
    },

    // 新增
    async create(data: Record<string, any>): Promise<any> {
      const result = await request<any>(
        token,
        `${API_BASE}/rest/${TABLE}`,
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );
      return result.data || result;
    },

    // 更新
    async update(id: number, data: Record<string, any>): Promise<any> {
      if (!Number.isInteger(id) || id <= 0) {
        throw new DbError('无效的ID', 400, 'update');
      }
      const result = await request<any>(
        token,
        `${API_BASE}/rest/${TABLE}/${id}`,
        {
          method: 'PUT',
          body: JSON.stringify(data),
        }
      );
      return result.data || result;
    },

    // 删除
    async remove(id: number): Promise<any> {
      if (!Number.isInteger(id) || id <= 0) {
        throw new DbError('无效的ID', 400, 'delete');
      }
      return request<any>(
        token,
        `${API_BASE}/rest/${TABLE}/${id}`,
        { method: 'DELETE' }
      );
    },
  };
}

export { DbError };