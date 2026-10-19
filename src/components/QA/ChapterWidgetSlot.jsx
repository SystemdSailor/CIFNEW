import React from 'react';
import SocialSecurityCalculator from '../Calculator/SocialSecurityCalculator';

/**
 * 章节配套工具插槽 / 视图切换控件
 *
 * 目前只有「保险」章节挂载社保养老金计算器；后续其它章节/其它页面要加同类工具，
 * 只需在这里加一个条件分支（或改为查表），调用方传参与用法保持不变。
 *
 * 视图状态（'qa' | 'calculator'）由调用方 CommonQAPage 持有，原因：
 * - 切换控件需要和「分区说明」标题同行并列展示，那一行归 CommonQAPage 管；
 * - 内容插槽与切换控件拆分后，二者共用同一份受控状态，逻辑更清晰。
 *
 * 非「保险」章节不挂载任何工具，直接透传 children，DOM 与改造前保持一致。
 */

/** 视图切换胶囊：问答 / 社保养老金计算器，靠右与「分区说明」并列同行 */
export const ChapterWidgetToggle = ({ value, onChange }) => (
  <div
    role="tablist"
    aria-label="保险章节视图切换"
    data-testid="chapter-widget-toggle"
    className="ml-auto inline-flex items-center gap-1 p-1 bg-white border border-gray-200 rounded-full shadow-sm"
  >
    <button
      type="button"
      role="tab"
      aria-selected={value === 'qa'}
      onClick={() => onChange('qa')}
      className={`px-4 py-1.5 rounded-full text-sm transition-all ${
        value === 'qa'
          ? 'bg-blue-600 text-white shadow-sm'
          : 'text-gray-600 hover:text-blue-600'
      }`}
    >
      问答
    </button>

    <button
      type="button"
      role="tab"
      aria-selected={value === 'calculator'}
      onClick={() => onChange('calculator')}
      className={`px-4 py-1.5 rounded-full text-sm transition-all ${
        value === 'calculator'
          ? 'bg-blue-600 text-white shadow-sm'
          : 'text-gray-600 hover:text-blue-600'
      }`}
    >
      社保养老金计算器
    </button>
  </div>
);

/**
 * 内容插槽（受控）：
 * - 非「保险」章节：透传 children（问答列表）
 * - 计算器视图：渲染社保养老金计算器
 * - 问答视图：透传 children
 */
const ChapterWidgetSlot = ({ activeChapter, view = 'qa', children }) => {
  if (activeChapter !== 'insurance') return <>{children}</>;

  if (view === 'calculator') {
    return (
      <div data-testid="chapter-widget-social-security-calculator">
        <SocialSecurityCalculator />
      </div>
    );
  }

  return <>{children}</>;
};

export default ChapterWidgetSlot;

