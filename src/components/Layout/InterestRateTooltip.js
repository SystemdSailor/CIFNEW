import React, { useState, useEffect } from 'react';

// 主要国家央行利率（定期更新）
const DEFAULT_RATES = [
  { country: '🇺🇸 美国', rate: '4.25%-4.50%', currency: 'USD' },
  { country: '🇪🇺 欧元区', rate: '2.65%', currency: 'EUR' },
  { country: '🇬🇧 英国', rate: '4.25%', currency: 'GBP' },
  { country: '🇯🇵 日本', rate: '0.50%', currency: 'JPY' },
  { country: '🇦🇺 澳大利亚', rate: '4.10%', currency: 'AUD' },
  { country: '🇨🇦 加拿大', rate: '2.75%', currency: 'CAD' },
  { country: '🇰🇷 韩国', rate: '2.75%', currency: 'KRW' },
  { country: '🇮🇳 印度', rate: '6.00%', currency: 'INR' },
  { country: '🇧🇷 巴西', rate: '14.25%', currency: 'BRL' },
  { country: '🇷🇺 俄罗斯', rate: '21.00%', currency: 'RUB' },
];

const InterestRateTooltip = () => {
  const [exchangeRates, setExchangeRates] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchRates = async () => {
      try {
        // 免费汇率API，以CNY为基础货币获取汇率
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/CNY');
        if (!response.ok) throw new Error('汇率数据获取失败');
        const data = await response.json();
        
        if (mounted) {
          setExchangeRates(data.rates || {});
          setLoading(false);
        }
      } catch (err) {
        console.error('获取汇率失败:', err);
        if (mounted) {
          setError('汇率数据暂时不可用');
          setLoading(false);
        }
      }
    };

    fetchRates();
    
    // 每5分钟刷新一次汇率数据
    const interval = setInterval(fetchRates, 5 * 60 * 1000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const formatExchangeRate = (currency) => {
    if (loading) return '加载中...';
    if (error) return error;
    
    const rate = exchangeRates[currency];
    if (!rate) return '暂无数据';
    
    // 对于日元等较小面额货币，显示更多小数位
    if (currency === 'JPY' || currency === 'KRW') {
      return `${rate.toFixed(2)}`;
    }
    return `${rate.toFixed(4)}`;
  };

  return (
    <div 
      className="absolute top-full left-0 mt-2 w-[480px] bg-white rounded-xl shadow-2xl border border-gray-200 p-5 z-[9999]"
      style={{ transform: 'translateX(-40%)' }}
    >
      {/* 标题 */}
      <div className="mb-4">
        <h3 className="text-base font-bold text-gray-900">🌍 全球主要国家利率 & 汇率</h3>
        <p className="text-xs text-gray-500 mt-0.5">对人民币汇率（CNY）</p>
      </div>

      {/* 表头 */}
      <div className="flex items-center text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 pb-2 mb-2">
        <div className="flex-1">国家/地区</div>
        <div className="w-24 text-right">基准利率</div>
        <div className="w-28 text-right">汇率</div>
      </div>

      {/* 数据行 */}
      <div className="space-y-1 max-h-[320px] overflow-y-auto">
        {DEFAULT_RATES.map((item, index) => (
          <div 
            key={item.currency}
            className={`flex items-center py-2 px-1 rounded-lg text-sm hover:bg-gray-50 transition-colors ${
              index % 2 === 0 ? 'bg-gray-50/50' : ''
            }`}
          >
            <div className="flex-1 font-medium text-gray-800">{item.country}</div>
            <div className="w-24 text-right font-mono text-gray-700">{item.rate}</div>
            <div className="w-28 text-right font-mono text-gray-700">
              {exchangeRates[item.currency] ? (
                <span className="text-blue-600">{formatExchangeRate(item.currency)}</span>
              ) : (
                <span className="text-gray-400 text-xs">{formatExchangeRate(item.currency)}</span>
              )}
              <span className="text-xs text-gray-400 ml-0.5">CNY</span>
            </div>
          </div>
        ))}
      </div>

      {/* 底部信息 */}
      <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
        <span className="text-[10px] text-gray-400">
          {loading ? '汇率数据加载中...' : 
           error ? error : 
           '数据来源: exchangerate-api.com'}
        </span>
        <span className="text-[10px] text-gray-300">
          更新时间: {new Date().toLocaleTimeString('zh-CN', {hour: '2-digit', minute: '2-digit'})}
        </span>
      </div>
    </div>
  );
};

export default InterestRateTooltip;