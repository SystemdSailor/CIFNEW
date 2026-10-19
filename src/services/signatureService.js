/**
 * 签名服务 - 为当前用户生成数字签名
 *
 * 使用浏览器 WebCrypto（ECDSA P-256 + SHA-256）为当前用户生成稳定的密钥对，
 * 并在每次保存文档时对文档内容签名，产出可验证的 owner 归属信息。
 *
 * 密钥对持久化在 localStorage，同一浏览器/用户复用同一身份，保证签名稳定。
 * 零新增依赖，纯 WebCrypto 实现。
 */

export const STORAGE_KEYS = {
  publicKey: 'cifnew.signature.publicKey',   // SPKI base64
  privateKey: 'cifnew.signature.privateKey', // PKCS8 base64
};

const ALGORITHM = {
  name: 'ECDSA',
  namedCurve: 'P-256',
};

const HASH = 'SHA-256';
const SIGN_ALGORITHM = { name: 'ECDSA', hash: HASH };

// ---------- base64 <-> ArrayBuffer 辅助函数 ----------

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// ---------- 密钥对管理 ----------

let cachedKeyPair = null;

/**
 * 获取可用的 WebCrypto subtle 实例（需要 HTTPS 或 localhost 安全上下文）
 */
function getSubtle() {
  const subtle = window.crypto?.subtle;
  if (!subtle) {
    throw new Error('当前环境不支持 WebCrypto（需要 HTTPS 或 localhost 安全上下文）');
  }
  return subtle;
}

async function generateKeyPair() {
  return getSubtle().generateKey(
    ALGORITHM,
    true, // 可导出，用于持久化
    ['sign', 'verify']
  );
}

/**
 * 加载或创建当前用户的密钥对
 * @returns {Promise<{publicKey: CryptoKey, privateKey: CryptoKey}>}
 */
async function getKeyPair() {
  if (cachedKeyPair) return cachedKeyPair;

  const subtle = getSubtle();

  const storedPublic = localStorage.getItem(STORAGE_KEYS.publicKey);
  const storedPrivate = localStorage.getItem(STORAGE_KEYS.privateKey);

  if (storedPublic && storedPrivate) {
    try {
      const publicKey = await subtle.importKey(
        'spki',
        base64ToArrayBuffer(storedPublic),
        ALGORITHM,
        true,
        ['verify']
      );
      const privateKey = await subtle.importKey(
        'pkcs8',
        base64ToArrayBuffer(storedPrivate),
        ALGORITHM,
        true,
        ['sign']
      );
      cachedKeyPair = { publicKey, privateKey };
      return cachedKeyPair;
    } catch (error) {
      console.warn('⚠️ 本地签名密钥导入失败，将重新生成:', error.message);
      localStorage.removeItem(STORAGE_KEYS.publicKey);
      localStorage.removeItem(STORAGE_KEYS.privateKey);
    }
  }

  // 生成新密钥对并持久化
  const keyPair = await generateKeyPair();

  const exportedPublic = await subtle.exportKey('spki', keyPair.publicKey);
  const exportedPrivate = await subtle.exportKey('pkcs8', keyPair.privateKey);

  localStorage.setItem(STORAGE_KEYS.publicKey, arrayBufferToBase64(exportedPublic));
  localStorage.setItem(STORAGE_KEYS.privateKey, arrayBufferToBase64(exportedPrivate));

  cachedKeyPair = keyPair;
  return cachedKeyPair;
}

/**
 * 当前用户公钥（base64, SPKI）——可公开的验证标识
 * @returns {Promise<string>}
 */
async function getCurrentPublicKey() {
  const { publicKey } = await getKeyPair();
  const exported = await getSubtle().exportKey('spki', publicKey);
  return arrayBufferToBase64(exported);
}

/**
 * 导出本地持久化的签名密钥（用于「用户信息 JSON」备份）
 * @returns {{publicKey: string, privateKey: string}} base64(SPKI) / base64(PKCS8)，缺失时为空串
 */
function exportStoredKeys() {
  return {
    publicKey: localStorage.getItem(STORAGE_KEYS.publicKey) || '',
    privateKey: localStorage.getItem(STORAGE_KEYS.privateKey) || '',
  };
}

/**
 * 从备份恢复本地签名密钥，并让内存里的密钥对缓存失效（下次使用会重新从 localStorage 导入）
 * @param {{publicKey?: string, privateKey?: string}} keys
 * @returns {boolean} 是否写入成功（两个 key 均为非空字符串才写入）
 */
function importStoredKeys(keys = {}) {
  const publicKey = typeof keys.publicKey === 'string' ? keys.publicKey.trim() : '';
  const privateKey = typeof keys.privateKey === 'string' ? keys.privateKey.trim() : '';
  if (!publicKey || !privateKey) return false;

  try {
    localStorage.setItem(STORAGE_KEYS.publicKey, publicKey);
    localStorage.setItem(STORAGE_KEYS.privateKey, privateKey);
    cachedKeyPair = null;
    return true;
  } catch (error) {
    console.error('❌ 恢复本地签名密钥失败:', error.message);
    return false;
  }
}

// ---------- 签名 / 验证 ----------

/**
 * 对文档内容计算摘要并签名
 * @param {string} content - 要签名的内容（建议传文档的 id + content + timestamp 组合）
 * @returns {Promise<{publicKey: string, signature: string, algorithm: string}>}
 */
async function signContent(content) {
  const subtle = getSubtle();
  const { privateKey } = await getKeyPair();

  const data = typeof content === 'string'
    ? new TextEncoder().encode(content)
    : content;

  const signature = await subtle.sign(SIGN_ALGORITHM, privateKey, data);
  const publicKey = await getCurrentPublicKey();

  return {
    publicKey,
    signature: arrayBufferToBase64(signature),
    algorithm: 'ECDSA-P256-SHA256',
  };
}

/**
 * 生成文档的 owner 元数据：
 * 对文档提交的唯一内容（id + content + timestamp）签名，返回可验证的归属信息
 * @param {Object} payload - { author, content, timestamp }
 * @returns {Promise<{publicKey: string, signature: string, algorithm: string, timestamp: number}>}
 */
async function createOwner(payload = {}) {
  const { author = '', content = '', timestamp = Date.now() } = payload;
  const canonical = JSON.stringify({ author, content, timestamp });
  const sig = await signContent(canonical);
  return {
    publicKey: sig.publicKey,
    signature: sig.signature,
    algorithm: sig.algorithm,
    timestamp,
  };
}

/**
 * 验证某个 owner 是否对应给定内容的签名（工具方法，供前端校验归属）
 * @param {Object} owner - createOwner 返回的 owner 对象
 * @param {Object} payload - { author, content, timestamp }（timestamp 需与签名时一致）
 * @returns {Promise<boolean>}
 */
async function verifyOwner(owner, payload = {}) {
  if (!owner?.publicKey || !owner?.signature) return false;
  try {
    const subtle = getSubtle();
    const publicKey = await subtle.importKey(
      'spki',
      base64ToArrayBuffer(owner.publicKey),
      ALGORITHM,
      true,
      ['verify']
    );
    const canonical = JSON.stringify({
      author: payload.author || '',
      content: payload.content || '',
      timestamp: owner.timestamp ?? payload.timestamp ?? Date.now(),
    });
    return await subtle.verify(
      SIGN_ALGORITHM,
      publicKey,
      base64ToArrayBuffer(owner.signature),
      new TextEncoder().encode(canonical)
    );
  } catch (error) {
    console.error('❌ owner 验证失败:', error.message);
    return false;
  }
}

const signatureService = {
  getKeyPair,
  getCurrentPublicKey,
  exportStoredKeys,
  importStoredKeys,
  signContent,
  createOwner,
  verifyOwner,
};

export default signatureService;
