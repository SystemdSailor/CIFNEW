import React, { useState, useEffect } from 'react';
import backendClient from '../../services/backendClient';

/**
 * Orbit Server (Go 后端) 综合测试页面
 *
 * 测试 orbit-server 提供的全部 API 端点:
 *   GET  /api/ping         — 健康检查
 *   GET  /api/p2p/status   — P2P 节点状态
 *   GET  /api/p2p/peers    — 对等节点列表
 *   GET  /api/dbs          — 数据库列表
 *   POST /api/db/{name}/put    — 写入文档（指定数据库）
 *   GET  /api/db/{name}/get/id — 按 ID 获取文档
 *   GET  /api/db/{name}/all    — 获取所有文档
 *
 * 路由: /test/orbit-server
 */
const OrbitServerTest = () => {
  const [results, setResults] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState({});

  // ---- 数据库名称状态 ----
  const [dbList, setDbList] = useState([]);
  const [dbName, setDbName] = useState('');
  const [dbCustom, setDbCustom] = useState('');

  // ---- 文档操作状态 ----
  const defaultDoc = () => ({
    _id: `go-doc-${Date.now()}`,
    title: 'Go OrbitDB 测试文档',
    content: '通过 orbit-server (Go) 写入的数据',
    tags: ['go', 'orbitdb', 'test'],
    timestamp: Date.now(),
  });

  const [docJson, setDocJson] = useState(() =>
    JSON.stringify(defaultDoc(), null, 2)
  );
  const [getDocId, setGetDocId] = useState('');

  // ---- 页面加载时获取数据库列表 ----
  useEffect(() => {
    const fetchDBs = async () => {
      try {
        const data = await backendClient.fetchDBs();
        const names = Array.isArray(data) ? data : [];
        setDbList(names);
        if (names.length > 0 && !dbName && !dbCustom) {
          setDbName(names[0]);
        }
      } catch (err) {
        // 如果获取失败，用户仍可手动输入
        console.warn('获取数据库列表失败，可手动输入数据库名称', err.message);
      }
    };
    fetchDBs();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- 获取最终使用的数据库名称 ----
  const getEffectiveDbName = () => dbCustom.trim() || dbName;

  // ---- 通用请求包装 ----
  const doRequest = async (label, fn) => {
    setError(null);
    setResults(prev => ({ ...prev, [label]: null }));
    setLoading(prev => ({ ...prev, [label]: true }));
    try {
      const data = await fn();
      setResults(prev => ({ ...prev, [label]: data }));
    } catch (err) {
      setError(`[${label}] ${err.message}`);
    } finally {
      setLoading(prev => ({ ...prev, [label]: false }));
    }
  };

  // ---- 各端点操作 ----
  const handlePing = () => {
    doRequest('ping', () => backendClient.ping());
  };

  const handleStatus = () => {
    doRequest('status', () => backendClient.getStatus());
  };

  const handlePeers = () => {
    doRequest('peers', () => backendClient.getPeers());
  };

  const handlePut = async () => {
    const name = getEffectiveDbName();
    if (!name) {
      setError('[PUT] ❌ 请选择或输入数据库名称');
      return;
    }
    setError(null);
    setLoading(prev => ({ ...prev, put: true }));
    try {
      let doc;
      try {
        doc = JSON.parse(docJson);
      } catch {
        setError('[PUT] ❌ JSON 格式错误，请检查语法');
        setLoading(prev => ({ ...prev, put: false }));
        return;
      }
      if (typeof doc !== 'object' || Array.isArray(doc)) {
        setError('[PUT] ❌ 文档必须是一个对象（Object）');
        setLoading(prev => ({ ...prev, put: false }));
        return;
      }
      const res = await backendClient.dbNamedPut(name, doc);
      setResults(prev => ({ ...prev, put: res }));
      if (res.id) setGetDocId(res.id);
    } catch (err) {
      setError(`[PUT] ❌ ${err.message}`);
    } finally {
      setLoading(prev => ({ ...prev, put: false }));
    }
  };

  const handleGet = async () => {
    const name = getEffectiveDbName();
    if (!name) {
      setError('[GET] ❌ 请选择或输入数据库名称');
      return;
    }
    if (!getDocId.trim()) {
      setError('[GET] ❌ 请输入文档 ID');
      return;
    }
    setError(null);
    setLoading(prev => ({ ...prev, get: true }));
    try {
      const res = await backendClient.dbNamedGet(name, getDocId.trim());
      setResults(prev => ({ ...prev, get: res }));
    } catch (err) {
      setError(`[GET] ❌ ${err.message}`);
    } finally {
      setLoading(prev => ({ ...prev, get: false }));
    }
  };

  const handleAll = async () => {
    const name = getEffectiveDbName();
    if (!name) {
      setError('[ALL] ❌ 请选择或输入数据库名称');
      return;
    }
    doRequest('all', () => backendClient.dbNamedAll(name));
  };

  const handleResetDoc = () => {
    setDocJson(JSON.stringify(defaultDoc(), null, 2));
  };

  // ---- 辅助渲染 ----
  const resultBlock = (label, title, tip) => {
    const data = results[label];
    const isLoading = loading[label];
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
          {tip && <span className="text-xs text-gray-400">{tip}</span>}
        </div>
        {isLoading && (
          <div className="text-sm text-blue-600">⏳ 请求中...</div>
        )}
        {!isLoading && data !== undefined && data !== null && (
          <pre className="bg-gray-800 text-green-300 p-3 rounded-lg overflow-x-auto text-xs leading-relaxed max-h-40 overflow-y-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
        {!isLoading && data === undefined && (
          <div className="text-sm text-gray-400">尚未请求</div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2 text-gray-800">
        🚀 Orbit Server (Go) 综合测试
      </h1>
      <p className="text-gray-500 mb-6 text-sm">
        测试 orbit-server (Go 后端) 的全部 API 端点，确保与前端 backendClient 兼容。
        {' '}后端地址: <code className="bg-gray-100 px-1 rounded">{process.env.REACT_APP_HELIA_URL || 'http://localhost:3456'}</code>
      </p>

      {/* ============ 数据库选择区 ============ */}
      <section className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          🗄️ OrbitDB 数据库选择
        </h2>
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs text-gray-500 mb-1">
              已有数据库（自动加载）
            </label>
            <select
              value={dbName}
              onChange={(e) => setDbName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
              disabled={dbList.length === 0}
            >
              {dbList.length === 0 ? (
                <option value="">暂无可用数据库</option>
              ) : (
                dbList.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))
              )}
            </select>
          </div>
          <div className="text-sm text-gray-400 pb-2">或</div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs text-gray-500 mb-1">
              手动输入数据库名称
            </label>
            <input
              type="text"
              value={dbCustom}
              onChange={(e) => setDbCustom(e.target.value)}
              placeholder="例如: month/2025-06"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          当前目标数据库: <code className="bg-blue-100 px-1 rounded font-mono">{getEffectiveDbName() || '(未选择)'}</code>
        </div>
      </section>

      {/* ============ 节点 & P2P 测试区 ============ */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
          🌐 节点 & P2P
        </h2>
        <div className="flex flex-wrap gap-2 mb-4">
          <button onClick={handlePing} disabled={loading.ping}
            className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg
                       hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {loading.ping ? '⏳' : '🏓 Ping'}
          </button>
          <button onClick={handleStatus} disabled={loading.status}
            className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg
                       hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {loading.status ? '⏳' : '📊 节点状态'}
          </button>
          <button onClick={handlePeers} disabled={loading.peers}
            className="px-4 py-2 bg-teal-600 text-white text-sm rounded-lg
                       hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {loading.peers ? '⏳' : '👥 对等节点'}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {resultBlock('ping', '🏓 Ping /api/ping', '健康检查')}
          {resultBlock('status', '📊 Status /api/p2p/status', '节点 PeerID & 连接数')}
          {resultBlock('peers', '👥 Peers /api/p2p/peers', '已连接的对等节点列表')}
        </div>
      </section>

      {/* ============ 文档操作测试区 ============ */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
          📄 OrbitDB 文档操作
        </h2>

        {/* PUT */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            📥 PUT /api/db/<span className="text-blue-600">{'{name}'}</span>/put — 写入文档
          </h3>
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs text-gray-500">文档 JSON</label>
              <button onClick={handleResetDoc}
                className="text-xs text-blue-600 hover:text-blue-800 underline">
                重置示例
              </button>
            </div>
            <textarea
              value={docJson}
              onChange={(e) => setDocJson(e.target.value)}
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         font-mono text-sm text-gray-800"
            />
          </div>
          <button onClick={handlePut} disabled={loading.put}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg
                       hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {loading.put ? '⏳ 写入中...' : '📥 写入文档'}
          </button>
          {results.put && (
            <div className="mt-3">
              <pre className="bg-gray-800 text-green-300 p-3 rounded-lg overflow-x-auto text-xs leading-relaxed max-h-32 overflow-y-auto">
                {JSON.stringify(results.put, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* GET */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            🔍 GET /api/db/<span className="text-blue-600">{'{name}'}</span>/get/{'{id}'} — 按 ID 查询
          </h3>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={getDocId}
              onChange={(e) => setGetDocId(e.target.value)}
              placeholder="文档 _id（PUT 成功后自动填入）"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <button onClick={handleGet} disabled={loading.get}
              className="px-4 py-2 bg-amber-600 text-white text-sm rounded-lg
                         hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap">
              {loading.get ? '⏳' : '🔍 查询'}
            </button>
          </div>
          {results.get !== undefined && results.get !== null && (
            <pre className="bg-gray-800 text-green-300 p-3 rounded-lg overflow-x-auto text-xs leading-relaxed max-h-32 overflow-y-auto">
              {JSON.stringify(results.get, null, 2)}
            </pre>
          )}
        </div>

        {/* ALL */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            📄 GET /api/db/<span className="text-blue-600">{'{name}'}</span>/all — 获取所有文档
          </h3>
          <button onClick={handleAll} disabled={loading.all}
            className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg
                       hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {loading.all ? '⏳ 获取中...' : '📄 获取全部'}
          </button>
          {results.all && (
            <div className="mt-3">
              <div className="text-xs text-gray-400 mb-1">
                共 {Array.isArray(results.all) ? results.all.length : 0} 条记录
              </div>
              <pre className="bg-gray-800 text-green-300 p-3 rounded-lg overflow-x-auto text-xs leading-relaxed max-h-40 overflow-y-auto">
                {JSON.stringify(results.all, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </section>

      {/* ============ 错误提示 ============ */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-300 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}
    </div>
  );
};

export default OrbitServerTest;