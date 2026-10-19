import React, { useState, useRef } from 'react';
import ipfsService from '../../services/ipfsDB';

const ImageUploader = ({ onUploadSuccess, onClose, companyId = '' }) => {
  const [preview, setPreview] = useState(null);
  const [base64, setBase64] = useState('');
  const [mimeType, setMimeType] = useState('');
  const [imageType, setImageType] = useState('00'); // 00 未定义 / 01 环境 / 02 数据
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 只接受图片
    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件');
      return;
    }

    setMimeType(file.type);
    setError('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      setPreview(dataUrl);
      // 去掉 data:image/xxx;base64, 前缀，只保留纯 base64
      const base64Str = dataUrl.split(',')[1];
      setBase64(base64Str);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!base64) return;
    setUploading(true);
    setError('');

    try {
      const result = await ipfsService.uploadImage(base64, mimeType, {
        companyId: companyId || '',
        imageType: imageType || '00',
      });
      onUploadSuccess(result.cid);
    } catch (err) {
      setError(`上传失败: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-96">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">上传图片</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* 文件选择 */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
        <button
          onClick={() => fileInputRef.current.click()}
          className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 mb-4"
        >
          选择图片
        </button>

        {/* 预览 */}
        {preview && (
          <div className="mb-4">
            <img
              src={preview}
              alt="预览"
              className="max-w-full max-h-48 mx-auto rounded"
            />
          </div>
        )}

        {/* 图像类型 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">图像类型</label>
          <select
            value={imageType}
            onChange={(e) => setImageType(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="00">00 未定义类型</option>
            <option value="01">01 环境类型</option>
            <option value="02">02 数据类型</option>
          </select>
        </div>

        {/* 错误信息 */}
        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 text-sm rounded">
            {error}
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
            disabled={uploading}
          >
            取消
          </button>
          <button
            onClick={handleUpload}
            disabled={!base64 || uploading}
            className={`px-4 py-2 rounded ${
              !base64 || uploading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {uploading ? '上传中...' : '上传'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;