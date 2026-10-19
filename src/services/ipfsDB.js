/**
 * IPFS 服务 - 使用 kubo-rpc-client 实现真实的 IPFS 交互
 * 
 * 提供文档内容的去中心化存储与读取。
 */
import { create } from 'kubo-rpc-client';
import config from '../config.js';
import backendClient from './backendClient.js';

/**
 * 浏览器环境下将 base64 字符串解码为 Uint8Array
 */
function base64ToUint8Array(base64Str) {
  const binaryStr = atob(base64Str);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  return bytes;
}

class IPFSClient {
  constructor() {
    this.client = null;
    this.connected = false;
    // 队列模式 PubSub 实现
    this.topicQueues = new Map();     // topic => Array
    this.subscriptions = new Map();   // topic => unsub function
  }

  /**
   * 初始化并连接 IPFS 节点
   */
  async connect() {
    try {
      // 如果配置了完整 URL，使用 URL；否则使用 host/port/protocol
      if (config.ipfs.url) {
        this.client = create(config.ipfs.url);
      } else {
        this.client = create({
          host: config.ipfs.host,
          port: config.ipfs.port,
          protocol: config.ipfs.protocol,
        });
      }

      // 测试连接
      const id = await this.client.id();
      this.connected = true;
      console.log(`✅ IPFS 连接成功 - Node ID: ${id}...`);
      //console.log(`✅ IPFS 连接成功 - Node ID: ${id.id.slice(0, 20)}...`);

      return true;
    } catch (error) {
      this.connected = false;
      console.error('❌ IPFS 连接失败:', error.message);
      throw new Error(`IPFS 连接失败：${error.message}`);
    }
  }

  /**
   * 上传数据到 IPFS
   * @param {string|Buffer} data - 要上传的数据
   * @returns {Promise<{cid: string, size: number}>}
   */
  async upload(data) {
    if (!this.connected) {
      await this.connect();
    }

    try {
      // kubo-rpc-client 的 add 方法接受 Buffer、string 或 Readable stream
      const result = await this.client.add(data, {
        pin: true, // 固定数据，防止被垃圾回收
        cidVersion: 1, // 使用 CID v1（推荐）
      });

      return {
        cid: result.cid.toString(),
        size: result.size,
      };
    } catch (error) {
      console.error('IPFS 上传失败:', error.message);
      throw new Error(`IPFS 上传失败：${error.message}`);
    }
  }

  /**
   * 从 IPFS 读取数据
   * @param {string} cid - 内容标识符
   * @returns {Promise<string>}
   */
  async read(cid) {
    if (!this.connected) {
      await this.connect();
    }

    try {
      // 使用 cat 方法读取数据
      const chunks = [];
      for await (const chunk of this.client.cat(cid)) {
        chunks.push(chunk);
      }

      // 合并 Uint8Array 并转换为字符串
      const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
      const merged = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        merged.set(chunk, offset);
        offset += chunk.length;
      }
      return new TextDecoder().decode(merged);
    } catch (error) {
      // 区分错误类型
      if (
        error.message.includes('node not found') ||
        error.message.includes('path not resolved')
      ) {
        throw new Error(`CID 不存在：${cid}`);
      }

      console.error('IPFS 读取失败:', error.message);
      throw new Error(`IPFS 读取失败：${error.message}`);
    }
  }

  /**
   * 从 IPFS 读取原始二进制数据（用于图片等）
   * @param {string} cid - 内容标识符
   * @returns {Promise<Buffer>}
   */
  async readRaw(cid) {
    if (!this.connected) {
      await this.connect();
    }

    try {
      const chunks = [];
      for await (const chunk of this.client.cat(cid)) {
        chunks.push(chunk);
      }
      const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
      const merged = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        merged.set(chunk, offset);
        offset += chunk.length;
      }
      return merged;
    } catch (error) {
      if (
        error.message.includes('node not found') ||
        error.message.includes('path not resolved')
      ) {
        throw new Error(`CID 不存在：${cid}`);
      }
      console.error('IPFS 读取失败:', error.message);
      throw new Error(`IPFS 读取失败：${error.message}`);
    }
  }

  /**
   * 从 IPFS 读取原始二进制数据并转为 base64 数据 URI
   * @param {string} cid - 内容标识符
   * @param {string} [mimeType='image/png'] - MIME 类型
   * @returns {Promise<string>} base64 数据 URI
   */
  async cidToBase64(cid, mimeType = 'image/png') {
    const rawData = await this.readRaw(cid);
    let binary = '';
    const bytes = new Uint8Array(rawData);
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return `data:${mimeType};base64,${btoa(binary)}`;
  }

  /**
   * 检查 CID 是否存在
   * @param {string} cid
   * @returns {Promise<boolean>}
   */
  async exists(cid) {
    try {
      await this.client.block.stat(cid);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 获取节点统计信息
   */
  async getStats() {
    try {
      const repoStat = await this.client.repo.stat();
      return {
        repoSize: repoStat.repoSize,
        numObjects: repoStat.numObjects,
      };
    } catch (error) {
      console.error('获取 IPFS 统计失败:', error.message);
      return null;
    }
  }

  // ============================================
  // PubSub 相关方法
  // ============================================

  /**
   * 发布消息到 topic
   * @param {string} topic - 主题名称
   * @param {string|Object} message - 要发布的消息
   */
  async pubsubPublish(topic, message) {
    if (!this.connected) {
      await this.connect();
    }

    try {
      const text = typeof message === 'string'
        ? message
        : JSON.stringify(message);
      const data = new TextEncoder().encode(text);

      await this.client.pubsub.publish(topic, data);

      console.log(`📤 已发布消息到: ${topic}`);
    } catch (error) {
      console.error('PubSub 发布失败:', error.message);
      throw new Error(`PubSub 发布失败：${error.message}`);
    }
  }

  /**
   * 订阅 topic（队列模式）
   * @param {string} topic - 主题名称
   */
  async pubsubSubscribe(topic) {
    if (!this.connected) {
      await this.connect();
    }

    // 已订阅直接返回
    if (this.subscriptions.has(topic)) {
      console.log(`⚠️ 已订阅: ${topic}`);
      return;
    }

    const queue = [];
    this.topicQueues.set(topic, queue);

    try {
      // kubo-rpc-client 的 subscribe 使用回调模式 subscribe(topic, handler, options)
      const unsubFn = await this.client.pubsub.subscribe(topic, (msg) => {
        try {
          // msg.data 是 Uint8Array，使用 TextDecoder 解码为字符串
          const raw = new TextDecoder().decode(msg.data);

          let parsed;
          try {
            parsed = JSON.parse(raw);
          } catch {
            parsed = raw;
          }
          console.log(this.topicQueues);
          console.log(`📩 收到 PubSub 消息 - 主题: ${topic}, 来自: ${msg.from}, 数据:`, parsed);
          // { 数据为：
          //     "cid": "bafkreifkin4urzmd6sepr7t3ltfkyqfigixbat5vuxutqukdlip2q5cbyi",
          //     "title": " dfsdf s",
          //     "timestamp": 1779106353954
          // }
          queue.push({
            from: msg.from,
            topic,
            data: parsed,
            timestamp: Date.now(),
          });

        } catch (err) {
          console.error('消息入队失败:', err.message);
        }
      });

      this.subscriptions.set(topic, unsubFn);

      console.log(`📥 已订阅（队列模式）: ${topic}`);

    } catch (error) {
      console.error('订阅失败:', error.message);
      throw new Error(`订阅失败：${error.message}`);
    }
  }

  /**
   * 从 topic 队列中弹出一条消息（消费消息）
   * @param {string} topic - 主题名称
   * @returns {Promise<Object|null>} - 消息对象或 null（队列为空）
   */
  async pubsubPop(topic) {
    const queue = this.topicQueues.get(topic);

    if (!queue || queue.length === 0) {
      return null;
    }

    // 返回并移除队列中最旧的消息
    return queue.shift();
  }

  /**
   * 获取所有活跃的 topic 队列信息
   * @returns {Promise<Array<{topic: string, size: number}>>}
   */
  async pubsubQueues() {
    const result = [];
    for (const [topic, queue] of this.topicQueues.entries()) {
      result.push({
        topic,
        size: queue.length,
      });
    }
    return result;
  }

  /**
   * 取消订阅 topic（取消订阅并清理队列）
   * @param {string} topic - 主题名称
   */
  async pubsubUnsubscribe(topic) {
    if (!this.subscriptions.has(topic)) {
      return { canceled: false, message: '未订阅此主题' };
    }

    try {
      // 调用 subscribe 返回的取消订阅函数
      const unsubFn = this.subscriptions.get(topic);
      if (typeof unsubFn === 'function') {
        await unsubFn();
      }

      this.subscriptions.delete(topic);
      this.topicQueues.delete(topic);

      console.log(`📤 已取消订阅: ${topic}`);
      return { canceled: true };
    } catch (error) {
      console.error('取消订阅失败:', error.message);
      return { canceled: false, message: error.message };
    }
  }
}

// 创建单例
const ipfsClient = new IPFSClient();

// 导出 ipfsClient 供其他模块（如 PubSubAggregator）使用
export { ipfsClient };
// ========== 兼容现有 ipfsService 接口 ==========

const ipfsService = {
  /**
   * 上传图片到 IPFS 并将元数据保存到 Go OrbitDB
   * @param {string} base64Data - base64 编码的图片数据（不含 data:image/xxx;base64, 前缀）
   * @param {string} mimeType - MIME 类型，如 image/png、image/jpeg
   * @param {Object} [extraMeta={}] - 额外的元数据字段（如 companyId 等）
   * @returns {Promise<{cid: string, size: number, mimeType: string}>}
   */
  async uploadImage(base64Data, mimeType, extraMeta = {}) {
    console.log(`🖼️ 正在上传图片到 IPFS: ${mimeType}`);

    try {
      // 1. 将 base64 解码为 Uint8Array 并上传到 IPFS
      const buffer = base64ToUint8Array(base64Data);
      const result = await ipfsClient.upload(buffer);
      const cid = result.cid;

      console.log(`✅ 图片已保存到 IPFS - CID: ${cid}, 大小: ${result.size} bytes`);

      // 2. 将图片元数据存入 Go OrbitDB（images 数据库）
      const meta = {
        _id: cid,
        type: 'image',
        mimeType: mimeType || 'image/png',
        size: result.size,
        timestamp: Date.now(),
        ...extraMeta,
      };

      try {
        await backendClient.dbNamedPut('images', meta);
        console.log(`💾 图片元数据已保存到 OrbitDB images 数据库 - CID: ${cid}`);
      } catch (orbitError) {
        // 元数据保存失败不应阻止图片上传成功，仅记录警告
        console.error('⚠️ OrbitDB 元数据保存失败（不影响 IPFS 上传）:', orbitError.message);
      }

      return {
        cid,
        size: result.size,
        mimeType: meta.mimeType,
      };
    } catch (error) {
      console.error('❌ 图片上传失败:', error.message);
      throw new Error(`图片上传失败：${error.message}`);
    }
  },

  /**
   * 保存 Markdown 文档到 IPFS
   * @param {string} id - 文档 ID（用于日志，不作为 CID）
   * @param {string} content - Markdown 内容
   * @param {boolean} isPublic - 是否公开
   * @param {Array<string>} tags - 标签数组
   * @param {string|Object} category - 分类
   * @param {string} title - 文档标题
   * @param {string} companyId - 关联的公司 ID
   * @param {string} author - 作者姓名
   * @param {Object} [owner] - 数字签名归属信息（{ publicKey, signature, algorithm, timestamp }）
   * @returns {Promise<string>} - 返回 CID
   */
  async saveMarkdown(id, content, isPublic, tags, category, title, companyId, author, owner) {
    console.log(`📝 正在保存文档到 IPFS: ${title || id}`);

    // 构建完整的文档数据对象（含元数据）
    const docData = JSON.stringify({
      id,
      title: title || '无标题',
      content,
      isPublic: !!isPublic,
      tags: Array.isArray(tags) ? tags : [],
      category: category,
      companyId: companyId || '',
      author: author || 'anonymous',
      owner: owner || null,
      timestamp: Date.now(),
      version: '1.0',
    });

    try {
      const result = await ipfsClient.upload(docData);
      console.log(`✅ 文档已保存到 IPFS - CID: ${result.cid}, 大小: ${result.size} bytes`);

      // 订阅 test_up_cid_12345 主题（接收他人发布的消息）
      try {
        await ipfsClient.pubsubSubscribe('test_up_cid_12345');
      } catch (subError) {
        console.error('⚠️ PubSub 订阅失败（不影响保存）:', subError.message);
      }

      // 将 CID 发布到 PubSub 主题
      try {
        await ipfsClient.pubsubPublish('test_up_cid_12345', {
          cid: result.cid,
          title: title || '无标题',
          timestamp: Date.now(),
        });
        console.log(`📤 CID 已发布到主题 test_up_cid_12345`);
      } catch (pubsubError) {
        console.error('⚠️ PubSub 发布 CID 失败（不影响保存）:', pubsubError.message);
      }

      // // 将 CID 保存到公司专属的 OrbitDB 数据库（数据库名: cifnew-db-{companyId}），以 cid 为 _id
      // if (companyId && result.cid) {
      //   try {
      //     await backendClient.dbCompanyPut(companyId, {
      //       _id: result.cid,
      //       title: title || '无标题',
      //       timestamp: Date.now(),
      //     });
      //     console.log(`💾 CID ${result.cid} 已保存到公司 ${companyId} 的专属 OrbitDB 数据库`);
      //   } catch (orbitError) {
      //     console.error('⚠️ OrbitDB 保存失败（不影响 IPFS 保存）:', orbitError.message);
      //   }
      // }

      // 将 CID 保存到按月组织的 OrbitDB 数据库（数据库名: cifnew-db-month-{YYYY-MM}），以 cid 为 _id
      // 此步骤为索引保存，失败应向上传播以便 UI 显示错误提示
      const month = new Date().toISOString().slice(0, 7);
      console.log("month-------------\n",month);
      await backendClient.dbMonthlyPut(month, {
        _id: result.cid,
        title: title || '无标题',
        companyId: companyId || '',
        owner: owner || null,
        timestamp: Date.now(),
      });
      console.log(`📅 CID ${result.cid} 已保存到月份 ${month} 的 OrbitDB 数据库`);

      return result.cid;
    } catch (error) {
      console.error('❌ IPFS 保存失败:', error.message);
      throw error; // 向上抛出异常，让调用方（documentService）决定如何处理
    }
  },

  /**
   * 从 IPFS 读取文档
   * @param {string} cid - 内容标识符
   * @returns {Promise<Object|null>} - 返回解析后的文档对象，或 null
   */
  async getMarkdown(cid) {
    try {
      const data = await ipfsClient.read(cid);
      const docData = JSON.parse(data);

      console.log(`✅ 已从 IPFS 读取文档 - CID: ${cid}`);
      return {
        id: docData.id,
        title: docData.title,
        content: docData.content,
        isPublic: docData.isPublic,
        tags: docData.tags,
        category: docData.category,
        companyId: docData.companyId || '',
        author: docData.author || 'anonymous',
        owner: docData.owner || null,
        timestamp: docData.timestamp,
      };
    } catch (error) {
      console.error('❌ IPFS 读取失败:', error.message);
      return null;
    }
  },
};

export default ipfsService;