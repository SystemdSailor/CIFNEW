import React from 'react';

const CompanySearchBar = () => {
  return (
    <div className="bg-gradient-to-r from-blue-700 to-cyan-500 py-20 flex justify-center">
      
      <div className="backdrop-blur-md bg-white/30 rounded-3xl px-6 py-5 flex items-center gap-4 shadow-xl w-[1000px]">

        {/* 关键词 */}
        <div className="flex flex-col flex-1">
          <span className="text-xs text-gray-700 mb-1">公司 / 关键词</span>
          <input
            type="text"
            placeholder="请输入公司名称或关键词"
            className="bg-transparent outline-none text-lg font-semibold placeholder-gray-500"
          />
        </div>

        {/* 分隔线 */}
        <div className="h-10 w-px bg-gray-300"></div>

        {/* 行业 */}
        <div className="flex flex-col flex-1">
          <span className="text-xs text-gray-700 mb-1">行业</span>
          <select className="bg-transparent outline-none text-lg font-semibold text-gray-700">
            <option>全部行业</option>
            <option>互联网</option>
            <option>金融</option>
            <option>制造业</option>
            <option>医疗</option>
          </select>
        </div>

        {/* 分隔线 */}
        <div className="h-10 w-px bg-gray-300"></div>

        {/* 地区 */}
        <div className="flex flex-col flex-1">
          <span className="text-xs text-gray-700 mb-1">地区</span>
          <select className="bg-transparent outline-none text-lg font-semibold text-gray-700">
            <option>全国</option>
            <option>北京</option>
            <option>上海</option>
            <option>深圳</option>
          </select>
        </div>

        {/* 搜索按钮 */}
        <button className="bg-black text-white px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-gray-800 transition">
          🔍 搜索
        </button>
      </div>
    </div>
  );
};

export default CompanySearchBar;