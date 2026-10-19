/**
 * OrbitDB 月度数据同步服务
 *
 * 自动读取当前月份的 OrbitDB monthlyAll 文档，
 * 并将新文档写入 IndexedDB 缓存。
 */
import backendClient from './backendClient';
import { saveIPFSContent, hasIPFSContent } from './indexedDBService';
import { ipfsClient } from './ipfsDB';

/**
 * 获取当前月份字符串（YYYY-MM 格式）
 */
function getCurrentMonth() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * 同步指定单个月份的 OrbitDB 数据到 IndexedDB
 *
 * 遍历该月所有文档，若 IndexedDB 中尚不存在则写入。
 *
 * @param {string} month - 月份，格式 YYYY-MM
 * @param {boolean} [force] - 是否强制覆盖已存在的记录
 * @returns {Promise<{synced: number, skipped: number, errors: number}>}
 */
export async function syncOneMonth(month, force = false) {
  console.log(`📡 同步 OrbitDB 月度数据: ${month}`);

  let synced = 0;
  let skipped = 0;
  let errors = 0;

  try {
    // 1. 从后端拉取当月所有文档
    const docs = await backendClient.dbMonthlyAll(month);

    if (!Array.isArray(docs) || docs.length === 0) {
      console.log(`📭 月份 ${month} 没有数据`);
      return { synced, skipped, errors };
    }

    console.log(`📦 月份 ${month} 共 ${docs.length} 条文档`);

    // 2. 遍历文档，逐条写入 IndexedDB
    for (const doc of docs) {
      try {
        // OrbitDB documents() 返回的格式为 { hash, key, value: { _id, title, ... } }
        // 实际数据在 doc.value 中
        const data = doc.value || doc;
        const cid = data._id || doc.key;
        if (!cid) {
          console.warn('⚠️ 文档缺少 _id/cid/key，跳过:', doc);
          skipped++;
          continue;
        }

        // 检查是否已存在（除非 force 覆盖）
        if (!force) {
          const exists = await hasIPFSContent(cid);
          if (exists) {
            skipped++;
            continue;
          }
        }

        // 从 IPFS 读取实际内容（CID 指向 IPFS 存储的文档正文）
        let content;
        try {
          content = await ipfsClient.read(cid);
        } catch (readErr) {
          console.warn(`⚠️ IPFS 读取失败 ${cid}，回退使用元数据:`, readErr.message);
          content = typeof data === 'string' ? data : JSON.stringify(data);
        }

        // 写入 IndexedDB
        await saveIPFSContent(cid, content, {
          title: data.title || '',
          from: `orbit-month-${month}`,
          companyId: data.companyId || '',
        });

        synced++;
      } catch (docErr) {
        console.error(`❌ 文档同步失败:`, docErr.message);
        errors++;
      }
    }

    console.log(`✅ OrbitDB 月度同步完成: 新增 ${synced}, 跳过 ${skipped}, 错误 ${errors}`);
  } catch (err) {
    console.error('❌ OrbitDB 月度同步失败:', err.message);
    errors++;
  }

  return { synced, skipped, errors };
}

/**
 * 同步当月 OrbitDB 数据到 IndexedDB（保持向后兼容）
 *
 * @param {Object} [options]
 * @param {string} [options.month] - 指定月份，不传则使用当月
 * @param {boolean} [options.force] - 是否强制覆盖已存在的记录
 * @returns {Promise<{synced: number, skipped: number, errors: number}>}
 */
export async function syncMonthlyToIndexedDB(options = {}) {
  const month = options.month || getCurrentMonth();
  const force = options.force || false;
  return syncOneMonth(month, force);
}

/**
 * 同步 orbit-config.json 中所有月度库到 IndexedDB
 *
 * 月份来源：后端 /api/dbs 返回的库名中匹配 YYYY-MM 的部分
 * （即 orbit-config.json 的 "dbs" 中登记的所有月份）。
 * 适合在 App 启动时自动调用，一次性载入全部历史月份数据。
 *
 * 单个月份失败（如后端 404、网络抖动）不会中断整体同步，
 * 已同步过的 CID 会通过 IndexedDB 命中检查被跳过，重复启动无额外下载。
 *
 * @param {Object} [options]
 * @param {boolean} [options.force] - 是否强制覆盖已存在的记录
 * @returns {Promise<{months: string[], synced: number, skipped: number, errors: number}>}
 */
export async function syncAllMonthsToIndexedDB(options = {}) {
  const force = options.force || false;
  const total = { months: [], synced: 0, skipped: 0, errors: 0 };

  let months = [];
  try {
    months = await backendClient.fetchMonthDBs();
  } catch (err) {
    console.error('❌ 获取月度数据库列表失败:', err.message);
    total.errors++;
    return total;
  }

  if (months.length === 0) {
    console.log('📭 未在 orbit-config.json 中找到任何 YYYY-MM 月度数据库');
    return total;
  }

  total.months = months;
  console.log(`📡 开始同步全部月度数据，共 ${months.length} 个月:`, months);

  // 串行同步，避免并发请求打爆 Kubo / 后端
  for (const month of months) {
    const r = await syncOneMonth(month, force);
    total.synced += r.synced;
    total.skipped += r.skipped;
    total.errors += r.errors;
  }

  console.log(
    `✅ 全部月度同步完成: ${months.length} 个月, 新增 ${total.synced}, 跳过 ${total.skipped}, 错误 ${total.errors}`
  );
  return total;
}

export default { syncMonthlyToIndexedDB, syncOneMonth, syncAllMonthsToIndexedDB };