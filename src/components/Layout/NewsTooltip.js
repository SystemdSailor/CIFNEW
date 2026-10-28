import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faRotate, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { fetchNews } from '../../services/newsService';

const formatRelativeTime = (timestamp) => {
  if (!timestamp) return '—';

  const diff = Date.now() - timestamp;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return '刚刚';
  if (diff < hour) return `${Math.floor(diff / minute)} 分钟前`;
  if (diff < day) return `${Math.floor(diff / hour)} 小时前`;
  if (diff < 7 * day) return `${Math.floor(diff / day)} 天前`;

  return new Date(timestamp).toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
  });
};

const formatClock = (timestamp) => {
  if (!timestamp) return '—';
  return new Date(timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * 首页「新闻」下拉栏
 *
 * 数据来自 newsService.fetchNews()（公开 RSS，免 Key）。
 * 每条新闻为外链，点击后新窗口打开原文。
 */
const NewsTooltip = ({ onClose, limit = 8 }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [warnings, setWarnings] = useState([]);
  const [updatedAt, setUpdatedAt] = useState(null);
  const mountedRef = useRef(true);

  const load = useCallback(
    async (force = false) => {
      setLoading(true);
      setError('');

      try {
        const data = await fetchNews({ limit, force });
        if (!mountedRef.current) return;

        const nextItems = Array.isArray(data.items) ? data.items : [];
        setItems(nextItems);
        setWarnings(Array.isArray(data.errors) ? data.errors : []);
        setUpdatedAt(data.updatedAt || Date.now());

        if (nextItems.length === 0) {
          setError(
            data.errors && data.errors.length
              ? '新闻源暂时不可用，请稍后重试'
              : '暂无新闻'
          );
        }
      } catch (err) {
        if (!mountedRef.current) return;
        console.error('新闻加载失败:', err);
        setError('新闻加载失败，请稍后重试');
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    },
    [limit]
  );

  useEffect(() => {
    mountedRef.current = true;
    load();
    return () => {
      mountedRef.current = false;
    };
  }, [load]);

  return (
    <div
      role="dialog"
      aria-label="新闻资讯"
      className="absolute top-full left-0 mt-2 w-[480px] bg-white rounded-xl shadow-2xl border border-gray-200 p-5 z-[9999]"
      style={{ transform: 'translateX(-40%)' }}
    >
      {/* 标题 + 刷新 */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-gray-900">📰 新闻资讯</h3>
          <p className="text-xs text-gray-500 mt-0.5">中新网 / 少数派 · 实时更新</p>
        </div>
        <button
          type="button"
          onClick={() => load(true)}
          disabled={loading}
          className="flex-shrink-0 inline-flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 disabled:opacity-50 transition-colors"
        >
          <FontAwesomeIcon icon={faRotate} spin={loading} />
          刷新
        </button>
      </div>

      {loading ? (
        <div className="py-10 text-center text-gray-400 text-sm">
          <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
          加载中...
        </div>
      ) : error && items.length === 0 ? (
        <div className="py-8 text-center">
          <div className="text-sm text-gray-400 mb-3">{error}</div>
          <button
            type="button"
            onClick={() => load(true)}
            className="px-4 py-1.5 rounded-lg text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          >
            重试
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="py-10 text-center text-gray-400 text-sm">暂无新闻</div>
      ) : (
        <ul className="divide-y divide-gray-100 max-h-[360px] overflow-y-auto">
          {items.map((item) => (
            <li key={item.id || item.url}>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className="block py-2.5 px-1 rounded-lg hover:bg-gray-50 transition-colors"
                title={item.title}
              >
                <div className="text-sm font-medium text-gray-800 leading-snug line-clamp-2">
                  {item.title}
                </div>
                <div className="mt-1 flex items-center gap-3 text-[11px] text-gray-400">
                  <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-600">
                    {item.source}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <FontAwesomeIcon icon={faClock} />
                    {formatRelativeTime(item.publishedAt)}
                  </span>
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}

      {/* 底部信息 */}
      <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
        <span className="text-[10px] text-gray-400">
          共 {items.length} 条
          {warnings.length > 0 && !loading ? ' · 部分源不可用' : ''}
        </span>
        <span className="text-[10px] text-gray-300">
          更新于 {formatClock(updatedAt)}
        </span>
      </div>
    </div>
  );
};

export default NewsTooltip;
