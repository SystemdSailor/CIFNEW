import React, { useState } from 'react';

/**
 * 生成最近 N 个月的年份-月份列表
 */
function generateRecentMonths(count = 24) {
  const months = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    months.push({
      label: `${year} 年 ${month} 月`,
      value: `${year}-${month}`,
      year,
      month,
    });
  }
  return months;
}

const ArchiveTooltip = () => {
  const [monthData, setMonthData] = useState({}); // { 'YYYY-MM': { count } }
  const [loadingMonth, setLoadingMonth] = useState(null); // 当前正在加载的月份

  const allMonths = generateRecentMonths(24);

  // 数据获取函数（暂时空置，后续接入真实数据源）
  const fetchMonthCount = async (monthValue) => {
    // TODO: 从 IndexedDB 或后端 API 获取该月归档内容数量
    // 例如: const items = await backendClient.dbMonthlyAll(monthValue);
    // 返回 { count } 即可

    // 模拟 3 秒网络延迟
    await new Promise(resolve => setTimeout(resolve, 3000));

    const count = Math.floor(Math.random() * 20) + 1;
    return { count };
  };

  const handleMonthClick = async (month) => {
    // 如果已加载过或正在加载则不做任何事
    if (monthData[month.value] || loadingMonth === month.value) return;
    setLoadingMonth(month.value);
    const data = await fetchMonthCount(month.value);
    setMonthData(prev => ({ ...prev, [month.value]: data }));
    setLoadingMonth(null);
  };

  return (
    <div
      className="absolute top-full left-0 mt-2 w-[400px] bg-white rounded-xl shadow-2xl border border-gray-200 p-5 z-[9999]"
      style={{ transform: 'translateX(-10%)' }}
    >
      {/* 标题 */}
      <div className="mb-4">
        <h3 className="text-base font-bold text-gray-900">📦 内容归档</h3>
        <p className="text-xs text-gray-500 mt-0.5">按月份查看已归档的内容数量</p>
      </div>

      {/* 表头 */}
      <div className="flex items-center text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 pb-2 mb-2">
        <div className="flex-1">月份</div>
        <div className="w-20 text-right">内容数量</div>
      </div>

      {/* 月份列表 */}
      <div className="space-y-1 max-h-[400px] overflow-y-auto">
        {allMonths.map((month) => {
          const data = monthData[month.value];

          return (
            <div
              key={month.value}
              className={`flex items-center py-2.5 px-2 rounded-lg text-sm cursor-pointer transition-colors ${
                data ? 'bg-gray-50' : 'hover:bg-gray-50'
              }`}
              onClick={() => handleMonthClick(month)}
            >
              <div className="flex-1 font-medium text-gray-800">{month.label}</div>
              <div className="w-20 text-right flex items-center justify-end">
                {loadingMonth === month.value ? (
                  <span className="inline-block w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></span>
                ) : data ? (
                  <span className="text-blue-600 font-mono text-xs bg-blue-50 px-2 py-0.5 rounded-full">
                    {data.count} 条（目前为测试数据）
                  </span>
                ) : (
                  <span className="text-gray-300 text-xs">点击加载</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 底部信息 */}
      <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
        <span className="text-[10px] text-gray-400">
          共 {allMonths.length} 个月
        </span>
        <span className="text-[10px] text-gray-300">
          点击月份加载数量
        </span>
      </div>
    </div>
  );
};

export default ArchiveTooltip;