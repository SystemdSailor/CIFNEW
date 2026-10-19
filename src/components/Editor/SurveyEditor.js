import React, { useState, useEffect } from 'react';

/**
 * 调查表编辑器 - OfferShow 薪酬爆料结构化输入组件
 *
 * 提供表单化输入方式，将 Offer 爆料数据转为 Markdown 格式输出，
 * 作为 MDEditor 的替代输入方式，适用于薪资分享、面试经历爆料等场景。
 */
const SurveyEditor = ({ value, onChange, companyName = '' }) => {
  // 解析已有 content 或初始化默认结构
  const parseContent = (content) => {
    if (!content) return getDefaultSurvey();

    // 尝试从已有 markdown 反向解析结构化数据
    const survey = getDefaultSurvey();

    // 提取公司信息
    const companyMatch = content.match(/## 🏢 公司信息\n\n([^#]+)/);
    if (companyMatch) {
      const lines = companyMatch[1].split('\n').filter(l => l.trim());
      lines.forEach(line => {
        const match = line.match(/^- \*\*([^*]+)\*\*: (.+)/);
        if (match) {
          const key = match[1].trim();
          const val = match[2].trim();
          if (key.includes('公司')) survey.company.name = val;
          else if (key.includes('岗位')) survey.company.position = val;
          else if (key.includes('城市')) survey.company.city = val;
          else if (key.includes('部门')) survey.company.department = val;
        }
      });
    }

    // 提取薪酬待遇
    const salaryMatch = content.match(/## 💰 薪酬待遇\n\n([^#]+)/);
    if (salaryMatch) {
      const lines = salaryMatch[1].split('\n').filter(l => l.trim());
      lines.forEach(line => {
        const match = line.match(/^- \*\*([^*]+)\*\*: (.+)/);
        if (match) {
          const key = match[1].trim();
          const val = match[2].trim();
          if (key.includes('月薪')) survey.salary.monthly = val;
          else if (key.includes('年薪')) survey.salary.annual = val;
          else if (key.includes('签字费')) survey.salary.signOn = val;
          else if (key.includes('股票')) survey.salary.stock = val;
          else if (key.includes('年终')) survey.salary.bonus = val;
          else if (key.includes('其他')) survey.salary.other = val;
        }
      });
    }

    // 提取福利待遇
    const benefitsMatch = content.match(/## 🎁 福利待遇\n\n([^#]+)/);
    if (benefitsMatch) {
      const lines = benefitsMatch[1].split('\n').filter(l => l.trim());
      lines.forEach(line => {
        if (line.startsWith('- ')) {
          const benefit = line.replace(/^- /, '').trim();
          if (benefit) survey.benefits.push(benefit);
        }
      });
    }

    // 提取工作时间
    const workMatch = content.match(/## ⏰ 工作时间\n\n([^#]+)/);
    if (workMatch) {
      const lines = workMatch[1].split('\n').filter(l => l.trim());
      lines.forEach(line => {
        const match = line.match(/^- \*\*([^*]+)\*\*: (.+)/);
        if (match) {
          const key = match[1].trim();
          const val = match[2].trim();
          if (key.includes('工作日')) survey.workSchedule.workDays = val;
          else if (key.includes('工作时段')) survey.workSchedule.workHours = val;
          else if (key.includes('加班')) survey.workSchedule.overtime = val;
          else if (key.includes('弹性')) survey.workSchedule.flexible = val;
          else if (key.includes('考勤')) survey.workSchedule.attendance = val;
        }
      });
    }

    // 提取面试经历
    const interviewMatch = content.match(/## 📋 面试经历\n\n([^#]+)/);
    if (interviewMatch) {
      const lines = interviewMatch[1].split('\n').filter(l => l.trim());
      lines.forEach(line => {
        const match = line.match(/^- \*\*([^*]+)\*\*: (.+)/);
        if (match) {
          const key = match[1].trim();
          const val = match[2].trim();
          if (key.includes('面试难度')) survey.interview.difficulty = val;
          else if (key.includes('面试轮数')) survey.interview.rounds = val;
          else if (key.includes('整体感受')) survey.interview.impression = val;
        }
      });
      // 提取面试问题
      const questionsSection = interviewMatch[1].match(/面试问题：\n([^#]+)/);
      if (questionsSection) {
        survey.interview.questions = questionsSection[1]
          .split('\n')
          .filter(l => l.trim().startsWith('-'))
          .map(l => l.replace(/^- /, '').trim());
      }
    }

    // 提取个人背景
    const bgMatch = content.match(/## 👤 个人背景\n\n([^#]+)/);
    if (bgMatch) {
      const lines = bgMatch[1].split('\n').filter(l => l.trim());
      lines.forEach(line => {
        const match = line.match(/^- \*\*([^*]+)\*\*: (.+)/);
        if (match) {
          const key = match[1].trim();
          const val = match[2].trim();
          if (key.includes('学历')) {
            if (key.includes('详细')) survey.background.educationDetail = val;
            else survey.background.education = val;
          }
          else if (key.includes('工作年限')) survey.background.workYears = val;
          else if (key.includes('当前公司')) survey.background.currentCompany = val;
          else if (key.includes('当前薪资')) survey.background.currentSalary = val;
        }
      });
    }

    // 提取总体评价
    const ratingMatch = content.match(/## ⭐ 总体评价\n\n([^#]+)/);
    if (ratingMatch) {
      const lines = ratingMatch[1].split('\n').filter(l => l.trim());
      lines.forEach(line => {
        const match = line.match(/^- \*\*([^*]+)\*\*: (.+)/);
        if (match) {
          const key = match[1].trim();
          const val = match[2].trim();
          if (key.includes('推荐')) survey.rating.recommend = val;
          else if (key.includes('评级')) survey.rating.score = val;
        }
      });
      // 提取综合评价文本
      const commentMatch = ratingMatch[1].match(/综合评价：\n([^#]+)/);
      if (commentMatch) {
        survey.rating.comment = commentMatch[1].trim();
      }
    }

    // 确保所有默认字段都存在（兼容旧数据）
    const defaults = getDefaultSurvey();
    Object.keys(defaults).forEach(section => {
      if (!survey[section]) {
        survey[section] = defaults[section];
      } else if (typeof defaults[section] === 'object' && !Array.isArray(defaults[section])) {
        Object.keys(defaults[section]).forEach(field => {
          if (survey[section][field] === undefined) {
            survey[section][field] = defaults[section][field];
          }
        });
      }
    });
    return survey;
  };

  const getDefaultSurvey = () => ({
    company: {
      name: companyName,
      position: '',
      city: '',
      department: '',
    },
    salary: {
      monthly: '',
      annual: '',
      signOn: '',
      stock: '',
      bonus: '',
      other: '',
    },
    benefits: [''],
    workSchedule: {
      workDays: '',
      workHours: '',
      overtime: '',
      flexible: '',
      attendance: '',
    },
    interview: {
      difficulty: '',
      rounds: '',
      impression: '',
      questions: [''],
    },
    background: {
      education: '',
      educationDetail: '',
      workYears: '',
      currentCompany: '',
      currentSalary: '',
    },
    rating: {
      recommend: '',
      score: '',
      comment: '',
    },
  });

  const [survey, setSurvey] = useState(() => parseContent(value || ''));

  // 当 companyName prop 变化时，如果公司名称字段为空则自动填充
  useEffect(() => {
    if (companyName && !survey.company.name) {
      setSurvey(prev => ({
        ...prev,
        company: { ...prev.company, name: companyName },
      }));
    }
  }, [companyName]);

  // 同步到父组件
  useEffect(() => {
    const markdown = generateMarkdown(survey);
    if (markdown !== value) {
      onChange?.(markdown);
    }
  }, [survey]);

  // 将结构化数据转为 Markdown
  const generateMarkdown = (data) => {
    const lines = [];

    // 公司信息
    const hasCompany = Object.values(data.company).some(v => v?.trim());
    if (hasCompany) {
      lines.push('## 🏢 公司信息', '');
      if (data.company.name?.trim()) lines.push(`- **公司名称**: ${data.company.name.trim()}`);
      if (data.company.position?.trim()) lines.push(`- **岗位名称**: ${data.company.position.trim()}`);
      if (data.company.city?.trim()) lines.push(`- **工作城市**: ${data.company.city.trim()}`);
      if (data.company.department?.trim()) lines.push(`- **所属部门**: ${data.company.department.trim()}`);
      lines.push('');
    }

    // 薪酬待遇
    const hasSalary = Object.values(data.salary).some(v => v?.trim());
    if (hasSalary) {
      lines.push('## 💰 薪酬待遇', '');
      if (data.salary.monthly?.trim()) lines.push(`- **月薪**: ${data.salary.monthly.trim()}`);
      if (data.salary.annual?.trim()) lines.push(`- **年薪**: ${data.salary.annual.trim()}`);
      if (data.salary.signOn?.trim()) lines.push(`- **签字费**: ${data.salary.signOn.trim()}`);
      if (data.salary.stock?.trim()) lines.push(`- **股票/期权**: ${data.salary.stock.trim()}`);
      if (data.salary.bonus?.trim()) lines.push(`- **年终奖金**: ${data.salary.bonus.trim()}`);
      if (data.salary.other?.trim()) lines.push(`- **其他补贴**: ${data.salary.other.trim()}`);
      lines.push('');
    }

    // 福利待遇
    const validBenefits = data.benefits.filter(b => b?.trim());
    if (validBenefits.length > 0) {
      lines.push('## 🎁 福利待遇', '');
      validBenefits.forEach(b => {
        lines.push(`- ${b.trim()}`);
      });
      lines.push('');
    }

    // 工作时间
    const hasWorkSchedule = Object.values(data.workSchedule).some(v => v?.trim());
    if (hasWorkSchedule) {
      lines.push('## ⏰ 工作时间', '');
      if (data.workSchedule.workDays?.trim()) lines.push(`- **工作日**: ${data.workSchedule.workDays.trim()}`);
      if (data.workSchedule.workHours?.trim()) lines.push(`- **工作时段**: ${data.workSchedule.workHours.trim()}`);
      if (data.workSchedule.overtime?.trim()) lines.push(`- **加班情况**: ${data.workSchedule.overtime.trim()}`);
      if (data.workSchedule.flexible?.trim()) lines.push(`- **弹性工作**: ${data.workSchedule.flexible.trim()}`);
      if (data.workSchedule.attendance?.trim()) lines.push(`- **考勤要求**: ${data.workSchedule.attendance.trim()}`);
      lines.push('');
    }

    // 个人背景
    const hasBg = Object.values(data.background).some(v => v?.trim());
    if (hasBg) {
      lines.push('## 👤 个人背景', '');
      if (data.background.education?.trim()) lines.push(`- **学历**: ${data.background.education.trim()}`);
      if (data.background.educationDetail?.trim()) lines.push(`- **学历详细**: ${data.background.educationDetail.trim()}`);
      if (data.background.workYears?.trim()) lines.push(`- **工作年限**: ${data.background.workYears.trim()}`);
      if (data.background.currentCompany?.trim()) lines.push(`- **当前公司**: ${data.background.currentCompany.trim()}`);
      if (data.background.currentSalary?.trim()) lines.push(`- **当前薪资**: ${data.background.currentSalary.trim()}`);
      lines.push('');
    }

    // 面试经历
    const hasInterview = data.interview.difficulty?.trim() || data.interview.rounds?.trim() || data.interview.impression?.trim() || data.interview.questions.some(q => q?.trim());
    if (hasInterview) {
      lines.push('## 📋 面试经历', '');
      if (data.interview.difficulty?.trim()) lines.push(`- **面试难度**: ${data.interview.difficulty.trim()}`);
      if (data.interview.rounds?.trim()) lines.push(`- **面试轮数**: ${data.interview.rounds.trim()}`);
      if (data.interview.impression?.trim()) lines.push(`- **整体感受**: ${data.interview.impression.trim()}`);
      const validQuestions = data.interview.questions.filter(q => q?.trim());
      if (validQuestions.length > 0) {
        lines.push('- **面试问题**：');
        validQuestions.forEach(q => {
          lines.push(`  - ${q.trim()}`);
        });
      }
      lines.push('');
    }

    // 总体评价
    const hasRating = data.rating.recommend?.trim() || data.rating.score?.trim() || data.rating.comment?.trim();
    if (hasRating) {
      lines.push('## ⭐ 总体评价', '');
      if (data.rating.score?.trim()) lines.push(`- **综合评级**: ${data.rating.score.trim()}`);
      if (data.rating.recommend?.trim()) lines.push(`- **推荐入职**: ${data.rating.recommend.trim()}`);
      if (data.rating.comment?.trim()) {
        lines.push('- **综合评价**：');
        lines.push(`  ${data.rating.comment.trim()}`);
      }
      lines.push('');
    }

    return lines.join('\n');
  };

  // 更新简单字段
  const updateField = (section, field, value) => {
    setSurvey(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  // 更新列表项
  const addListItem = (section) => {
    setSurvey(prev => ({
      ...prev,
      [section]: [...prev[section], ''],
    }));
  };

  const updateListItem = (section, index, value) => {
    setSurvey(prev => {
      const newList = [...prev[section]];
      newList[index] = value;
      return { ...prev, [section]: newList };
    });
  };

  const removeListItem = (section, index) => {
    setSurvey(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index),
    }));
  };

  // 预览生成的 Markdown
  const [showPreview, setShowPreview] = useState(false);

  // 折叠状态：每个模块默认展开
  const [collapsed, setCollapsed] = useState({
    company: true,
    salary: true,
    benefits: true,
    workSchedule: true,
    background: true,
    interview: true,
    rating: true,
  });

  const toggleCollapse = (section) => {
    setCollapsed(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // 渲染模块 header 的通用函数：带色条、图标标题、折叠箭头
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
          <span className="font-medium">OfferShow 模式</span>
          <span className="mx-2">·</span>
          <span>填写结构化表单，自动生成薪酬爆料 Markdown 内容</span>
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
            {generateMarkdown(survey) || '（暂无内容）'}
          </pre>
        </div>
      )}

      {/* 公司信息 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        {renderHeader('company', 'bg-blue-500', '🏢 公司信息')}
        {!collapsed.company && (
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">公司名称</label>
            <input
              type="text"
              value={survey.company.name}
              onChange={(e) => updateField('company', 'name', e.target.value)}
              placeholder="输入公司名称..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">岗位名称</label>
            <input
              type="text"
              value={survey.company.position}
              onChange={(e) => updateField('company', 'position', e.target.value)}
              placeholder="例如：后端开发工程师"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">工作城市</label>
            <input
              type="text"
              value={survey.company.city}
              onChange={(e) => updateField('company', 'city', e.target.value)}
              placeholder="例如：北京、上海、深圳"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">所属部门</label>
            <input
              type="text"
              value={survey.company.department}
              onChange={(e) => updateField('company', 'department', e.target.value)}
              placeholder="例如：技术部、产品部"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>
        )}
      </div>

      {/* 薪酬待遇 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        {renderHeader('salary', 'bg-green-500', '💰 薪酬待遇')}
        {!collapsed.salary && (
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">月薪（K）</label>
            <input
              type="text"
              value={survey.salary.monthly}
              onChange={(e) => updateField('salary', 'monthly', e.target.value)}
              placeholder="例如：25K"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">年薪（万）</label>
            <input
              type="text"
              value={survey.salary.annual}
              onChange={(e) => updateField('salary', 'annual', e.target.value)}
              placeholder="例如：35万"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">签字费</label>
            <input
              type="text"
              value={survey.salary.signOn}
              onChange={(e) => updateField('salary', 'signOn', e.target.value)}
              placeholder="例如：5万"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">股票/期权</label>
            <input
              type="text"
              value={survey.salary.stock}
              onChange={(e) => updateField('salary', 'stock', e.target.value)}
              placeholder="例如：价值20万/年"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">年终奖金</label>
            <input
              type="text"
              value={survey.salary.bonus}
              onChange={(e) => updateField('salary', 'bonus', e.target.value)}
              placeholder="例如：3个月"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">其他补贴</label>
            <input
              type="text"
              value={survey.salary.other}
              onChange={(e) => updateField('salary', 'other', e.target.value)}
              placeholder="例如：餐补、房补等"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>
        )}
      </div>

      {/* 福利待遇 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        {renderHeader('benefits', 'bg-purple-500', '🎁 福利待遇', (
          <button
            onClick={(e) => { e.stopPropagation(); addListItem('benefits'); }}
            className="px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
          >
            + 添加福利
          </button>
        ))}
        {!collapsed.benefits && (
        <div className="mt-3 space-y-2">
          {survey.benefits.map((benefit, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-green-500 text-sm">✓</span>
              <input
                type="text"
                value={benefit}
                onChange={(e) => updateListItem('benefits', index, e.target.value)}
                placeholder="例如：五险一金、补充医疗、带薪年假..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              {survey.benefits.length > 1 && (
                <button
                  onClick={() => removeListItem('benefits', index)}
                  className="text-red-400 hover:text-red-600 transition-colors text-sm"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
        )}
      </div>

      {/* 工作时间 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        {renderHeader('workSchedule', 'bg-cyan-500', '⏰ 工作时间')}
        {!collapsed.workSchedule && (
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">工作日</label>
            <select
              value={survey.workSchedule.workDays}
              onChange={(e) => updateField('workSchedule', 'workDays', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
            >
              <option value="">请选择</option>
              <option value="周一至周五（5天）">周一至周五（5天）</option>
              <option value="大小周">大小周</option>
              <option value="单休（6天）">单休（6天）</option>
              <option value="排班制">排班制</option>
              <option value="其他">其他</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">工作时段</label>
            <select
              value={survey.workSchedule.workHours}
              onChange={(e) => updateField('workSchedule', 'workHours', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
            >
              <option value="">请选择</option>
              <option value="9:00-18:00（8小时）">9:00-18:00（8小时）</option>
              <option value="9:30-18:30（8小时）">9:30-18:30（8小时）</option>
              <option value="10:00-19:00（8小时）">10:00-19:00（8小时）</option>
              <option value="996（9:00-21:00 六天）">996（9:00-21:00 六天）</option>
              <option value="007（24小时待命）">007（24小时待命）</option>
              <option value="其他">其他</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">加班情况</label>
            <select
              value={survey.workSchedule.overtime}
              onChange={(e) => updateField('workSchedule', 'overtime', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
            >
              <option value="">请选择</option>
              <option value="基本不加班">基本不加班</option>
              <option value="偶尔加班">偶尔加班</option>
              <option value="经常加班">经常加班</option>
              <option value="常态化加班">常态化加班</option>
              <option value="严重加班（996）">严重加班（996）</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">弹性工作</label>
            <select
              value={survey.workSchedule.flexible}
              onChange={(e) => updateField('workSchedule', 'flexible', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
            >
              <option value="">请选择</option>
              <option value="完全弹性，不打卡">完全弹性，不打卡</option>
              <option value="弹性上下班，核心时段在岗">弹性上下班，核心时段在岗</option>
              <option value="固定时间，需打卡">固定时间，需打卡</option>
              <option value="严格考勤">严格考勤</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">考勤要求</label>
            <input
              type="text"
              value={survey.workSchedule.attendance}
              onChange={(e) => updateField('workSchedule', 'attendance', e.target.value)}
              placeholder="例如：钉钉打卡、指纹打卡等"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>
        )}
      </div>

      {/* 个人背景 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        {renderHeader('background', 'bg-teal-500', '👤 个人背景')}
        {!collapsed.background && (
        <div className="mt-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">工作年限</label>
              <select
                value={survey.background.workYears}
                onChange={(e) => updateField('background', 'workYears', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
              >
                <option value="">请选择</option>
                <option value="应届生（少于1年）">应届生（少于1年）</option>
                <option value="1-3年">1-3年</option>
                <option value="3-5年">3-5年</option>
                <option value="5-10年">5-10年</option>
                <option value="10年以上">10年以上</option>
              </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">学历</label>
            <select
              value={survey.background.education}
              onChange={(e) => updateField('background', 'education', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
            >
              <option value="">请选择</option>
              <option value="高中/中专">高中/中专</option>
              <option value="大专">大专</option>
              <option value="本科">本科</option>
              <option value="硕士">硕士</option>
              <option value="博士">博士</option>
              <option value="MBA">MBA</option>
            </select>
          </div>
        </div>
        <div className="mt-3">
          <label className="block text-xs text-gray-500 mb-1">学历详细</label>
          <input
            type="text"
            value={survey.background.educationDetail}
            onChange={(e) => updateField('background', 'educationDetail', e.target.value)}
            placeholder="例如：北京大学 计算机科学与技术 硕士"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">当前公司</label>
            <input
              type="text"
              value={survey.background.currentCompany}
              onChange={(e) => updateField('background', 'currentCompany', e.target.value)}
              placeholder="当前或最近就职公司"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">当前薪资</label>
            <input
              type="text"
              value={survey.background.currentSalary}
              onChange={(e) => updateField('background', 'currentSalary', e.target.value)}
              placeholder="例如：25K"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>
        </div>
        )}
      </div>

      {/* 面试经历 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        {renderHeader('interview', 'bg-orange-500', '📋 面试经历')}
        {!collapsed.interview && (
        <div className="mt-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">面试难度</label>
            <select
              value={survey.interview.difficulty}
              onChange={(e) => updateField('interview', 'difficulty', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
            >
              <option value="">请选择</option>
              <option value="⭐ 非常简单">⭐ 非常简单</option>
              <option value="⭐⭐ 较简单">⭐⭐ 较简单</option>
              <option value="⭐⭐⭐ 中等难度">⭐⭐⭐ 中等难度</option>
              <option value="⭐⭐⭐⭐ 较难">⭐⭐⭐⭐ 较难</option>
              <option value="⭐⭐⭐⭐⭐ 极难">⭐⭐⭐⭐⭐ 极难</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">面试轮数</label>
            <select
              value={survey.interview.rounds}
              onChange={(e) => updateField('interview', 'rounds', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
            >
              <option value="">请选择</option>
              <option value="1轮">1轮</option>
              <option value="2轮">2轮</option>
              <option value="3轮">3轮</option>
              <option value="4轮">4轮</option>
              <option value="5轮及以上">5轮及以上</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">整体感受</label>
            <select
              value={survey.interview.impression}
              onChange={(e) => updateField('interview', 'impression', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
            >
              <option value="">请选择</option>
              <option value="非常满意，面试体验很好">非常满意，面试体验很好</option>
              <option value="比较满意，流程规范">比较满意，流程规范</option>
              <option value="一般，中规中矩">一般，中规中矩</option>
              <option value="不太满意，体验较差">不太满意，体验较差</option>
              <option value="非常差，建议避坑">非常差，建议避坑</option>
            </select>
          </div>
        </div>
        {/* 面试问题 */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500">面试问题</span>
            <button
              onClick={() => {
                setSurvey(prev => ({
                  ...prev,
                  interview: {
                    ...prev.interview,
                    questions: [...prev.interview.questions, ''],
                  },
                }));
              }}
              className="px-2 py-0.5 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
            >
              + 添加问题
            </button>
          </div>
          <div className="space-y-2">
            {survey.interview.questions.map((q, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-gray-400 text-xs font-mono">Q{index + 1}</span>
                <input
                  type="text"
                  value={q}
                  onChange={(e) => {
                    const newQuestions = [...survey.interview.questions];
                    newQuestions[index] = e.target.value;
                    setSurvey(prev => ({
                      ...prev,
                      interview: { ...prev.interview, questions: newQuestions },
                    }));
                  }}
                  placeholder="输入面试问题..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                {survey.interview.questions.length > 1 && (
                  <button
                    onClick={() => {
                      setSurvey(prev => ({
                        ...prev,
                        interview: {
                          ...prev.interview,
                          questions: prev.interview.questions.filter((_, i) => i !== index),
                        },
                      }));
                    }}
                    className="text-red-400 hover:text-red-600 text-sm"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
        </div>
        )}
      </div>

      {/* 总体评价 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        {renderHeader('rating', 'bg-red-500', '⭐ 总体评价')}
        {!collapsed.rating && (
        <div className="mt-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">综合评级</label>
            <select
              value={survey.rating.score}
              onChange={(e) => updateField('rating', 'score', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
            >
              <option value="">请评分</option>
              <option value="⭐⭐⭐⭐⭐ 强烈推荐">⭐⭐⭐⭐⭐ 强烈推荐</option>
              <option value="⭐⭐⭐⭐ 推荐">⭐⭐⭐⭐ 推荐</option>
              <option value="⭐⭐⭐ 一般">⭐⭐⭐ 一般</option>
              <option value="⭐⭐ 不推荐">⭐⭐ 不推荐</option>
              <option value="⭐ 强烈不推荐">⭐ 强烈不推荐</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">推荐入职</label>
            <select
              value={survey.rating.recommend}
              onChange={(e) => updateField('rating', 'recommend', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
            >
              <option value="">请选择</option>
              <option value="是，推荐">是，推荐</option>
              <option value="否，不推荐">否，不推荐</option>
              <option value="观望，看情况">观望，看情况</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">综合评价</label>
          <textarea
            value={survey.rating.comment}
            onChange={(e) => updateField('rating', 'comment', e.target.value)}
            placeholder="分享你的整体感受、建议、注意事项..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-vertical"
          />
        </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default SurveyEditor;