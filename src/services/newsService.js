/**
 * 新闻数据服务
 *
 * 直接拉取公开 RSS（免 Key），供首页 BigSearch 的「新闻」下拉栏使用。
 * 数据源均已确认支持浏览器跨域（Access-Control-Allow-Origin: *）：
 * - 中国新闻网：财经 / 即时 / 教育
 * - 少数派
 *
 * 如果后续需要 36氪、澎湃等源，或对方收紧 CORS，
 * 只需把本文件内部改为调用后端 /api/news，组件层无需改动。
 */

export const NEWS_FEEDS = [
  { name: '中新网财经', url: 'https://www.chinanews.com.cn/rss/finance.xml' },
  { name: '中新网即时', url: 'https://www.chinanews.com.cn/rss/scroll-news.xml' },
  { name: '中新网教育', url: 'https://www.chinanews.com.cn/rss/edu.xml' },
  { name: '少数派', url: 'https://sspai.com/feed' },
];

const CACHE_TTL = 5 * 60 * 1000; // 5 分钟内存缓存
const REQUEST_TIMEOUT = 8000; // 单个源 8 秒超时

let cache = { items: [], updatedAt: 0, errors: [] };

/** 去除 HTML 标签，保留纯文本（用于标题/摘要） */
const stripHtml = (html = '') => {
  if (!html) return '';
  if (typeof DOMParser === 'undefined') {
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return (doc.body.textContent || '').replace(/\s+/g, ' ').trim();
};

/** 按候选标签名依次取第一个非空文本节点 */
const firstText = (node, names) => {
  for (let i = 0; i < names.length; i += 1) {
    const el = node.getElementsByTagName(names[i])[0];
    if (el && el.textContent && el.textContent.trim()) {
      return el.textContent.trim();
    }
  }
  return '';
};

const parseDate = (value) => {
  if (!value) return Date.now();
  const ts = Date.parse(value);
  return Number.isNaN(ts) ? Date.now() : ts;
};

/** 兼容 RSS 的 <link>文本</link> 与 Atom 的 <link href="..." /> */
const pickLink = (node) => {
  const linkNodes = node.getElementsByTagName('link');
  for (let i = 0; i < linkNodes.length; i += 1) {
    const text = (linkNodes[i].textContent || '').trim();
    if (text) return text;
  }
  for (let i = 0; i < linkNodes.length; i += 1) {
    const href = linkNodes[i].getAttribute('href');
    if (href) return href;
  }
  return '';
};

/** 解析 RSS 2.0 / Atom，返回统一结构 */
const parseFeed = (xmlText, feed) => {
  const doc = new DOMParser().parseFromString(xmlText, 'text/xml');
  if (doc.getElementsByTagName('parsererror').length > 0) {
    throw new Error(`${feed.name} RSS 解析失败`);
  }

  const nodes = [
    ...Array.from(doc.getElementsByTagName('item')),
    ...Array.from(doc.getElementsByTagName('entry')),
  ];

  return nodes
    .map((node) => {
      const url = pickLink(node);
      const title = stripHtml(firstText(node, ['title']));
      const summary = stripHtml(firstText(node, ['description', 'summary', 'content']));
      const publishedAt = parseDate(
        firstText(node, ['pubDate', 'dc:date', 'published', 'updated'])
      );

      return {
        id: url || `${feed.name}-${title}`,
        title,
        summary,
        source: feed.name,
        url,
        publishedAt,
      };
    })
    .filter((item) => item.title && item.url);
};

const fetchFeed = async (feed) => {
  const hasAbort = typeof AbortController !== 'undefined';
  const controller = hasAbort ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), REQUEST_TIMEOUT) : null;

  try {
    const options = {
      headers: {
        // Accept 属于 CORS 安全列表请求头，不会触发预检
        Accept: 'application/rss+xml, application/xml, text/xml, */*',
      },
    };
    if (controller) options.signal = controller.signal;

    const response = await fetch(feed.url, options);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    return parseFeed(await response.text(), feed);
  } finally {
    if (timer) clearTimeout(timer);
  }
};

const normalizeUrl = (url = '') => url.replace(/[#?].*$/, '').trim();

/** 按 URL 去重（保留较新的一条），并按发布时间倒序 */
const mergeItems = (items) => {
  const map = new Map();
  items.forEach((item) => {
    const key = normalizeUrl(item.url) || item.title;
    const prev = map.get(key);
    if (!prev || item.publishedAt > prev.publishedAt) {
      map.set(key, item);
    }
  });
  return Array.from(map.values()).sort((a, b) => b.publishedAt - a.publishedAt);
};

/**
 * 获取新闻列表
 * @param {Object} [options]
 * @param {number} [options.limit=8] 返回条数
 * @param {boolean} [options.force=false] 忽略缓存，强制刷新
 * @returns {Promise<{items: Array, updatedAt: number, errors: string[], stale: boolean}>}
 */
export const fetchNews = async ({ limit = 8, force = false } = {}) => {
  const now = Date.now();
  if (!force && cache.items.length > 0 && now - cache.updatedAt < CACHE_TTL) {
    return {
      items: cache.items.slice(0, limit),
      updatedAt: cache.updatedAt,
      errors: cache.errors,
      stale: false,
    };
  }

  const results = await Promise.allSettled(NEWS_FEEDS.map((feed) => fetchFeed(feed)));
  const errors = [];
  const merged = [];

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      merged.push(...result.value);
    } else {
      const reason = result.reason && result.reason.message ? result.reason.message : '加载失败';
      errors.push(`${NEWS_FEEDS[index].name}: ${reason}`);
    }
  });

  const items = mergeItems(merged);

  // 全部源失败时沿用上一次成功缓存，避免浮层直接变空
  if (items.length === 0 && cache.items.length > 0) {
    return {
      items: cache.items.slice(0, limit),
      updatedAt: cache.updatedAt,
      errors,
      stale: true,
    };
  }

  cache = { items, updatedAt: now, errors };
  return { items: items.slice(0, limit), updatedAt: now, errors, stale: false };
};

/** 清空内存缓存（测试用） */
export const clearNewsCache = () => {
  cache = { items: [], updatedAt: 0, errors: [] };
};
