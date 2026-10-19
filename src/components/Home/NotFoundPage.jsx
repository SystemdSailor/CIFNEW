import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-300 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">
          页面未找到
        </h2>
        <p className="text-gray-500 mb-8 max-w-md">
          抱歉，您要访问的页面不存在或已被移除。请检查输入的网址是否正确。
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md"
        >
          返回首页
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;