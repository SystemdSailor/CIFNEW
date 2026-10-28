/**
 * 首页新手引导配置
 *
 * 后续只需要修改本文件：
 * - title：引导步骤标题（对应首页上的功能名）
 * - intro：引导说明内容，目前统一为占位符 *****
 *
 * 注意：HOME_TOUR_STORAGE_KEY 带版本号。修改完文案后，如果希望
 * 已经看过引导的用户再看到一次，把 v1 改成 v2 即可。
 */
export const HOME_TOUR_STORAGE_KEY = 'cifnew.homeTour.v1';

/** 是否在首次进入首页时自动弹出引导（false 则只保留右下角「使用说明」按钮） */
export const AUTO_START_HOME_TOUR = true;

/**
 * 引导步骤（按数组顺序展示）
 * target 与 homeTourTargets.js 中的 HOME_TOUR_TARGET_RESOLVERS 对应，
 * 不要随意修改 target 的取值。
 */
export const HOME_TOUR_STEPS = [
  { target: 'archive', title: '归档', intro: '数据量小，归档未实现' },
  { target: 'home', title: '首页', intro: '主界面' },
  { target: 'news', title: '新闻', intro: '新闻' },
  { target: 'qa', title: '问答', intro: '问答界面' },
  { target: 'standardize', title: '标准化', intro: '文章和帐号管理' },
  { target: 'github', title: 'Github', intro: 'Github' },
  { target: 'search', title: '搜索区', intro: '搜索区' },
  { target: 'addCompany', title: '新增公司节点', intro: '新增公司节点' },
  { target: 'card', title: '公司卡片', intro: '公司卡片' },
  { target: 'pagination', title: '翻页', intro: '翻页' },
];
