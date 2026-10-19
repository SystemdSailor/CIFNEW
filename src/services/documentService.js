/**
 * 文档服务 - 统一的文档 CRUD 操作接口
 * 
 * 集中管理 Markdown 文档的保存、加载、删除和列表查询。
 * 整合 gunDB 和 IPFS 的存储逻辑，对外提供简洁一致的 API。
 */
import gunService from './gunDB';
import ipfsService from './ipfsDB';
import signatureService from './signatureService';

/**
 * 构建完整的文档数据对象
 * @param {Object} params - 文档参数字段
 * @param {string} params.id - 文档唯一 ID
 * @param {string} params.title - 文档标题
 * @param {string} params.content - Markdown 内容
 * @param {Array<string>} params.tags - 标签数组
 * @param {Object} params.category - 分类对象（含 label, id）
 * @param {boolean} params.isPublic - 是否公开
 * @param {Object} [params.owner] - 数字签名归属信息（由签名服务生成）
 * @returns {Object} 完整的文档数据
 */
const buildDocumentData = ({ id, title, content, tags, category, isPublic, companyId, owner }) => {
  if (!id) {
    throw new Error('文档 ID 不能为空');
  }

  // 从本地存储读取已保存的用户信息作为作者
  let author = 'anonymous';
  try {
    const stored = localStorage.getItem('userProfile');
    if (stored) {
      const profile = JSON.parse(stored);
      author = profile.name || 'anonymous';
    }
  } catch (err) {
    // 读取失败时保持默认作者
  }

  return {
    id,
    title: title || '无标题',
    content: content || '',
    tagObject: Array.isArray(tags) ? tags.join('+') : '',
    category: category,
    isPublic: !!isPublic,
    companyId: companyId || '',
    author,
    owner: owner || null,
    timestamp: Date.now(),
  };
};

/**
 * 清洗文档列表数据（从 gunDB 获取的原始数据转为前端可用格式）
 * @param {Array} rawList - gunDB 原始文档列表
 * @returns {Array<Object>} 清洗后的文档列表
 */
const sanitizeDocumentList = (rawList) => {
  if (!Array.isArray(rawList)) return [];

  return rawList
    .filter((doc) => doc && doc.id && doc.id !== '_')
    .map((doc) => ({
      id: doc.id,
      title: doc.title || '无标题',
      content: doc.content || '',
      tagObject: doc.tagObject || '',
      category: doc.category || '未分类',
      isPublic: !!doc.isPublic,
      companyId: doc.companyId || '',
      author: doc.author || 'anonymous',
      owner: doc.owner || null,
      timestamp: doc.timestamp || Date.now(),
    }));
};

const documentService = {
  /**
   * 保存文档
   * 
   * 将文档数据依次保存到：
   * 1. gunDB（实时数据库，用于文档索引和快速查询）
   * 2. IPFS（去中心化存储，用于持久化内容）
   * 
   * @param {Object} docParams - 文档参数
   * @param {string} docParams.id - 文档唯一 ID
   * @param {string} docParams.title - 文档标题
   * @param {string} docParams.content - Markdown 内容
   * @param {Array<string>} [docParams.tags=[]] - 标签数组
   * @param {Object} [docParams.category={}] - 分类对象
   * @param {boolean} [docParams.isPublic=false] - 是否公开
   * @returns {Promise<{success: boolean, cid: string|null, message: string}>}
   * 
   * @example
   * const result = await documentService.save({
   *   id: 'uuid-xxx',
   *   title: '我的文档',
   *   content: '# Markdown Content',
   *   tags: ['React', '教程'],
   *   category: { label: '技术笔记', id: '1' },
   *   isPublic: true,
   * });
   * // result = { success: true, cid: 'Qm...', message: '文档已保存并发布' }
   */
  save: async (docParams) => {
    console.log('========== documentService.save ==========');
    console.log('文档参数:', docParams);

    // // 1. 参数校验
    // if (!docParams || !docParams.id) {
    //   console.error('保存失败：缺少文档 ID');
    //   return {
    //     success: false,
    //     cid: null,
    //     message: '保存失败：缺少文档 ID',
    //   };
    // }
    docParams.id = "1234567890";
    try {
      // 2. 构建完整文档数据
      const docData = buildDocumentData(docParams);
      console.log('文档数据:', docData);

      // 2.5 生成当前用户的数字签名归属信息（owner）
      let owner = null;
      try {
        owner = await signatureService.createOwner({
          author: docData.author,
          content: docData.content,
          timestamp: docData.timestamp,
        });
        docData.owner = owner;
      } catch (sigError) {
        console.error('⚠️ 生成 owner 数字签名失败（不影响保存）:', sigError.message);
      }

      // // 3. 保存到 gunDB（索引与元数据）
      // await gunService.saveMarkdown(
      //   docData.id,
      //   docData.content,
      //   docData.isPublic,
      //   docParams.tags || [],
      //   docData.category,
      //   docData.title
      // );

      // 4. 保存到 IPFS（内容持久化 + 索引写入 OrbitDB）
      let cid = null;
      try {
        cid = await ipfsService.saveMarkdown(
          docData.id,
          docData.content,
          docData.isPublic,
          docParams.tags || [],
          docData.category,
          docData.title,
          docData.companyId,
          docData.author,
          docData.owner
        );
        console.log('IPFS CID:', cid);

        // 5. 将 IPFS CID 关联到 gunDB
        if (cid) {
          // await gunService.saveCIDToIPFS(docData.id, cid);
        }
      } catch (ipfsError) {
        console.error('❌ IPFS/索引保存失败:', ipfsError);
        console.log('==========================================');
        return {
          success: false,
          cid: null,
          message: `IPFS 内容已保存失败：${ipfsError.message || '未知错误'}`,
        };
      }

      // 6. 返回结果
      const isPublic = docData.isPublic;
      const message = isPublic ? '文档已保存并发布' : '文档已保存';
      console.log('保存成功:', message, 'CID:', cid);
      console.log('==========================================');

      return {
        success: true,
        cid,
        message,
      };
    } catch (error) {
      console.error('文档保存失败:', error);
      return {
        success: false,
        cid: null,
        message: `保存失败：${error.message || '未知错误'}`,
      };
    }
  },

  /**
   * 加载单个文档
   * @param {string} id - 文档 ID
   * @returns {Promise<Object|null>} 文档数据对象，不存在则返回 null
   */
  load: async (id) => {
    if (!id) {
      console.error('加载文档失败：缺少文档 ID');
      return null;
    }

    try {
      const doc = await gunService.getMarkdown(id);
      if (!doc) return null;

      return {
        id: doc.id,
        title: doc.title || '',
        content: doc.content || '',
        tagObject: doc.tagObject || '',
        category: doc.category || '',
        isPublic: doc.isPublic || false,
        companyId: doc.companyId || '',
        author: doc.author || 'anonymous',
        owner: doc.owner || null,
        timestamp: doc.timestamp || Date.now(),
      };
    } catch (error) {
      console.error('加载文档失败:', error);
      return null;
    }
  },

  /**
   * 删除文档
   * @param {string} id - 文档 ID
   * @returns {Promise<{success: boolean, message: string}>}
   */
  delete: async (id) => {
    if (!id) {
      return {
        success: false,
        message: '删除失败：缺少文档 ID',
      };
    }

    try {
      await gunService.deleteMarkdown(id);
      return {
        success: true,
        message: '文档已删除',
      };
    } catch (error) {
      console.error('删除文档失败:', error);
      return {
        success: false,
        message: `删除失败：${error.message || '未知错误'}`,
      };
    }
  },

  /**
   * 获取所有文档列表
   * @returns {Promise<Array<Object>>} 文档列表数组
   */
  getAllDocuments: async () => {
    try {
      const rawList = await gunService.getAllArticles();
      return sanitizeDocumentList(rawList);
    } catch (error) {
      console.error('获取文档列表失败:', error);
      return [];
    }
  },

  /**
   * 从标签字符串解析为标签数组
   * @param {string} tagObject - 以 '+' 分隔的标签字符串
   * @returns {Array<string>} 标签数组
   */
  parseTags: (tagObject) => {
    if (!tagObject) return [];
    return tagObject.split('+').filter((tag) => tag.trim() !== '');
  },

  /**
   * 创建新文档 ID
   * 注意：导入 uuid 会带来额外依赖，此处直接由调用方传入
   * 该方法仅为接口占位，统一文档创建入口
   * @returns {null} 返回 null，由调用方使用 uuid
   */
  createDocument: () => {
    return null; // 由 MarkdownEditor 使用 uuidv4()
  },
};

export default documentService;