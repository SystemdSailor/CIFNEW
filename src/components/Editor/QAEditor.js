import React, { useState, useEffect } from 'react';

/**
 * 问答编辑器 - 提出问题结构化输入组件
 *
 * 提供表单化输入方式，将问题内容转为 Markdown 格式输出，
 * 适用于提问、知识问答等场景。
 */
const QAEditor = ({ value, onChange, companyName = '', onYesNoChange }) => {
  // 解析已有 content 或初始化默认结构
  const parseContent = (content) => {
    if (!content) return getDefaultQA();

    const qa = getDefaultQA();

    // 提取问题标题
    const titleMatch = content.match(/## 📌 问题标题\n\n([^#]+)/);
    if (titleMatch) {
      qa.title = titleMatch[1].trim();
    }

    // 提取问题描述
    const descMatch = content.match(/## 📝 问题描述\n\n([^#]+)/);
    if (descMatch) {
      qa.description = descMatch[1].trim();
    }

    // 提取分类
    const categoryMatch = content.match(/## 🏷️ 分类\n\n([^#]+)/);
    if (categoryMatch) {
      const lines = categoryMatch[1].split('\n').filter(l => l.trim());
      lines.forEach(line => {
        const match = line.match(/^- \*\*([^*]+)\*\*: (.+)/);
        if (match) {
          const key = match[1].trim();
          const val = match[2].trim();
          if (key.includes('类型')) qa.category.type = val;
          else if (key.includes('优先级')) qa.category.priority = val;
          else if (key.includes('紧急程度')) qa.category.urgency = val;
        }
      });
    }

    // 提取补充信息
    const extraMatch = content.match(/## 📎 补充信息\n\n([^#]+)/);
    if (extraMatch) {
      qa.extraInfo = extraMatch[1].trim();
    }

    // 确保所有默认字段都存在
    const defaults = getDefaultQA();
    Object.keys(defaults).forEach(section => {
      if (!qa[section]) {
        qa[section] = defaults[section];
      } else if (typeof defaults[section] === 'object' && !Array.isArray(defaults[section])) {
        Object.keys(defaults[section]).forEach(field => {
          if (qa[section][field] === undefined) {
            qa[section][field] = defaults[section][field];
          }
        });
      }
    });
    return qa;
  };

  const getDefaultQA = () => ({
    title: '',
    description: '',
    category: {
      type: '',
      priority: '',
      urgency: '',
    },
    extraInfo: '',
  });

  const [qa, setQA] = useState(() => parseContent(value || ''));

  // 问题是否可用是/否回答（仅 UI 状态，不写入 Markdown）
  const [isYesNo, setIsYesNo] = useState(false);

  // 复选框变化时通知父组件（用于设置 qa-tf 分类）
  const handleYesNoChange = (checked) => {
    setIsYesNo(checked);
    onYesNoChange?.(checked);
  };

  // 同步到父组件
  useEffect(() => {
    const markdown = generateMarkdown(qa);
    if (markdown !== value) {
      onChange?.(markdown);
    }
  }, [qa]);

  // 将结构化数据转为 Markdown
  const generateMarkdown = (data) => {
    const lines = [];

    // 问题标题
    if (data.title?.trim()) {
      lines.push('## 📌 问题标题', '');
      lines.push(data.title.trim());
      lines.push('');
    }

    // 问题描述
    if (data.description?.trim()) {
      lines.push('## 📝 问题描述', '');
      lines.push(data.description.trim());
      lines.push('');
    }

    // 分类
    const hasCategory = Object.values(data.category).some(v => v?.trim());
    if (hasCategory) {
      lines.push('## 🏷️ 分类', '');
      if (data.category.type?.trim()) lines.push(`- **问题类型**: ${data.category.type.trim()}`);
      if (data.category.priority?.trim()) lines.push(`- **优先级**: ${data.category.priority.trim()}`);
      if (data.category.urgency?.trim()) lines.push(`- **紧急程度**: ${data.category.urgency.trim()}`);
      lines.push('');
    }

    // 补充信息
    if (data.extraInfo?.trim()) {
      lines.push('## 📎 补充信息', '');
      lines.push(data.extraInfo.trim());
      lines.push('');
    }

    return lines.join('\n');
  };

  // 更新简单字段
  const updateField = (section, field, value) => {
    setQA(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  // 预览生成的 Markdown
  const [showPreview, setShowPreview] = useState(false);

  // 折叠状态
  const [collapsed, setCollapsed] = useState({
    title: true,
    description: true,
    category: true,
    extraInfo: true,
  });

  const toggleCollapse = (section) => {
    setCollapsed(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // 渲染模块 header
  const renderHeader = (section, color, iconLabel, extraRight) => (
    <div
      className="flex items-center justify-between cursor-pointer select-none"
      onClick={() => toggleCollapse(section)}
    >
      <div className="flex items-center">
        <div className={`w-2 h-6 ${color} rounded mr-2`}></div>
        <label className="text-sm font-medium text-gray-700">{iconLabel}</label>
      </div>
      <div className="flex items-center gap-2">
        {extraRight}
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${collapsed[section] ? '' : 'rotate-180'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* 工具栏 */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-500">
          <span className="font-medium">问答模式</span>
          <span className="mx-2">·</span>
          <span>填写结构化表单，自动生成问题 Markdown 内容</span>
        </div>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
            showPreview
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {showPreview ? '隐藏预览' : '预览 Markdown'}
        </button>
      </div>

      {/* 预览面板 */}
      {showPreview && (
        <div className="bg-gray-50 border rounded-lg p-4 mb-4">
          <div className="text-sm font-medium text-gray-700 mb-2">生成的 Markdown：</div>
          <pre className="text-sm text-gray-600 whitespace-pre-wrap font-mono bg-white p-3 rounded border">
            {generateMarkdown(qa) || '（暂无内容）'}
          </pre>
        </div>
      )}

      {/* 问题标题 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        {renderHeader('title', 'bg-indigo-500', '📌 问题标题')}
        {!collapsed.title && (
          <div className="mt-3">
            <input
              type="text"
              value={qa.title}
              onChange={(e) => setQA(prev => ({ ...prev, title: e.target.value }))}
              placeholder="请输入你的问题标题..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <div className="mt-1 flex items-center justify-between">
              <p className="text-xs text-gray-400">简明扼要地描述你的问题</p>
              <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isYesNo}
                  onChange={(e) => handleYesNoChange(e.target.checked)}
                  className="w-3.5 h-3.5 accent-blue-500"
                />
                问题可用是或否回答
              </label>
            </div>
          </div>
        )}
      </div>

      {/* 问题描述 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        {renderHeader('description', 'bg-blue-500', '📝 问题描述')}
        {!collapsed.description && (
          <div className="mt-3">
            <textarea
              value={qa.description}
              onChange={(e) => setQA(prev => ({ ...prev, description: e.target.value }))}
              placeholder="详细描述你的问题，包括背景、遇到的具体困难、已经尝试过的解决方法..."
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-vertical"
            />
            <p className="mt-1 text-xs text-gray-400">提供越详细的描述，越容易获得准确的答案</p>
          </div>
        )}
      </div>

      {/* 分类 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        {renderHeader('category', 'bg-teal-500', '🏷️ 分类')}
        {!collapsed.category && (
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">问题类型</label>
              <select
                value={qa.category.type}
                onChange={(e) => updateField('category', 'type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
              >
                <option value="">请选择</option>
                <option value="技术问题">技术问题</option>
                <option value="薪资福利">薪资福利</option>
                <option value="面试经验">面试经验</option>
                <option value="职业发展">职业发展</option>
                <option value="公司信息">公司信息</option>
                <option value="行业动态">行业动态</option>
                <option value="其他">其他</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">优先级</label>
              <select
                value={qa.category.priority}
                onChange={(e) => updateField('category', 'priority', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
              >
                <option value="">请选择</option>
                <option value="🔴 高优先级">🔴 高优先级</option>
                <option value="🟡 中优先级">🟡 中优先级</option>
                <option value="🟢 低优先级">🟢 低优先级</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">紧急程度</label>
              <select
                value={qa.category.urgency}
                onChange={(e) => updateField('category', 'urgency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
              >
                <option value="">请选择</option>
                <option value="🔴 非常紧急">🔴 非常紧急</option>
                <option value="🟡 比较紧急">🟡 比较紧急</option>
                <option value="🟢 不紧急">🟢 不紧急</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* 补充信息 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        {renderHeader('extraInfo', 'bg-pink-500', '📎 补充信息')}
        {!collapsed.extraInfo && (
          <div className="mt-3">
            <textarea
              value={qa.extraInfo}
              onChange={(e) => setQA(prev => ({ ...prev, extraInfo: e.target.value }))}
              placeholder="其他需要补充的信息，例如相关截图、日志、代码片段等..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-vertical"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default QAEditor;