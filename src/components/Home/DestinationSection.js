import React from 'react';

const destinations = [
  {
    city: '东京',
    country: '日本',
    airport: '东京成田/羽田',
    time: '约 2h 45m',
    flights: '每日 4 班',
    price: '¥2,680',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    city: '巴黎',
    country: '法国',
    airport: '巴黎戴高乐',
    time: '约 13h 20m',
    flights: '每周 5 班',
    price: '¥5,200',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    city: '纽约',
    country: '美国',
    airport: '纽约肯尼迪',
    time: '约 15h 10m',
    flights: '每日 1 班',
    price: '¥5,800',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    city: '悉尼',
    country: '澳大利亚',
    airport: '悉尼金斯福德',
    time: '约 10h 30m',
    flights: '每周 3 班',
    price: '¥4,100',
    gradient: 'from-green-500 to-teal-500',
  },
  {
    city: '迪拜',
    country: '阿联酋',
    airport: '迪拜国际机场',
    time: '约 9h 15m',
    flights: '每日 2 班',
    price: '¥4,600',
    gradient: 'from-yellow-400 to-orange-400',
  },
  {
    city: '伦敦',
    country: '英国',
    airport: '伦敦希思罗',
    time: '约 12h 40m',
    flights: '每日 2 班',
    price: '¥4,850',
    gradient: 'from-gray-500 to-gray-700',
  },
  {
    city: '大阪',
    country: '日本',
    airport: '大阪关西机场',
    time: '约 2h 15m',
    flights: '每日 3 班',
    price: '¥2,380',
    gradient: 'from-pink-500 to-red-400',
  },
  {
    city: '新加坡',
    country: '新加坡',
    airport: '樟宜国际机场',
    time: '约 5h 20m',
    flights: '每日 5 班',
    price: '¥3,200',
    gradient: 'from-cyan-400 to-blue-500',
  },
];

const DestinationSection = () => {
  return (
    <div className="bg-[#f3f4f6] py-16 px-6">
      <div className="max-w-7xl mx-auto">

        {/* 标题 */}
        <h2 className="text-3xl font-bold text-center mb-10">
          热门目的地
        </h2>

        {/* 卡片 */}
        <div className="grid md:grid-cols-4 gap-6">
          {destinations.map((item, index) => (
            <div
              key={index}
              className="rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition transform hover:-translate-y-2"
            >
              {/* 顶部渐变 */}
              <div className={`bg-gradient-to-r ${item.gradient} p-6 text-white relative`}>
                
                <div className="text-lg font-semibold">{item.city}</div>

                {/* 价格 */}
                <div className="absolute right-4 bottom-4 bg-black/30 px-3 py-1 rounded-full text-sm">
                  {item.price} 起
                </div>
              </div>

              {/* 底部信息 */}
              <div className="bg-white p-5">
                <div className="text-xs text-blue-500 mb-1">
                  {item.country}
                </div>

                <div className="font-semibold text-gray-800 mb-3">
                  {item.airport}
                </div>

                <div className="flex justify-between text-sm text-gray-500">
                  <span>⏱ {item.time}</span>
                  <span>✈ {item.flights}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default DestinationSection;