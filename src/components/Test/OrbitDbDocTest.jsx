import React, { useState, useCallback } from 'react';
import backendClient from '../../services/backendClient';

/**
 * OrbitDB 文档操作测试页面
 *
 * 测试后端 API:
 *   POST /api/db/put  — 写入文档（_id可选，后端自动生成）
 *   GET  /api/db/all  — 读取所有文档
 *
 * 路由: /test/orbitdb-doc
 */
const OrbitDbDocTest = () => {
  const defaultDoc = () => ({
    _id: `doc-${Date.now()}`,
    title: '测试文档',
    content: 'Hello OrbitDB',
    type: 'general',
    tags: ['test', 'demo'],
    timestamp: Date.now(),
  });

  const [docJson, setDocJson] = useState(() =>
    JSON.stringify(defaultDoc(), null, 2)
  );

  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePut = useCallback(async () => {
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      let doc;
      try {
        doc = JSON.parse(docJson);
      } catch {
        setError('❌ JSON格式错误，请检查语法');
        setLoading(false);
        return;
      }
      if (typeof doc !== 'object' || Array.isArray(doc)) {
        setError('❌ 文档必须是一个对象（Object）');
        setLoading(false);
        return;
      }
      const res = await backendClient.dbPut(doc);
      setResult({ type: 'put', label: 'POST /api/db/put', data: res });
    } catch (err) {
      setError(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [docJson]);

  const handleGetAll = useCallback(async () => {
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const docs = await backendClient.dbAll();
      setResult({ type: 'all', label: 'GET /api/db/all', data: docs });
    } catch (err) {
      setError(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleResetDoc = useCallback(() => {
    setDocJson(JSON.stringify(defaultDoc(), null, 2));
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        🧪 OrbitDB 文档操作测试
      </h1>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <label className="block text-sm font-medium text-gray-700">
            文档 JSON（<code>_id</code> 可选，后端自动生成）
          </label>
          <button onClick={handleResetDoc} className="text-xs text-blue-600 hover:text-blue-800 underline">
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

      <div className="flex flex-wrap gap-3 mb-6">
        <button onClick={handlePut} disabled={loading}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg
                     hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors font-medium">
          {loading ? '⏳ 请求中...' : '📥 PUT（写入文档）'}
        </button>
        <button onClick={handleGetAll} disabled={loading}
          className="px-5 py-2.5 bg-green-600 text-white rounded-lg
                     hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors font-medium">
          {loading ? '⏳ 请求中...' : '📄 GET ALL（获取所有文档）'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-300 rounded-lg text-red-700">{error}</div>
      )}

      {result && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-gray-800">✅ {result.label}</h2>
            <span className="text-xs text-gray-400">
              {Array.isArray(result.data) ? `共 ${result.data.length} 条记录` : ''}
            </span>
          </div>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm leading-relaxed max-h-96 overflow-y-auto">
            {JSON.stringify(result.data, null, 2)}
          </pre>
        </div>
      )}

      {result && result.type === 'all' && Array.isArray(result.data) && result.data.length === 0 && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-300 rounded-lg text-yellow-700">
          ⚠️ OrbitDB 中暂无文档数据
        </div>
      )}
    </div>
  );
};

export default OrbitDbDocTest;
