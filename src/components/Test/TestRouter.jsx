import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * 测试路由页面 - 表格结构，用于跳转到不同的测试页面
 *
 * 路由: /test
 */
const TestRouter = () => {
  const navigate = useNavigate();

  const testPages = [
    {
      path: '/test/orbit-server',
      name: 'Orbit Server (Go) 综合测试',
      description: '测试 Go 后端 orbit-server 的全部 API 端点（Ping/P2P/文档CRUD）',
      icon: '🚀',
    },
    {
      path: '/test/orbitdb-doc',
      name: 'OrbitDB 文档操作测试',
      description: '测试 OrbitDB 文档的写入（PUT）和读取（GET ALL）操作',
      icon: '📄',
    },
    {
      path: '/test/monthly-db',
      name: 'OrbitDB 月度数据测试',
      description: '测试按月份分类的 OrbitDB 文档写入与读取',
      icon: '📅',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        🧪 测试路由页面
      </h1>
      <p className="text-gray-600 mb-6">
        点击表格中的测试页面名称进入对应的测试功能页。
      </p>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                测试页面
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                描述
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {testPages.map((page) => (
              <tr
                key={page.path}
                className="hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => navigate(page.path)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="text-xl mr-3">{page.icon}</span>
                    <span className="text-sm font-medium text-gray-900">
                      {page.name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-500">
                    {page.description}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(page.path);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg
                               hover:bg-blue-700 transition-colors font-medium"
                  >
                    进入 →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {testPages.length === 0 && (
        <div className="mt-6 p-6 bg-yellow-50 border border-yellow-300 rounded-lg text-yellow-700 text-center">
          ⚠️ 暂无可用的测试页面
        </div>
      )}
    </div>
  );
};

export default TestRouter;