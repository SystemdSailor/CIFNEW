import { useState, useEffect } from 'react';
import CompanyCard from './CompanyCard';
import AddCompanyModal from './AddCompanyModal';
import { fetchAllCompanyRelated, mergeRelated, companyKeyOf } from '../../services/companyRelatedService';

const PAGE_SIZE = 100;

/**
 * 分页控件组件
 */
function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  // 生成显示的页码列表（前后各5页）
  const getPageNumbers = () => {
    const pages = [];
    const start = Math.max(1, currentPage - 5);
    const end = Math.min(totalPages, currentPage + 5);

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push('...');
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      {/* 上一页 */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        上一页
      </button>

      {/* 页码 */}
      {getPageNumbers().map((page, idx) =>
        page === '...' ? (
          <span key={`ellipsis-${idx}`} className="px-2 py-2 text-sm text-gray-500">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              page === currentPage
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {page}
          </button>
        )
      )}

      {/* 下一页 */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        下一页
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

/**
 * 公司列表组件（含分页）
 * @param {array} companies - 公司数据列表
 * @param {function} onCompanyClick - 公司点击回调
 * @param {function} onAddCompany - 新增公司回调
 */
/**
 * 是否为数字型 id（爬取数据 transformed_companies 使用数字 id；
 * 「新增公司节点」写入 OrbitDB 的公司使用 uuid 字符串 id）
 */
const isNumericId = (id) => id !== undefined && id !== null && id !== '' && !Number.isNaN(Number(id));

/**
 * 列表排序：爬取数据在前（按 id 升序），OrbitDB 新增公司追加在末尾。
 *
 * 注意：
 *   1. 原实现 `a.id - b.id` 在数字与 uuid 混排时结果恒为 NaN（规范视为 +0），
 *      只能依赖引擎的稳定排序才不串位，这里显式区分两类 id；
 *   2. 分组按 source === 'orbit' 而不是「id 是否数字」，
 *      因为库中可能存在数字 id 的新增记录，按 id 类型分组会让它插进爬取数据中间。
 */
const compareCompanies = (a, b) => {
  const aOrbit = a.source === 'orbit';
  const bOrbit = b.source === 'orbit';

  // 爬取数据在前，OrbitDB 新增在后
  if (aOrbit !== bOrbit) return aOrbit ? 1 : -1;
  // 同为新增：保持合并（追加）顺序
  if (aOrbit) return 0;

  const aNumeric = isNumericId(a.id);
  const bNumeric = isNumericId(b.id);
  if (aNumeric && bNumeric) return Number(a.id) - Number(b.id);
  if (aNumeric !== bNumeric) return aNumeric ? -1 : 1;
  return 0;
};

function CompanyList({ companies, onCompanyClick, onAddCompany, currentPage, onPageChange }) {
  const [showAddModal, setShowAddModal] = useState(false);

  // 从 companyRelated 库批量载入「公司 → 关联组织」（1 次请求），供卡片渲染
  const [relatedMap, setRelatedMap] = useState({});

  useEffect(() => {
    let cancelled = false;
    fetchAllCompanyRelated().then((map) => {
      if (!cancelled) setRelatedMap(map);
    });
    return () => { cancelled = true; };
  }, []);

  // 按 id 升序排序（OrbitDB 新增公司追加在末尾，见 compareCompanies）
  const sortedCompanies = [...companies].sort(compareCompanies);
  const totalPages = Math.ceil(sortedCompanies.length / PAGE_SIZE);

  // 来自 OrbitDB companies 数据库的新增公司数量
  const orbitCount = sortedCompanies.filter(c => c.source === 'orbit').length;

  // 当列表数据变化时，如果当前页超出总页数则回退到第1页
  useEffect(() => {
    if (currentPage > totalPages) {
      onPageChange(1);
    }
  }, [totalPages, currentPage, onPageChange]);

  // 截取当前页数据
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const currentCompanies = sortedCompanies.slice(startIndex, startIndex + PAGE_SIZE);

  const handleAddCompany = (newCompany) => {
    onAddCompany(newCompany);
    setShowAddModal(false);
  };

  const handlePageChange = (page) => {
    onPageChange(page);
  };

  if (companies.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <svg
          className="w-16 h-16 text-gray-300 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">暂无匹配公司</h3>
        <p className="text-gray-500">试试调整搜索条件或筛选条件</p>

        <button
          onClick={() => setShowAddModal(true)}
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          新增公司节点
        </button>

        <AddCompanyModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddCompany}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600">
          共找到 <span className="font-semibold text-primary-600">{sortedCompanies.length}</span> 家公司
          {totalPages > 1 && (
            <span className="text-gray-400 ml-2">
              （第 {currentPage} / {totalPages} 页）
            </span>
          )}
          {orbitCount > 0 && currentPage < totalPages && (
            <span className="text-amber-600 ml-2">
              其中 {orbitCount} 条 OrbitDB 新增，见最后一页
            </span>
          )}
        </p>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          新增公司节点
        </button>
      </div>

      {currentCompanies.map((company) => (
        <CompanyCard
          key={company.id}
          company={company}
          related={mergeRelated(company.related, relatedMap[companyKeyOf(company)])}
          onClick={onCompanyClick}
        />
      ))}

      {/* 分页控件 */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      <AddCompanyModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddCompany}
      />
    </div>
  );
}

export default CompanyList;