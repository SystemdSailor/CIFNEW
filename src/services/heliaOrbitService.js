/**
 * Helia + libp2p + OrbitDB Service（单例版）
 * 适用于 React / Node.js
 */

import { createHelia } from 'helia'
import { createOrbitDB , Identities, IPFSAccessController } from '@orbitdb/core'

import { createLibp2p } from 'libp2p'
import { tcp } from '@libp2p/tcp'
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'

import { identify } from '@libp2p/identify'
import { gossipsub } from '@chainsafe/libp2p-gossipsub'
import { multiaddr } from '@multiformats/multiaddr'

import { FsBlockstore } from 'blockstore-fs'
import { FsDatastore } from 'datastore-fs'

import { create } from 'kubo-rpc-client'

class HeliaOrbitService {
  constructor() {
    this.libp2p = null
    this.helia = null
    this.orbitdb = null
    this.db = null

    this.connected = false
    this.initializing = false

    this.kubo = null

    this.pubsubQueues = new Map()
    this.subscriptions = new Map()
  }

  /**
   * 初始化 P2P + Helia + OrbitDB
   */
  async connect(options = {}) {
    if (this.connected) return this
    if (this.initializing) return this

    this.initializing = true

    try {
      // 1. libp2p
      this.libp2p = await createLibp2p({
        transports: [tcp()],
        connectionEncrypters: [noise()],
        streamMuxers: [yamux()],
        services: {
          identify: identify(),
          pubsub: gossipsub({
            allowPublishToZeroTopicPeers: true
          })
        }
      })

      // Kubo RPC client (for pinning via HTTP API)
      try {
        const kuboUrl = options.kuboRpcUrl || 'http://127.0.0.1:5001'
        this.kubo = create({ url: kuboUrl })
        console.log('🔗 Kubo RPC client ready:', kuboUrl)
      } catch (e) {
        console.warn('⚠️ Kubo RPC init failed:', e.message)
      }

      // 2. Helia
      // this.helia = await createHelia({
      //   libp2p: this.libp2p
      // })
      this.helia = await createHelia({
        libp2p: this.libp2p,
        datastore: new FsDatastore('./helia/datastore'),
        blockstore: new FsBlockstore('./helia/blocks')
      })

      console.log('✅ Helia started:', this.libp2p.peerId.toString())

      // 3. 可选连接 Kubo
      if (options.kuboAddr) {
        try {
          const addr = multiaddr(options.kuboAddr)
          await this.libp2p.dial(addr)
          console.log('🔗 Kubo connected')
        } catch (e) {
          console.warn('⚠️ Kubo dial failed:', e.message)
        }
      }

      // 4. OrbitDB
      this.dbName = options.dbName || 'example-db'
      this.orbitdb = await createOrbitDB({
        ipfs: this.helia,
        directory: options.directory || './orbitdb-data'
      })
      
      //this.db = await this.orbitdb.open('my-db', { type: 'documents',AccessController: IPFSAccessController({ write: ['*'] }) })
      this.db = await this.orbitdb.open(this.dbName, {
        type: 'documents',
        AccessController: IPFSAccessController({ write: ['*'] })
      })


      console.log('📦 OrbitDB ready:', this.db.address)
      console.log(this.db.address.toString())
      console.log(await this.db.all())
      console.log(this.libp2p.peerId.toString())
      console.log(this.orbitdb.identity)

      // Auto pin OrbitDB manifest CID to Kubo for persistence & reprovide
      const addrStr = this.db.address.toString()
      const manifestCid = addrStr.split('/').pop()
      if (this.kubo && manifestCid) {
        try {
          await this.kubo.pin.add(manifestCid)
          console.log('📌 Pinned OrbitDB manifest:', manifestCid)
        } catch (e) {
          console.warn('⚠️ Pin manifest failed:', e.message)
        }
      }

      this.connected = true
      this.initializing = false

      return this
    } catch (err) {
      this.initializing = false
      this.connected = false
      console.error('❌ connect failed:', err)
      throw err
    }
  }

  // =========================
  // Pin API (Kubo RPC)
  // =========================

  /**
   * Pin a CID via Kubo RPC HTTP API
   * @param {string} cid - Content ID to pin
   */
  async pinAdd(cid) {
    if (!this.kubo) throw new Error('Kubo RPC client not ready')
    return this.kubo.pin.add(cid)
  }

  /**
   * Pin the current OrbitDB database's manifest CID
   */
  async pinDb() {
    if (!this.kubo || !this.db) throw new Error('Not ready')
    const cid = this.db.address.toString().split('/').pop()
    return this.kubo.pin.add(cid)
  }

  // =========================
  // OrbitDB API
  // =========================

  async put(doc) {
    if (!this.db) throw new Error('DB not ready')

    const data = {
      ...doc,
      _id: doc._id || crypto.randomUUID(),
      createdAt: doc.createdAt || Date.now()
    }

    await this.db.put(data)
    return data._id
  }

  async get(id) {
    if (!this.db) throw new Error('DB not ready')
    return this.db.get(id)
  }

  async all() {
    if (!this.db) throw new Error('DB not ready')
    return this.db.all()
  }

  /**
   * 写入文档到公司专属的 OrbitDB 数据库
   * @param {string} companyId - 公司 ID
   * @param {Object} doc - 文档对象（必须包含 _id）
   */
  async companyPut(companyId, doc) {
    if (!this.orbitdb) throw new Error('OrbitDB not ready')
    const dbName = `${this.dbName}-${companyId}`
    const db = await this.orbitdb.open(dbName, { type: 'documents' })
    await db.put(doc)
  }

  /**
   * 从公司专属的 OrbitDB 数据库读取文档
   * @param {string} companyId - 公司 ID
   * @param {string} id - 文档 ID（CID）
   * @returns {Promise<Object|null>}
   */
  async companyGet(companyId, id) {
    if (!this.orbitdb) throw new Error('OrbitDB not ready')
    const dbName = `${this.dbName}-${companyId}`
    const db = await this.orbitdb.open(dbName, { type: 'documents' })
    return db.get(id)
  }

  /**
   * 获取公司专属 OrbitDB 数据库的所有文档
   * @param {string} companyId - 公司 ID
   * @returns {Promise<Array>}
   */
  async companyAll(companyId) {
    if (!this.orbitdb) throw new Error('OrbitDB not ready')
    const dbName = `${this.dbName}-${companyId}`
    const db = await this.orbitdb.open(dbName, { type: 'documents' })
    return db.all()
  }

  /**
   * 写入文档到按月组织的 OrbitDB 数据库
   * @param {string} month - 月份，格式 YYYY-MM（如 2025-06）
   * @param {Object} doc - 文档对象（必须包含 _id）
   */
  async monthlyPut(month, doc) {
    if (!this.orbitdb) throw new Error('OrbitDB not ready')
    const dbName = `${this.dbName}-month-${month}`
    const db = await this.orbitdb.open(dbName, { type: 'documents' })
    await db.put(doc)
  }

  /**
   * 获取指定月份的所有文档
   * @param {string} month - 月份，格式 YYYY-MM
   * @returns {Promise<Array>}
   */
  async monthlyAll(month) {
    if (!this.orbitdb) throw new Error('OrbitDB not ready')
    const dbName = `${this.dbName}-month-${month}`
    const db = await this.orbitdb.open(dbName, { type: 'documents' })
    return db.all()
  }

  // =========================
  // PubSub（libp2p gossipsub）
  // =========================

  async publish(topic, message) {
    const data = new TextEncoder().encode(
      typeof message === 'string'
        ? message
        : JSON.stringify(message)
    )

    await this.libp2p.services.pubsub.publish(topic, data)
  }

  async subscribe(topic, handler) {
    if (this.subscriptions.has(topic)) return

    const queue = []
    this.pubsubQueues.set(topic, queue)

    await this.libp2p.services.pubsub.subscribe(topic, (msg) => {
      try {
        const raw = new TextDecoder().decode(msg.data)

        let data
        try {
          data = JSON.parse(raw)
        } catch {
          data = raw
        }

        const event = {
          from: msg.from.toString(),
          topic,
          data,
          timestamp: Date.now()
        }

        queue.push(event)
        handler?.(event)

      } catch (err) {
        console.error('pubsub parse error:', err)
      }
    })

    this.subscriptions.set(topic, true)
  }

  pubsubPop(topic) {
    const q = this.pubsubQueues.get(topic)
    if (!q || q.length === 0) return null
    return q.shift()
  }

  getPeers() {
    return this.libp2p?.getPeers()?.map(p => p.toString()) || []
  }

  getPeerId() {
    return this.libp2p?.peerId?.toString()
  }

  // =========================
  // graceful shutdown
  // =========================

  async stop() {
    try {
      if (this.db) await this.db.close()
      if (this.orbitdb) await this.orbitdb.stop()
      if (this.helia) await this.helia.stop()

      this.kubo = null
      this.connected = false
      this.initializing = false

      console.log('🛑 service stopped')
    } catch (err) {
      console.error('stop error:', err)
    }
  }
}

// =========================
// 单例导出（React 推荐）
// =========================

const heliaOrbitService = new HeliaOrbitService()

export default heliaOrbitService
export { HeliaOrbitService }
