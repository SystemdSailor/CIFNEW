import React, { useState, useCallback } from 'react';
import backendClient from '../../services/backendClient';

/**
 * OrbitDB 月度数据测试页面
 *
 * 测试后端 API:
 *   POST /api/db/month/:month/put  — 写入月度文档
 *   GET  /api/db/month/:month/all  — 读取月度所有文档
 *
 * 路由: /test/monthly-db
 */
const MonthlyDbTest = () => {
  const [month, setMonth] = useState(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  });

  const defaultDoc = () => ({
    _id: `test-${Date.now()}`,
    title: '测试文档',
    content: 'Hello OrbitDB',
    timestamp: Date.now(),
  });

  const [docJson, setDocJson] = useState(() =>
    JSON.stringify(defaultDoc(), null, 2)
  );

  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  /** PUT: 写入月度文档 */
  const handlePut = useCallback(async () => {
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      let doc;
      try {
        doc = JSON.parse(docJson);
      } catch {
        setError('❌ JSON 格式错误，请检查语法');
        setLoading(false);
        return;
      }

      if (!doc._id) {
        setError('❌ 文档必须包含 _id 字段');
        setLoading(false);
        return;
      }

      const res = await backendClient.dbMonthlyPut(month, doc);
      setResult({ type: 'put', label: `PUT /api/db/month/${month}/put`, data: res });
    } catch (err) {
      setError(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [month, docJson]);

  /** GET ALL: 获取月度所有文档 */
  const handleGetAll = useCallback(async () => {
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const docs = await backendClient.dbMonthlyAll(month);
      setResult({
        type: 'all',
        label: `GET /api/db/month/${month}/all`,
        data: docs,
      });
    } catch (err) {
      setError(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [month]);

  /** 重置为默认文档 */
  const handleResetDoc = useCallback(() => {
    setDocJson(JSON.stringify(defaultDoc(), null, 2));
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        🧪 OrbitDB 月度数据测试
      </h1>

      {/* 月份输入 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          月份（YYYY-MM）
        </label>
        <input
          type="text"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          placeholder="2025-06"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-blue-500
                     text-gray-800"
        />
        <p className="text-xs text-gray-400 mt-1">
          格式: YYYY-MM，例如 2025-06
        </p>
      </div>

      {/* JSON 文档编辑器 */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <label className="block text-sm font-medium text-gray-700">
            文档 JSON（必须包含 _id）
          </label>
          <button
            onClick={handleResetDoc}
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            重置示例
          </button>
        </div>
        <textarea
          value={docJson}
          onChange={(e) => setDocJson(e.target.value)}
          rows={8}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-blue-500
                     font-mono text-sm text-gray-800"
        />
      </div>

      {/* 操作按钮 */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={handlePut}
          disabled={loading}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg
                     hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors font-medium"
        >
          {loading ? '⏳ 请求中...' : '📥 PUT（写入文档）'}
        </button>
        <button
          onClick={handleGetAll}
          disabled={loading}
          className="px-5 py-2.5 bg-green-600 text-white rounded-lg
                     hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors font-medium"
        >
          {loading ? '⏳ 请求中...' : '📄 GET ALL（获取所有文档）'}
        </button>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-300 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* 结果展示 */}
      {result && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-gray-800">
              ✅ {result.label}
            </h2>
            <span className="text-xs text-gray-400">
              {Array.isArray(result.data)
                ? `共 ${result.data.length} 条记录`
                : ''}
            </span>
          </div>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm leading-relaxed max-h-96 overflow-y-auto">
            {JSON.stringify(result.data, null, 2)}
          </pre>
        </div>
      )}

      {/* 空结果提示 */}
      {result && result.type === 'all' && Array.isArray(result.data) && result.data.length === 0 && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-300 rounded-lg text-yellow-700">
          ⚠️ 该月份暂无数据
        </div>
      )}
    </div>
  );
};

export default MonthlyDbTest;
