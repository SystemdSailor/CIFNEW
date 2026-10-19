/**
 * 后端 HTTP 客户端
 *
 * 封装所有向后端 Helia 服务发起的 API 调用。
 * 前端不再直接运行 Helia，全部通过此模块转 HTTP 请求。
 */

const BACKEND_URL = process.env.REACT_APP_HELIA_URL || 'http://localhost:3456'

// companies 数据库名（对应 orbit-server/orbit-config.json 中的 "companies"）
const COMPANIES_DB = 'companies'

class BackendClient {
  /**
   * 通用 fetch 封装
   */
  async _fetch(path, options = {}) {
    const url = `${BACKEND_URL}${path}`

    const config = {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    }

    const response = await fetch(url, config)

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`[${response.status}] ${text}`)
    }

    return response.json()
  }

  // =========================
  // 健康检查
  // =========================

  /**
   * 检查后端是否在线
   */
  async ping() {
    return this._fetch('/api/ping')
  }

  // =========================
  // P2P 状态
  // =========================

  /**
   * 获取 P2P 节点状态
   */
  async getStatus() {
    return this._fetch('/api/p2p/status')
  }

  /**
   * 获取已连接的对等节点列表
   */
  async getPeers() {
    return this._fetch('/api/p2p/peers')
  }

  // =========================
  // OrbitDB 文档操作
  // =========================

  /**
   * 写入文档到 OrbitDB
   * @param {Object} doc - 文档对象，必须有 _id 或会自动生成
   * @returns {Promise<{ok: boolean, id: string}>}
   */
  async dbPut(doc) {
    return this._fetch('/api/db/put', {
      method: 'POST',
      body: JSON.stringify(doc),
    })
  }

  /**
   * 从 OrbitDB 读取文档
   * @param {string} id - 文档 ID
   * @returns {Promise<Object|null>}
   */
  async dbGet(id) {
    return this._fetch(`/api/db/get/${encodeURIComponent(id)}`)
  }

  /**
   * 获取 OrbitDB 所有文档
   * @returns {Promise<Array>}
   */
  async dbAll() {
    return this._fetch('/api/db/all')
  }

  // =========================
  // 公司专属 OrbitDB 操作
  // =========================

  /**
   * 写入文档到公司专属的 OrbitDB 数据库
   * @param {string} companyId - 公司 ID
   * @param {Object} doc - 文档对象（必须包含 _id）
   * @returns {Promise<{ok: boolean}>}
   */
  async dbCompanyPut(companyId, doc) {
    return this._fetch(`/api/db/${encodeURIComponent(companyId)}/put`, {
      method: 'POST',
      body: JSON.stringify(doc),
    })
  }

  /**
   * 从公司专属的 OrbitDB 数据库读取文档
   * @param {string} companyId - 公司 ID
   * @param {string} id - 文档 ID（CID）
   * @returns {Promise<Object|null>}
   */
  async dbCompanyGet(companyId, id) {
    return this._fetch(`/api/db/${encodeURIComponent(companyId)}/get/${encodeURIComponent(id)}`)
  }

  /**
   * 获取公司专属 OrbitDB 数据库的所有文档
   * @param {string} companyId - 公司 ID
   * @returns {Promise<Array>}
   */
  async dbCompanyAll(companyId) {
    return this._fetch(`/api/db/${encodeURIComponent(companyId)}/all`)
  }

  // =========================
  // 公司库（companies）OrbitDB 操作
  // =========================

  /**
   * 写入公司文档到 companies 数据库
   * @param {Object} doc - 公司文档（必须包含 _id，建议使用 String(company.id)）
   * @returns {Promise<{ok: boolean, id: string}>}
   */
  async dbCompaniesPut(doc) {
    if (!doc || doc._id === undefined || doc._id === null || doc._id === '') {
      throw new Error('dbCompaniesPut: doc._id is required')
    }
    return this._fetch(`/api/db/${COMPANIES_DB}/put`, {
      method: 'POST',
      body: JSON.stringify(doc),
    })
  }

  /**
   * 从 companies 数据库读取单个公司文档
   * @param {string|number} id - 公司文档 _id
   * @returns {Promise<Object|null>}
   */
  async dbCompaniesGet(id) {
    return this._fetch(`/api/db/${COMPANIES_DB}/get/${encodeURIComponent(id)}`)
  }

  /**
   * 读取 companies 数据库的所有公司文档
   * @returns {Promise<Array>}
   */
  async dbCompaniesAll() {
    const docs = await this._fetch(`/api/db/${COMPANIES_DB}/all`)
    if (!Array.isArray(docs)) return []
    // OrbitDB 可能返回 { hash, key, value } 包装，统一解包为原始文档
    return docs.map(doc => (doc && doc.value ? doc.value : doc))
  }

  // =========================
  // 按月 OrbitDB 操作
  // =========================

  /**
   * 写入文档到按月组织的 OrbitDB 数据库
   * @param {string} month - 月份，格式 YYYY-MM（如 2025-06）
   * @param {Object} doc - 文档对象（必须包含 _id）
   * @returns {Promise<{ok: boolean}>}
   */
  async dbMonthlyPut(month, doc) {
    console.log("----------month",month,`/api/db/${encodeURIComponent(month)}/put`);
    return this._fetch(`/api/db/${encodeURIComponent(month)}/put`, {
      method: 'POST',
      body: JSON.stringify(doc),
    })
  }

  /**
   * 获取指定月份的所有文档
   * @param {string} month - 月份，格式 YYYY-MM
   * @returns {Promise<Array>}
   */
  async dbMonthlyAll(month) {
    return this._fetch(`/api/db/${encodeURIComponent(month)}/all`)
  }

  // =========================
  // 通用命名数据库操作（兼容多数据库场景）
  // =========================

  /**
   * 获取服务器上可用的数据库列表
   * @returns {Promise<string[]>}
   */
  async fetchDBs() {
    return this._fetch('/api/dbs')
  }

  /**
   * 获取服务器 orbit-config.json 中所有按月组织的数据库名（YYYY-MM），已排序
   *
   * 后端 /api/dbs 返回的是 Go map 的键（无序，且包含 users/companies 等非月份库），
   * 这里过滤出形如 YYYY-MM 的月度库并排序，供启动时批量同步使用。
   *
   * @returns {Promise<string[]>} 形如 ['2026-07', '2026-08', '2026-09']
   */
  async fetchMonthDBs() {
    // 仅接受合法的 YYYY-MM（月份 01~12），排除 2026-13 这类非法值
    const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/
    const names = await this.fetchDBs()
    return (Array.isArray(names) ? names : [])
      .filter((n) => MONTH_RE.test(n))
      .sort()
  }

  /**
   * 写入文档到指定数据库
   * @param {string} name - 数据库名称（如 users, orbitdt）
   * @param {Object} doc - 文档对象
   * @returns {Promise<{ok: boolean, id: string}>}
   */
  async dbNamedPut(name, doc) {
    return this._fetch(`/api/db/${encodeURIComponent(name)}/put`, {
      method: 'POST',
      body: JSON.stringify(doc),
    })
  }

  /**
   * 从指定数据库读取文档
   * @param {string} name - 数据库名称
   * @param {string} id - 文档 ID
   * @returns {Promise<Object|null>}
   */
  async dbNamedGet(name, id) {
    return this._fetch(`/api/db/${encodeURIComponent(name)}/get/${encodeURIComponent(id)}`)
  }

  /**
   * 获取指定数据库的所有文档
   * @param {string} name - 数据库名称
   * @returns {Promise<Array>}
   */
  async dbNamedAll(name) {
    return this._fetch(`/api/db/${encodeURIComponent(name)}/all`)
  }

  // =========================
  // PubSub
  // =========================

  /**
   * 发布消息到 topic
   * @param {string} topic
   * @param {string|Object} message
   */
  async pubsubPublish(topic, message) {
    return this._fetch('/api/pubsub/publish', {
      method: 'POST',
      body: JSON.stringify({ topic, message }),
    })
  }

  /**
   * 订阅 topic
   * @param {string} topic
   */
  async pubsubSubscribe(topic) {
    return this._fetch('/api/pubsub/subscribe', {
      method: 'POST',
      body: JSON.stringify({ topic }),
    })
  }

  // =========================
  // 图片上传
  // =========================

  /**
   * 上传图片到 IPFS
   *
   * @deprecated 已弃用。图片上传请改用 ipfsService.uploadImage()
   * （前端直连 Kubo 上传，并通过 backendClient.dbNamedPut('images', ...) 写元数据）。
   * 本方法对应的后端 POST /api/upload-image 目前无调用方，仅保留以兼容旧代码。
   *
   * @param {string} data - base64 编码的图片数据
   * @param {string} mimeType - MIME 类型，如 image/png
   * @returns {Promise<{cid: string}>}
   */
  async uploadImage(data, mimeType) {
    return this._fetch('/api/upload-image', {
      method: 'POST',
      body: JSON.stringify({ data, mimeType }),
    })
  }

  /**
   * 从 topic 队列消费一条消息
   * @param {string} topic
   * @returns {Promise<Object|null>}
   */
  async pubsubPop(topic) {
    return this._fetch('/api/pubsub/pop', {
      method: 'POST',
      body: JSON.stringify({ topic }),
    })
  }
}

// 单例
const backendClient = new BackendClient()
export default backendClient