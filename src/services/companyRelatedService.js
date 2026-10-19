/**
 * companyRelated OrbitDB 数据库 → 公司「关联组织」
 *
 * 数据模型：一公司一行，_id = String(company._id ?? company.id)
 *   { _id, companyId, related: string[], updatedAt }
 *
 * 读取走 /api/db/companyRelated/get/{id}（O(1)），
 * 追加为 read-modify-write：先取现状 → 合并去重 → PUT 整份数组。
 *
 * 与 companies 库解耦：不重写整份公司文档，避免 source:'orbit' 导致的列表重排。
 * 读取失败（库未配置 / 后端未启动）只告警，回退到内置 company.related。
 */
import backendClient from './backendClient';

// 库名（对应 orbit-server/orbit-config.json 中的 "companyRelated"）
const DB = 'companyRelated';

/**
 * 任意值 → 字符串（null / undefined → ''）
 * @param {*} v
 * @returns {string}
 */
const str = (v) => (typeof v === 'string' ? v : v === undefined || v === null ? '' : String(v));

/**
 * 公司标识：优先 _id，其次 id（与 orbitCompanyService.mergeCompanies 的去重键保持一致）
 * @param {Object} c - 公司对象
 * @returns {string}
 */
export const companyKeyOf = (c) => String((c && (c._id ?? c.id)) ?? '');

/**
 * 数组 / 字符串 → trim、去空、去重（保序）
 * @param {*} value - 数组或逗号/顿号分隔字符串
 * @returns {string[]}
 */
export function normalizeList(value) {
  const arr = Array.isArray(value) ? value : str(value).split(/[,，、]/);
  const out = [];
  const seen = new Set();
  for (const item of arr) {
    const s = str(item).trim();
    if (s && !seen.has(s)) {
      seen.add(s);
      out.push(s);
    }
  }
  return out;
}

/**
 * 合并「内置 related」与「库中 related」，去重保序。
 * 两侧都容忍字符串写法（历史/外部写入可能是 "A, B、C"）。
 * @param {*} baseList - 内置公司 related
 * @param {*} dbList - 库中 related
 * @returns {string[]}
 */
export const mergeRelated = (baseList, dbList) =>
  normalizeList([...normalizeList(baseList), ...normalizeList(dbList)]);

/**
 * 读取某公司的整份关联组织。
 * 库未就绪 / 无记录时回退到内置 related，不抛错。
 * @param {Object} company - 公司对象
 * @returns {Promise<string[]>}
 */
export async function fetchCompanyRelated(company) {
  const builtin = company?.related;
  const key = companyKeyOf(company);
  if (!key) return normalizeList(builtin);

  try {
    const doc = await backendClient.dbNamedGet(DB, key); // 不存在 → null
    const dbList = doc && Array.isArray(doc.related) ? doc.related : doc?.related;
    return mergeRelated(builtin, dbList);
  } catch (err) {
    console.warn('⚠️ 读取 companyRelated 失败，使用内置关联组织:', err.message);
    return normalizeList(builtin);
  }
}

/**
 * 批量读取所有公司的关联组织（一次请求，供列表/卡片渲染使用）。
 *
 * `handleDBAll` 返回裸数组（见 orbit-server/handlers.go），
 * 解析失败（库未配置 / 后端未启动）只告警，返回空表 → 调用方回退内置 related。
 *
 * @returns {Promise<Object.<string, string[]>>} { [companyKey]: related[] }
 */
export async function fetchAllCompanyRelated() {
  try {
    const rows = await backendClient.dbNamedAll(DB);
    const map = {};
    for (const row of Array.isArray(rows) ? rows : []) {
      const key = str(row?.companyId ?? row?._id).trim();
      if (!key) continue;
      map[key] = normalizeList(row?.related);
    }
    return map;
  } catch (err) {
    console.warn('⚠️ 读取 companyRelated 列表失败，仅显示内置关联组织:', err.message);
    return {};
  }
}

/**
 * 追加一个关联组织，返回最新完整列表（写库失败会 throw）
 * @param {Object} company - 公司对象
 * @param {string} name - 新关联组织名称
 * @returns {Promise<string[]>}
 */
export async function addCompanyRelated(company, name) {
  const key = companyKeyOf(company);
  if (!key) throw new Error('缺少公司标识，无法保存关联组织');

  const value = str(name).trim();
  if (!value) throw new Error('名称不能为空');

  const doc = await backendClient.dbNamedGet(DB, key); // read
  const dbList = doc && Array.isArray(doc.related) ? doc.related : [];
  const base = mergeRelated(company?.related, dbList);
  const next = normalizeList([...base, value]); // modify
  if (next.length === base.length) throw new Error('该关联组织已存在');

  await backendClient.dbNamedPut(DB, {
    _id: key,
    companyId: key,
    related: next,
    updatedAt: Date.now(),
  }); // write
  return next;
}

const companyRelatedService = {
  fetchCompanyRelated,
  fetchAllCompanyRelated,
  addCompanyRelated,
  mergeRelated,
  normalizeList,
  companyKeyOf,
};

export default companyRelatedService;
