/**
 * 公司卡片组件
 * @param {object} company - 公司数据 （包含 stockCode 字段）
 * @param {function} onClick - 点击回调函数
 * @param {string[]} [related] - 已合并的关联组织（内置 related ∪ companyRelated 库）。
 *                               由 CompanyList 批量载入后传入；缺省时回退 company.related。
 */
import { normalizeList } from '../../services/companyRelatedService';

function CompanyCard({ company, onClick, related }) {
  // 根据名称长度动态计算字号
  const getFontSize = (name) => {
    const len = name?.length || 0;
    if (len <= 2) return 'text-sm';
    if (len <= 4) return 'text-xs';
    if (len <= 6) return 'text-[11px]';
    return 'text-[10px]';
  };

  const hasLogo = company.logo && typeof company.logo === 'string' && company.logo.trim() !== '';

  // 关联组织：优先使用父级批量载入的合并结果；未传入时回退内置 related（容忍字符串写法）
  const relatedList = Array.isArray(related) ? related : normalizeList(company.related);

  return (
    <div
      onClick={() => onClick(company)}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-lg hover:border-primary-300 transition-all cursor-pointer group"
    >
      <div className="flex gap-4">
        {/* Logo */}
        <div className="flex-shrink-0">
          {hasLogo ? (
            <img
              src={company.logo}
              alt={company.name}
              className="w-20 h-20 rounded-lg object-cover border border-gray-200 group-hover:border-primary-300 transition-colors"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center p-1.5 border border-gray-200 group-hover:border-primary-300 transition-colors">
              <span className={`text-gray-900 text-center leading-tight font-bold line-clamp-3 break-all ${getFontSize(company.name)}`}>
                {company.name}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-primary-600 transition-colors">
              {company.name}
            </h3>
            <span className="flex items-center gap-1 text-sm text-gray-600 flex-shrink-0">
              <span className="font-mono text-primary-600">{company.stockCode}</span>
            </span>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            <span className="px-2.5 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full">
              {company.industry}
            </span>
            <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
              {company.scale}
            </span>
            <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
              {company.city}
            </span>
          </div>

          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {company.description}
          </p>

          {/* Tags */}
          {company.tags && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {company.tags.split(',').map((tag, idx) => (
                <span key={idx} className="px-2 py-0.5 bg-orange-50 text-orange-700 text-xs font-medium rounded-full border border-orange-200">
                  {tag.trim()}
                </span>
              ))}
            </div>
          )}

          {/* 关联组织标签 */}
          <div className="flex flex-wrap gap-1.5">
            {company.parent && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full border border-indigo-200" title={`隶属于 ${company.parent}`}>
                <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                {company.parent}
              </span>
            )}
            {relatedList.map((rel, idx) => (
              <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-200" title={`关联组织 ${rel}`}>
                <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                {rel}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompanyCard;