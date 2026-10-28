/**
 * 首页引导目标解析
 *
 * 设计目标：不改动 BigSearch / CompanyList / CompanyCard 等现有组件，
 * 通过页面上已有的文本、placeholder 和结构特征定位可点击项。
 *
 * 所有 resolver 都返回 Element | null；找不到时对应引导步骤会被跳过。
 */
import { HOME_TOUR_STEPS } from './homeTourConfig';

const normalizeText = (value) => (value || '').replace(/\s+/g, '');

/**
 * 按按钮文本查找（忽略空白字符）
 * @param {string} text 文本关键字
 * @param {Document|HTMLElement} root 查找范围
 * @returns {HTMLButtonElement|null}
 */
export const findButtonByText = (text, root = document) => {
  const target = normalizeText(text);
  if (!target) return null;
  const buttons = Array.from(root.querySelectorAll('button'));
  return buttons.find((button) => normalizeText(button.textContent).includes(target)) || null;
};

/** 搜索区：关键词输入框所在的搜索卡片 */
const findSearchCard = (root = document) => {
  const input = root.querySelector('input[placeholder="请输入公司名称或关键词"]');
  if (!input) return null;
  return input.closest('.rounded-3xl') || input.parentElement;
};

/** 公司卡片：CompanyCard 根节点带有 cursor-pointer group */
const findCompanyCard = (root = document) =>
  root.querySelector('main .cursor-pointer.group') ||
  root.querySelector('main div.cursor-pointer');

/** 分页控件：包含「下一页」按钮的容器 */
const findPagination = (root = document) => {
  const nextButton = findButtonByText('下一页', root);
  return nextButton ? nextButton.parentElement : null;
};

/**
 * target -> DOM resolver 映射
 * 键名与 homeTourConfig.js 中的 target 保持一致。
 */
export const HOME_TOUR_TARGET_RESOLVERS = {
  archive: (root) => findButtonByText('归档', root),
  home: (root) => findButtonByText('首页', root),
  news: (root) => findButtonByText('新闻', root),
  qa: (root) => findButtonByText('问答', root),
  standardize: (root) => findButtonByText('标准化', root),
  github: (root) => findButtonByText('Github', root),
  search: findSearchCard,
  addCompany: (root) => findButtonByText('新增公司节点', root),
  card: findCompanyCard,
  pagination: findPagination,
};

/**
 * 把配置转换为 Intro.js 的 steps，并过滤掉当前页面上不存在的目标。
 * @param {Array} steps 引导配置
 * @param {Document|HTMLElement} root 查找范围
 * @returns {Array<{element: Element, title: string, intro: string}>}
 */
export const resolveHomeTourSteps = (steps = HOME_TOUR_STEPS, root = document) => {
  const scope = root || document;

  return steps
    .map((step) => {
      const resolver = HOME_TOUR_TARGET_RESOLVERS[step.target];
      if (typeof resolver !== 'function') return null;

      const element = resolver(scope);
      if (!element || !element.isConnected) return null;

      return { element, title: step.title, intro: step.intro };
    })
    .filter(Boolean);
};
