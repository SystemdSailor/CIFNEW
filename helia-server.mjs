/**
 * Helia + OrbitDB 后端服务器
 *
 * 启动一个 Express HTTP 服务器，提供 REST API 接口供前端调用。
 * 在 Node.js 环境下运行 Helia + libp2p + OrbitDB。
 *
 * 启动方式：node helia-server.mjs
 */

import express from 'express'
import cors from 'cors'
import { readFileSync } from 'fs'

// 从前端源码导入 HeliaOrbitService 类（EVM 兼容, .mjs 不受 package.json type 影响）
import { HeliaOrbitService } from './src/services/heliaOrbitService.js'
import { ipfsClient } from './src/services/ipfsDB.js'

// =========================
// 从配置文件读取配置
// =========================
let config
try {
  config = JSON.parse(readFileSync('./helia-config.json', 'utf-8'))
} catch {
  config = {}
}

const PORT = config.port || 3456
const DB_NAME = config.dbName || 'cifnew-db'
const DB_DIR = config.dbDir || './orbitdb-data'
const KUBO_ADDR = config.kuboAddr || ''

// =========================
// 初始化服务
// =========================
const heliaService = new HeliaOrbitService()

async function startServer() {
  console.log('🚀 Starting Helia backend server...')

  try {
    await heliaService.connect({
      dbName: DB_NAME,
      directory: DB_DIR,
      kuboAddr: KUBO_ADDR || undefined
    })

    if (KUBO_ADDR) {
      console.log(`🔗 Kubo target: ${KUBO_ADDR}`)
    }
    console.log(`✅ Helia backend ready — PeerID: ${heliaService.getPeerId()}`)
  } catch (err) {
    console.error('❌ Failed to start Helia service:', err)
    process.exit(1)
  }

  // =========================
  // Express
  // =========================
  const app = express()

  app.use(cors())
  app.use(express.json({ limit: '10mb' }))

  // ---------- 健康检查 ----------
  app.get('/api/ping', (_req, res) => {
    res.json({ ok: true, timestamp: Date.now() })
  })

  // ---------- P2P 状态 ----------
  app.get('/api/p2p/status', (_req, res) => {
    res.json({
      connected: heliaService.connected,
      peerId: heliaService.getPeerId(),
      peers: heliaService.getPeers().length,
    })
  })

  app.get('/api/p2p/peers', (_req, res) => {
    res.json({
      peers: heliaService.getPeers()
    })
  })

  // ---------- OrbitDB 文档操作 ----------
  app.post('/api/db/put', async (req, res) => {
    try {
      const doc = req.body
      if (!doc || typeof doc !== 'object') {
        return res.status(400).json({ error: 'Invalid document' })
      }
      const id = await heliaService.put(doc)
      res.json({ ok: true, id })
    } catch (err) {
      console.error('/api/db/put error:', err)
      res.status(500).json({ error: err.message })
    }
  })

  app.get('/api/db/get/:id', async (req, res) => {
    try {
      const doc = await heliaService.get(req.params.id)
      res.json(doc || null)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })

  app.get('/api/db/all', async (_req, res) => {
    try {
      const docs = await heliaService.all()
      res.json(docs)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })

  // ---------- 公司专属 OrbitDB 操作 ----------
  app.post('/api/db/:companyId/put', async (req, res) => {
    try {
      const { companyId } = req.params
      const doc = req.body
      if (!doc || !doc._id) {
        return res.status(400).json({ error: 'Document must have _id' })
      }
      await heliaService.companyPut(companyId, doc)
      res.json({ ok: true })
    } catch (err) {
      console.error('/api/db/:companyId/put error:', err)
      res.status(500).json({ error: err.message })
    }
  })

  app.get('/api/db/:companyId/get/:id', async (req, res) => {
    try {
      const { companyId, id } = req.params
      const doc = await heliaService.companyGet(companyId, id)
      res.json(doc || null)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })

  app.get('/api/db/:companyId/all', async (req, res) => {
    try {
      const { companyId } = req.params
      const docs = await heliaService.companyAll(companyId)
      res.json(docs)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })

  // ---------- 按月 OrbitDB 操作 ----------
  app.post('/api/db/month/:month/put', async (req, res) => {
    try {
      const { month } = req.params
      const doc = req.body
      if (!doc || !doc._id) {
        return res.status(400).json({ error: 'Document must have _id' })
      }
      await heliaService.monthlyPut(month, doc)
      res.json({ ok: true })
    } catch (err) {
      console.error('/api/db/month/:month/put error:', err)
      res.status(500).json({ error: err.message })
    }
  })

  app.get('/api/db/month/:month/all', async (req, res) => {
    try {
      const { month } = req.params
      const docs = await heliaService.monthlyAll(month)
      res.json(docs)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })

  // ---------- PubSub ----------
  app.post('/api/pubsub/publish', async (req, res) => {
    try {
      const { topic, message } = req.body
      if (!topic) {
        return res.status(400).json({ error: 'topic required' })
      }
      await heliaService.publish(topic, message ?? '')
      res.json({ ok: true })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })

  app.post('/api/pubsub/subscribe', async (req, res) => {
    try {
      const { topic } = req.body
      if (!topic) {
        return res.status(400).json({ error: 'topic required' })
      }
      await heliaService.subscribe(topic)
      res.json({ ok: true, topic })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })

  app.post('/api/pubsub/pop', async (req, res) => {
    try {
      const { topic } = req.body
      if (!topic) {
        return res.status(400).json({ error: 'topic required' })
      }
      const msg = heliaService.pubsubPop(topic)
      res.json(msg)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })

  // ---------- 图片上传与读取 ----------
  app.post('/api/upload-image', async (req, res) => {
    try {
      const { data, mimeType } = req.body
      if (!data) {
        return res.status(400).json({ error: 'data (base64) required' })
      }
      const buffer = Buffer.from(data, 'base64')
      const result = await ipfsClient.upload(buffer)
      const cid = result.cid

      // 元数据存入 OrbitDB
      await heliaService.put({
        _id: cid,
        type: 'image',
        mimeType: mimeType || 'image/png',
        timestamp: Date.now()
      })

      res.json({ cid })
    } catch (err) {
      console.error('/api/upload-image error:', err)
      res.status(500).json({ error: err.message })
    }
  })

  app.get('/api/image/:cid', async (req, res) => {
    try {
      const buffer = await ipfsClient.readRaw(req.params.cid)
      console.log("/api/image/:cid",req.params.cid,buffer);
      const base64 = buffer.toString('base64')
      console.log(base64)
      // 从 OrbitDB 查 mimeType
      let mimeType = 'image/png'
      try {
        const meta = await heliaService.get(req.params.cid)
        if (meta && meta.mimeType) mimeType = meta.mimeType
      } catch {}
      // res.set('Content-Type', mimeType)
      // res.set('Cache-Control', 'public, max-age=31536000, immutable')
      // res.send(base64)
      res.json({ data: base64, mimeType })
    } catch (err) {
      console.error('/api/image/:cid error:', err)
      res.status(500).json({ error: err.message })
    }
  })

  // ---------- 关闭服务 ----------
  app.post('/api/stop', async (_req, res) => {
    res.json({ ok: true, message: 'shutting down...' })
    // 延迟一秒后关闭
    setTimeout(async () => {
      await heliaService.stop()
      process.exit(0)
    }, 1000)
  })

  // =========================
  // 启动 HTTP
  // =========================
  app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════╗
║   Helia Backend Server                  ║
║   Port: ${String(PORT).padEnd(33)}║
║   PeerID: ${(heliaService.getPeerId() || '?').slice(0, 20).padEnd(28)}...║
║   OrbitDB: ${DB_NAME.padEnd(30)}║
╚══════════════════════════════════════════╝`)
  })
}

startServer().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})