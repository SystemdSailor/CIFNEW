/**
 * companies OrbitDB 数据库 → 前端公司列表
 *
 * 职责：
 *   1. 拉取  backendClient.dbCompaniesAll()
 *   2. 归一化 把 OrbitDB 文档补齐成 mockCompanies 结构（字段缺失会被 App 过滤 / CompanyCard 直接调用而报错）
 *   3. 合并  追加到现有列表末尾，不打乱爬取数据（transformed_companies）的顺序
 *
 * 读取失败只告警，不影响页面展示（风格对齐 orbitUpdateService.js）。
 */
import backendClient from './backendClient'

/**
 * 任意值 → 字符串（null / undefined → ''）
 * @param {*} v
 * @returns {string}
 */
const str = (v) => (typeof v === 'string' ? v : v === undefined || v === null ? '' : String(v))

/**
 * 把 OrbitDB documents() 返回的文档归一化为 mockCompanies 结构，并补齐所有可能缺失的字段。
 *
 * 背景：库中可能存在历史/外部写入的记录（例如仅有 name/industry/city 的测试记录），
 * 这些记录缺少 description / tags / related 等字段时，App 的过滤逻辑与 CompanyCard
 * 会直接调用 .toLowerCase() / .split() / .map() 从而抛错导致整页白屏。
 *
 * @param {Object} raw - OrbitDB 文档（已由 dbCompaniesAll 解包）
 * @returns {Object} mockCompanies 结构的公司对象，附加 source: 'orbit'
 */
export function normalizeCompanyDoc(raw) {
  const doc = raw && typeof raw === 'object' ? raw : {}

  // 主键：优先 id，其次 _id（两者都缺时为空字符串）
  const id = doc.id !== undefined && doc.id !== null && doc.id !== '' ? doc.id : doc._id

  // related 兼容数组与字符串（"A,B" / "A，B" / "A、B"）两种写法
  const relatedList = Array.isArray(doc.related) ? doc.related : str(doc.related).split(/[,，、]/)

  return {
    _id: doc._id !== undefined && doc._id !== null ? doc._id : id,
    id: id !== undefined && id !== null ? id : '',
    name: str(doc.name) || '未命名公司',
    logo: str(doc.logo),
    industry: str(doc.industry) || '其他',
    scale: str(doc.scale),
    city: str(doc.city),
    description: str(doc.description),
    jobs: Number(doc.jobs) || 0,
    rating: Number(doc.rating) || 0,
    founded: str(doc.founded),
    website: str(doc.website),
    stockCode: str(doc.stockCode),
    englishName: str(doc.englishName),
    tags: str(doc.tags),
    parent: str(doc.parent),
    related: relatedList.map((s) => str(s).trim()).filter(Boolean),
    createdAt: Number(doc.createdAt) || 0,
    source: 'orbit',
  }
}

/**
 * 把 OrbitDB 公司文档合并进现有公司列表。
 *
 * 规则：
 *   - 去重键为 String(_id ?? id)：已存在同一家公司 → 原地覆盖（保留其原位置，便于重复调用）；
 *   - 新公司 → 追加到列表末尾（不打乱爬取数据的顺序）；
 *   - 追加顺序：无 createdAt 的历史记录在前（按 _id 兜底排序，保证刷新后顺序稳定），
 *     有 createdAt 的按时间升序（越新越靠后）。
 *
 * 该函数是幂等的：对同一份 dbDocs 反复调用，结果不变（React StrictMode 下 effect 会执行两次）。
 *
 * @param {Array} baseList - 现有公司列表（App state）
 * @param {Array} dbDocs - 已归一化的 OrbitDB 公司文档
 * @returns {Array} 合并后的新数组（不修改入参）
 */
export function mergeCompanies(baseList, dbDocs) {
  const base = Array.isArray(baseList) ? baseList : []
  const docs = Array.isArray(dbDocs) ? dbDocs : []
  if (docs.length === 0) return base

  const keyOf = (c) => String((c && (c._id ?? c.id)) ?? '')

  const merged = [...base]
  const indexByKey = new Map()
  merged.forEach((c, i) => {
    const k = keyOf(c)
    if (k) indexByKey.set(k, i)
  })

  const fresh = []
  const freshKeys = new Set()

  for (const doc of docs) {
    const k = keyOf(doc)

    if (k && indexByKey.has(k)) {
      // 已存在同一家公司（例如刚在本地新增过）→ 原地覆盖，保持原位置
      const at = indexByKey.get(k)
      merged[at] = { ...merged[at], ...doc }
      continue
    }

    if (k && freshKeys.has(k)) continue // 后端重复返回同一条 → 去重
    if (k) freshKeys.add(k)
    fresh.push(doc)
  }

  if (fresh.length === 0) return merged

  // 追加顺序：无 createdAt 的历史记录在前，有 createdAt 的按时间升序（越新越靠后）。
  // 历史记录用 _id 排序作为确定性兜底 —— 后端 /all 的返回顺序并不稳定，直接沿用会导致每次刷新顺序变化。
  const byKey = (a, b) => String((a && (a._id ?? a.id)) ?? '').localeCompare(String((b && (b._id ?? b.id)) ?? ''))
  const untimed = fresh.filter((d) => !d.createdAt).sort(byKey)
  const timed = fresh.filter((d) => d.createdAt).sort((a, b) => a.createdAt - b.createdAt)

  return [...merged, ...untimed, ...timed]
}

/**
 * 从后端 companies OrbitDB 读取全部公司并归一化。
 *
 * 后端不可用 / 数据库不存在时不会抛错，仅告警并返回空数组，
 * 保证首页始终能渲染内置的爬取数据。
 *
 * @returns {Promise<{docs: Array, error: Error|null}>}
 */
export async function fetchOrbitCompanies() {
  try {
    const docs = await backendClient.dbCompaniesAll()
    const list = Array.isArray(docs) ? docs : []
    return { docs: list.map(normalizeCompanyDoc), error: null }
  } catch (err) {
    console.warn('⚠️ 读取 companies OrbitDB 失败，本次仅使用内置公司数据:', err.message)
    return { docs: [], error: err }
  }
}

const orbitCompanyService = { fetchOrbitCompanies, mergeCompanies, normalizeCompanyDoc }

export default orbitCompanyService
