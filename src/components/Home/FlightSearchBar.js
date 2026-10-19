import React from 'react';
import { FaExchangeAlt, FaPlaneDeparture, FaPlaneArrival, FaCalendarAlt, FaSearch } from 'react-icons/fa';

const FlightSearchBar = () => {
  return (
    <div className="bg-gradient-to-r from-blue-700 to-cyan-500 py-20 flex justify-center">
      
      {/* 卡片 */}
      <div className="backdrop-blur-md bg-white/30 rounded-3xl px-8 py-6 flex items-center gap-6 shadow-xl w-[900px]">
        
        {/* 出发城市 */}
        <div className="flex flex-col text-gray-800 flex-1">
          <span className="text-xs opacity-70 mb-1">出发城市</span>
          <div className="flex items-center gap-2 font-semibold text-lg">
            <FaPlaneDeparture className="opacity-70" />
            宁波 NG
          </div>
        </div>

        {/* 中间切换按钮 */}
        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white/50 hover:bg-white transition cursor-pointer">
          <FaExchangeAlt />
        </div>

        {/* 目的城市 */}
        <div className="flex flex-col text-gray-800 flex-1">
          <span className="text-xs opacity-70 mb-1">目的城市</span>
          <div className="flex items-center gap-2 font-semibold text-lg opacity-70">
            <FaPlaneArrival />
            输入目的
          </div>
        </div>

        {/* 日期 */}
        <div className="flex flex-col text-gray-800 flex-1">
          <span className="text-xs opacity-70 mb-1">日期</span>
          <div className="flex items-center gap-2 font-semibold text-lg">
            <FaCalendarAlt className="opacity-70" />
            2026-04-20
          </div>
        </div>

        {/* 按钮 */}
        <button className="bg-black text-white px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-gray-800 transition">
          <FaSearch />
          搜索航班
        </button>
      </div>
    </div>
  );
};

export default FlightSearchBar;