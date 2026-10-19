import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';
import signatureService from '../../services/signatureService';

/** 用户信息支持的字段（导入时按白名单过滤，避免写入未知字段） */
const PROFILE_FIELDS = ['name', 'email', 'phone', 'address', 'company', 'position'];

/**
 * 用户信息填写模态框
 * @param {object} props
 * @param {boolean} props.isOpen - 是否显示
 * @param {function} props.onClose - 关闭回调
 * @param {function} props.onSave - 保存回调 (data) => void
 * @param {object} props.initialData - 初始数据（编辑时传入）
 *
 * 支持把用户信息（含 signatureService 持久化的两个签名密钥）导出/导入为 JSON 文件；
 * 导入只填充表单，点击「保存」时才一并写入 localStorage。
 */
const UserProfileModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    company: '',
    position: '',
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: '', content: '' }); // 操作提示（3 秒后自动消失）
  const fileInputRef = useRef(null); // 隐藏的文件选择框
  const [pendingSignature, setPendingSignature] = useState(null); // 导入的签名密钥，待「保存」时落库

  // 显示操作提示
  const showMessage = (type, content) => {
    setMessage({ type, content });
    setTimeout(() => setMessage({ type: '', content: '' }), 3000);
  };

  useEffect(() => {
    // 从本地存储读取已保存的用户信息（优先使用传入的 initialData）
    let savedData = null;
    try {
      const stored = localStorage.getItem('userProfile');
      if (stored) {
        savedData = JSON.parse(stored);
      }
    } catch (err) {
      console.error('读取本地用户信息失败:', err);
    }

    const baseData = initialData || savedData;
    if (baseData) {
      setFormData({
        name: baseData.name || '',
        email: baseData.email || '',
        phone: baseData.phone || '',
        address: baseData.address || '',
        company: baseData.company || '',
        position: baseData.position || '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        company: '',
        position: '',
      });
    }
    setErrors({});
    setMessage({ type: '', content: '' });
    setPendingSignature(null);
  }, [initialData, isOpen]);

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    // 清除对应字段的错误提示
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = '姓名不能为空';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const userData = { ...formData };
    // 保存用户信息到本地存储
    try {
      localStorage.setItem('userProfile', JSON.stringify(userData));
    } catch (err) {
      console.error('保存用户信息到本地失败:', err);
    }

    // 导入时携带的签名密钥随「保存」一并落库；未导入则保持原值不动
    if (pendingSignature) {
      signatureService.importStoredKeys(pendingSignature);
      setPendingSignature(null);
    }

    const saveFn = onSave || ((data) => {
      console.log('保存用户信息:', data);
    });
    saveFn(userData);
    onClose();
  };

  // 导出用户信息为 JSON 文件
  const handleExport = () => {
    // signatureService 持久化的两个 localStorage key 一并导出
    const signature = signatureService.exportStoredKeys();
    const hasSignature = !!(signature.publicKey || signature.privateKey);
    const hasData = PROFILE_FIELDS.some((field) => (formData[field] || '').trim()) || hasSignature;
    if (!hasData) {
      showMessage('error', '没有可导出的用户信息');
      return;
    }

    // 文件名时间戳（YYYYMMDDHHmmss）
    const stamp = new Date().toISOString().slice(0, 19).replace(/[-:T]/g, '');
    const safeName = (formData.name || 'unnamed').replace(/[\\/:*?"<>|]/g, '_').trim() || 'unnamed';
    const data = {
      version: '1.1',
      exportedAt: new Date().toISOString(),
      ...PROFILE_FIELDS.reduce((acc, field) => ({ ...acc, [field]: formData[field] || '' }), {}),
      signature,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `userProfile_${safeName}_${stamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showMessage('success', '用户信息导出成功');
  };

  // 从 JSON 文件导入用户信息（仅填充表单，点击「保存」后才写入本地）
  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.json')) {
      showMessage('error', '导入失败：仅支持 .json 文件');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      let data;
      try {
        data = JSON.parse(event.target.result);
      } catch (err) {
        console.error('解析用户信息 JSON 失败:', err);
        showMessage('error', '导入失败：JSON 格式错误');
        return;
      }

      // 兼容 { userProfile: {...} } 包装格式
      let raw = null;
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        raw = data.userProfile && typeof data.userProfile === 'object'
          ? data.userProfile
          : data;
      }

      if (!raw) {
        showMessage('error', '导入失败：文件内容不是有效的用户信息对象');
        return;
      }

      // 按白名单提取字段，未知字段一律忽略
      const imported = {};
      let matched = 0;
      PROFILE_FIELDS.forEach((field) => {
        const value = raw[field];
        if (value !== undefined && value !== null) {
          imported[field] = String(value);
          if (imported[field].trim()) matched += 1;
        } else {
          imported[field] = '';
        }
      });

      // 签名密钥备份（兼容顶层与 { userProfile: {...} } 包装层两种写法）
      const signature = (raw.signature && typeof raw.signature === 'object')
        ? raw.signature
        : (data.signature && typeof data.signature === 'object' ? data.signature : null);
      const sigPublic = signature && typeof signature.publicKey === 'string' ? signature.publicKey.trim() : '';
      const sigPrivate = signature && typeof signature.privateKey === 'string' ? signature.privateKey.trim() : '';
      const signatureKeys = (sigPublic && sigPrivate) ? { publicKey: sigPublic, privateKey: sigPrivate } : null;

      if (matched === 0 && !signatureKeys) {
        showMessage('error', '导入失败：未找到可用的用户信息字段');
        return;
      }

      setFormData(imported);
      setErrors({});
      // 方案 A：签名密钥也只暂存，点击「保存」时才写入 localStorage
      setPendingSignature(signatureKeys);
      showMessage(
        'success',
        signatureKeys
          ? '用户信息导入成功（含签名密钥），请确认后点击保存'
          : '用户信息导入成功，请确认后点击保存'
      );
    };
    reader.readAsText(file);
    // 重置 input 以便再次选择同一文件
    e.target.value = '';
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">帐号数据</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 操作提示 */}
        {message.content && (
          <div
            className={cn(
              'mx-6 mt-4 p-3 rounded-xl text-sm flex items-center gap-2',
              message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            )}
          >
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              {message.type === 'success' ? (
                <path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 111.4-1.4l3.3 3.3 6.8-6.8a1 1 0 011.4 0z" clipRule="evenodd" />
              ) : (
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              )}
            </svg>
            {message.content}
          </div>
        )}

        {/* 导入 / 导出工具栏 */}
        <div className="flex items-center gap-2 px-6 pt-4">
          <input
            type="file"
            ref={fileInputRef}
            accept=".json,application/json"
            aria-label="选择用户信息 JSON 文件"
            style={{ display: 'none' }}
            onChange={handleImport}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current.click()}
            title="导入用户信息 JSON 文件"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 11l5 5 5-5M12 16V4" />
            </svg>
            导入
          </button>
          <button
            type="button"
            onClick={handleExport}
            title="导出为用户信息 JSON 文件"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 8l5-5 5 5M12 3v12" />
            </svg>
            导出
          </button>
        </div>

        {/* 隐私提示：导出内容含签名私钥 */}
        <p className="px-6 pt-2 text-xs text-amber-600">
          导出的 JSON 含本地签名私钥（cifnew.signature.*），请妥善保管、勿分享；导入后需点击「保存」才会写入本机。
        </p>

        {/* 表单内容 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* 姓名（必填） */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              姓名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={handleChange('name')}
              placeholder="请输入姓名"
              className={cn(
                'w-full px-4 py-2.5 border rounded-xl text-sm transition-colors outline-none',
                'focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500',
                errors.name
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300 bg-white hover:border-gray-400'
              )}
            />
            {errors.name && (
              <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                {errors.name}
              </p>
            )}
          </div>

          {/* 邮箱 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">邮箱</label>
            <input
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              placeholder="请输入邮箱地址"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm transition-colors outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-400"
            />
          </div>

          {/* 电话 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">电话</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={handleChange('phone')}
              placeholder="请输入电话号码"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm transition-colors outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-400"
            />
          </div>

          {/* 地址 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">地址</label>
            <input
              type="text"
              value={formData.address}
              onChange={handleChange('address')}
              placeholder="请输入地址"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm transition-colors outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-400"
            />
          </div>

          {/* 公司 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">公司</label>
            <input
              type="text"
              value={formData.company}
              onChange={handleChange('company')}
              placeholder="请输入公司名称"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm transition-colors outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-400"
            />
          </div>

          {/* 职位 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">职位</label>
            <input
              type="text"
              value={formData.position}
              onChange={handleChange('position')}
              placeholder="请输入职位"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm transition-colors outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-400"
            />
          </div>

          {/* 按钮区域 */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 rounded-xl transition-all shadow-md hover:shadow-lg"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProfileModal;