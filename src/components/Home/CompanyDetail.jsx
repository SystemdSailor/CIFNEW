import React, { useEffect, useState } from 'react';
import { mockCompanies } from '../data/mockCompanies';
import ALLArticles from '../Articles/ALLArticles';
import MarkdownEditor from '../Editor/MarkdownEditor';
import { fetchCompanyRelated, addCompanyRelated, normalizeList } from '../../services/companyRelatedService';

/**
 * 公司详情组件（支持作为覆盖层显示）
 * @param {object} props - 组件属性
 * @param {number} props.companyId - 公司ID
 * @param {function} props.onClose - 关闭回调
 */
function CompanyDetail({ company: propCompany, companyId, onClose, onEdit, isEditing = false, onBackFromEdit }) {
  const company = propCompany || mockCompanies.find(c => c.id === Number(companyId));

  // 关联组织（内置 related ∪ companyRelated 库），支持新增后「追加渲染」
  const [relatedItems, setRelatedItems] = useState([]);
  const [isAddingRelated, setIsAddingRelated] = useState(false);
  const [relatedInput, setRelatedInput] = useState('');
  const [relatedError, setRelatedError] = useState('');
  const [savingRelated, setSavingRelated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!company) return;
    // 先用内置 related 渲染，再异步叠加 companyRelated 库中的数据
    setRelatedItems(normalizeList(company.related));
    fetchCompanyRelated(company).then(list => {
      if (!cancelled) setRelatedItems(list);
    });
    return () => { cancelled = true; };
  }, [company]);

  if (!company) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center text-gray-500 py-10">
          公司信息不存在
        </div>
      </div>
    );
  }

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
        </svg>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <svg key="half" className="w-5 h-5 text-yellow-400" viewBox="0 0 20 20">
          <defs>
            <linearGradient id="halfGrad">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="#e5e7eb" />
            </linearGradient>
          </defs>
          <path fill="url(#halfGrad)" d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
        </svg>
      );
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <svg key={`empty-${i}`} className="w-5 h-5 text-gray-300 fill-current" viewBox="0 0 20 20">
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
        </svg>
      );
    }

    return stars;
  };

  // 追加一个关联组织：写库成功后更新本地列表（追加渲染）
  const handleAddRelated = async (e) => {
    e.preventDefault();
    if (!relatedInput.trim()) return;
    setRelatedError('');
    setSavingRelated(true);
    try {
      const next = await addCompanyRelated(company, relatedInput);
      setRelatedItems(next);
      setRelatedInput('');
      setIsAddingRelated(false);
    } catch (err) {
      setRelatedError(err.message);
    } finally {
      setSavingRelated(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      {isEditing ? (
        <button
          onClick={onBackFromEdit}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 sm:mb-6 transition-colors group"
        >
          <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          完成编辑
        </button>
      ) : (
        <button
          onClick={onClose}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 sm:mb-6 transition-colors group"
        >
          <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回列表
        </button>
      )}

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* 左侧：公司详情（约 35% 空间） */}
        <div className="lg:w-[35%] xl:w-[32%]">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden sticky top-6">
            {/* 公司头部：logo + 名称 + 行业 + 评分 */}
            <div className="bg-gradient-to-br from-blue-600 via-blue-600 to-cyan-500 p-6 sm:p-8 text-white">
              <div className="flex items-center gap-5">
                {(company.logo && typeof company.logo === 'string' && company.logo.trim() !== '') ? (
                  <img
                    src={company.logo}
                    alt={company.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl border-2 border-white/30 object-cover shadow-lg flex-shrink-0"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center p-1.5 border-2 border-white/30 shadow-lg flex-shrink-0">
                    <span className="text-gray-900 text-center leading-tight font-bold line-clamp-3 break-all text-sm">
                      {company.name}
                    </span>
                  </div>
                )}
                <div className="min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold mb-2 truncate">{company.name}</h1>
                  <div className="flex flex-wrap items-center gap-2 text-white/80">
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm whitespace-nowrap">
                      {company.industry}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="flex">{renderStars(company.rating)}</span>
                      <span className="ml-1 text-white font-semibold">{company.rating}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 公司信息主体 */}
            <div className="p-6 sm:p-8">
              {/* 编辑按钮 */}
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="w-full mb-6 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl hover:from-blue-700 hover:to-cyan-600 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  编辑内容
                </button>
              )}
              {/* 基本信息（2列网格，适配左侧窄空间） */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                <div className="bg-gray-50 rounded-xl p-3 sm:p-4 text-center hover:bg-gray-100 transition-colors">
                  <div className="text-xs text-gray-500 mb-1">成立时间</div>
                  <div className="text-base sm:text-lg font-semibold text-gray-900">{company.founded || '-'}</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 sm:p-4 text-center hover:bg-gray-100 transition-colors">
                  <div className="text-xs text-gray-500 mb-1">所属城市</div>
                  <div className="text-base sm:text-lg font-semibold text-gray-900">{company.city}</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 sm:p-4 text-center hover:bg-gray-100 transition-colors">
                  <div className="text-xs text-gray-500 mb-1">公司规模</div>
                  <div className="text-base sm:text-lg font-semibold text-gray-900">{company.scale}</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 sm:p-4 text-center hover:bg-gray-100 transition-colors">
                  <div className="text-xs text-gray-500 mb-1">标签</div>
                  <div className="text-base sm:text-lg font-semibold text-primary-600">
                    {company.tags ? company.tags.split(',').length : 0} 个
                  </div>
                </div>
              </div>

              {/* Tags */}
              {company.tags && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {company.tags.split(',').map((tag, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-orange-50 text-orange-700 text-xs font-medium rounded-full border border-orange-200">
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              )}

              {/* 上级组织 */}
              {company.parent && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {company.parent.split(',').map((tag, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200">
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              )}

              {/* 关联组织 */}
              <div className="flex flex-wrap items-center gap-1.5 mb-4">
                {relatedItems.map((tag, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200">
                    {String(tag).trim()}
                  </span>
                ))}

                {!isAddingRelated ? (
                  <button
                    type="button"
                    onClick={() => { setIsAddingRelated(true); setRelatedError(''); }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-600 bg-white rounded-full border border-dashed border-blue-300 hover:bg-blue-50 transition-colors"
                    title="添加关联组织"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    添加
                  </button>
                ) : (
                  <form onSubmit={handleAddRelated} className="inline-flex items-center gap-1">
                    <input
                      autoFocus
                      value={relatedInput}
                      onChange={(e) => setRelatedInput(e.target.value)}
                      placeholder="组织名称"
                      className="px-2.5 py-1 text-xs text-gray-700 border border-blue-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={savingRelated}
                      className="px-2.5 py-1 text-xs font-medium text-white bg-blue-600 rounded-full hover:bg-blue-700 disabled:opacity-50"
                    >
                      {savingRelated ? '保存中…' : '确认'}
                    </button>
                    <button
                      type="button"
                      disabled={savingRelated}
                      onClick={() => { setIsAddingRelated(false); setRelatedInput(''); setRelatedError(''); }}
                      className="px-2.5 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 disabled:opacity-50"
                    >
                      取消
                    </button>
                  </form>
                )}
              </div>
              {relatedError && (
                <div className="text-xs text-red-600 mb-4">{relatedError}</div>
              )}

              {/* 分隔线 */}
              <div className="border-t border-gray-100 mb-6"></div>

              {/* 公司介绍 */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  公司介绍
                </h2>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{company.description}</p>
              </div>

              {/* 公司网站 */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                <div className="min-w-0">
                  <span className="text-xs text-gray-500">官方网站</span>
                  <div className="text-blue-600 font-medium truncate">{company.website}</div>
                </div>
                <a
                  href={`https://${company.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg hover:from-blue-700 hover:to-cyan-600 transition-all shadow-md hover:shadow-lg text-sm whitespace-nowrap ml-3"
                >
                  访问官网
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧：相关文章 / Markdown编辑器（约 65% 空间） */}
        <div className="lg:w-[65%] xl:w-[68%]">
          {isEditing ? (
            <MarkdownEditor company={company} />
          ) : (
            <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6 lg:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-5 sm:mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                相关文章
              </h2>
              <ALLArticles companyId={company.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CompanyDetail;