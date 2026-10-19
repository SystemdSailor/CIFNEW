import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import MDEditor from '@uiw/react-md-editor';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSave, 
  faList, 
  faPlus,
  faTrash,
  faExclamationCircle,
  faGlobe,
  faLock,
  faTags,
  faProjectDiagram,
  faBuilding,
  faPencilAlt,
  faClipboardList,
  faQuestionCircle,
  faUpload,
  faDownload,
  faImage,
} from '@fortawesome/free-solid-svg-icons';
import documentService from '../../services/documentService';
import CytoscapeTree from './CytoscapeTree';
import SurveyEditor from './SurveyEditor';
import QAEditor from './QAEditor';
import ImageUploader from './ImageUploader';
import { useIndexedDB } from "../../services/useIndexedDB";
import { v4 as uuidv4 } from 'uuid';
import AsyncBase64Image from '../ui/AsyncBase64Image';

const MarkdownEditor = ({ company }) => {
  let db = useIndexedDB(); 

  const [content, setContent] = useState('');
  const [title, setTitle] = useState(''); 
  const [documents, setDocuments] = useState([]);
  const [currentDocId, setCurrentDocId] = useState(null);
  const [message, setMessage] = useState({ type: '', content: '' });
  const [isPublic, setIsPublic] = useState(false); 
  const [tags, setTags] = useState([]); 
  const [tagInput, setTagInput] = useState(''); 
  const [showGlobalTags, setShowGlobalTags] = useState(false);
  const [category, setCategory] = useState({}); 
  const [categories, setCategories] = useState([
    { label: '技术笔记', id: '1' },
    { label: '学习总结', id: '2' },
    { label: '项目文档', id: '2' },
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [editorMode, setEditorMode] = useState('markdown'); // 'markdown' | 'survey' | 'qa'
  const [companyId, setCompanyId] = useState(''); // 通过导航传入的企业ID
  const [showImageUpload, setShowImageUpload] = useState(false);
  const location = useLocation();
  const categoryFromNav = useRef(false);
  const fileInputRef = useRef(null);

  // 导入 JSON 或 MD 文件
  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const fileText = event.target.result;
      if (file.name.endsWith('.md')) {
        // .md 文件：直接渲染内容到 content
        setContent(fileText);
        showMessage('success', 'Markdown 文件导入成功');
      } else if (file.name.endsWith('.json')) {
        // .json 文件：解析为文档对象
        try {
          const data = JSON.parse(fileText);
          if (data.title) setTitle(data.title);
          if (data.content) setContent(data.content);
          if (data.tags) setTags(data.tags);
          if (data.category) setCategory(data.category);
          if (data.isPublic !== undefined) setIsPublic(data.isPublic);
          showMessage('success', 'JSON 文档导入成功');
        } catch (err) {
          showMessage('error', '导入失败：JSON 格式错误');
        }
      } else {
        showMessage('error', '导入失败：仅支持 .json 和 .md 文件');
      }
    };
    reader.readAsText(file);
    // 重置 input 以便再次选择同一文件
    e.target.value = '';
  };

  // 导出 JSON 文件
  const handleExport = () => {
    const data = {
      title,
      content,
      tags,
      category,
      isPublic,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || '未命名文档'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showMessage('success', '文档导出成功');
  };

  // 接收从 QACard 导航传来的参数（写回答），从 location.state 接收数据
  useEffect(() => {
    if (location.state) {
      if (location.state.title) {
        setTitle(location.state.title);
      }
      if (location.state.editorMode) {
        setEditorMode(location.state.editorMode);
      }
      if (location.state.category) {
        setCategory(location.state.category);
        categoryFromNav.current = true;
      }
      if (location.state.companyId) {
        setCompanyId(location.state.companyId);
      }
      // 清除 state，避免刷新后重复设置
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // 切换编辑器模式时自动设置分类
  useEffect(() => {
    if (categoryFromNav.current) {
      categoryFromNav.current = false; // 清除标记categoryFromNav，确保只生效一次
      return;
    }
    if (editorMode === 'survey') {
      setCategory({ type: 'survey', label: '薪酬' });
    } else if (editorMode === 'qa') {
      setCategory({ type: 'qa', label: '问答' });
    } else {
      setCategory({});
    }
  }, [editorMode]);

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    if (!db) return;
    
    const performDBOperations = async () => {
      try {
        let rawdata = []
        const dbdata = await db.getAll("myIndexedDBDATA")
        dbdata.map((data) => (rawdata.push({label:data.label,id:data.id})));
        setCategories(rawdata);
        console.log("当前所有分类:", rawdata);
      } catch (error) {
        console.error("Error performing DB operations:", error);
      }
    };

    performDBOperations();
  }, [db]);

  // 获取所有文档
  const loadDocuments = async () => {
    try {
      const docs = await documentService.getAllDocuments();
      setDocuments(docs);
      console.log('已加载文档列表:', docs.length, '条记录');
    } catch (err) {
      console.error('加载文档列表失败:', err);
      showMessage('error', '加载文档列表失败');
    }
  };

  // 显示消息
  const showMessage = (type, content) => {
    setMessage({ type, content });
    setTimeout(() => setMessage({ type: '', content: '' }), 3000);
  };


  const createNewDocument = () => {
    const newId = uuidv4();
    setCurrentDocId(newId);
    setContent('');
    setTitle(''); 
    setIsPublic(false); // 新建文档默认为私有
    setTags([]); 
    setTagInput(''); 
    setCategory({}); 
  };

  // 处理标签显示
  const handleTagSubmit = (e) => {
    e.preventDefault();
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const saveDocument = async () => {
    // // 若无当前文档 ID，自动创建新文档
    // if (!currentDocId) {
    //   createNewDocument();
    //   // 创建后需要等待 state 更新，这里不能继续执行
    //   // 用户需再次点击保存
    //   showMessage('error', '已创建新文档，请再次点击保存');
    //   return;
    // }

    // if (isSaving) return; // 防止重复提交
    // setIsSaving(true);

    console.log('========== 保存文档 ==========');
    console.log('关联企业:', company);
    console.log('文档 ID:', currentDocId);
    console.log('标题:', title);
    console.log('内容长度:', content?.length || 0, '字符');
    console.log('标签:', tags);
    console.log('分类:', category);
    console.log('可见性:', isPublic ? '公开' : '私有');
    console.log('==============================');

    try {
      const result = await documentService.save({
        id: currentDocId,
        title,
        content,
        tags,
        category,
        isPublic,
        companyId: companyId || company?.id || '',
      });

      if (result.success) {
        showMessage('success', result.message);
        loadDocuments(); // 刷新文档列表
      } else {
        showMessage('error', result.message);
      }
    } catch (err) {
      console.error('保存文档异常:', err);
      showMessage('error', `保存失败：${err.message || '未知错误'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteDocument = async (id) => {
    try {
      const result = await documentService.delete(id);
      if (result.success) {
        if (currentDocId === id) {
          setCurrentDocId(null);
          setContent('');
          setTitle('');
          setIsPublic(false);
          setTags([]);
          setCategory({});
        }
        loadDocuments();
        showMessage('success', result.message);
      } else {
        showMessage('error', result.message);
      }
    } catch (err) {
      console.error('删除文档异常:', err);
      showMessage('error', `删除失败：${err.message || '未知错误'}`);
    }
  };

  return (
    <div className="container mx-auto p-4">
      {message.content && (
        <div className={`mb-4 p-4 rounded ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          <FontAwesomeIcon 
            icon={message.type === 'success' ? faSave : faExclamationCircle} 
            className="mr-2" 
          />
          {message.content}
        </div>
      )}

      <div className="flex gap-4">
        <div className="flex-1">
          {showGlobalTags ? (
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center space-x-4 mb-4">
                <button
                  onClick={() => setShowGlobalTags(!showGlobalTags)}
                  className="p-2"
                >
                  <FontAwesomeIcon icon={faProjectDiagram} color="blue" />
                </button>
                <h2 className="text-xl font-bold">标签关系图</h2>
              </div>
              <CytoscapeTree documents={documents} />
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="mb-4 flex justify-between items-center">
                <h2 className="text-xl font-bold">
                  {currentDocId ? `编辑文档 ${currentDocId}` : '新建文档'}
                </h2>
                <div className="flex items-center space-x-2">
                  {/* 编辑器模式切换按钮 */}
                  <div className="flex items-center bg-gray-100 rounded-lg p-0.5 mr-2">
                    <button
                      onClick={() => setEditorMode('markdown')}
                      className={`flex items-center px-2.5 py-1.5 text-xs rounded-md transition-colors ${
                        editorMode === 'markdown'
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                      title="Markdown 编辑器"
                    >
                      <FontAwesomeIcon icon={faPencilAlt} className="mr-1.5" />
                      MD
                    </button>
                      <button
                        onClick={() => setEditorMode('survey')}
                        className={`flex items-center px-2.5 py-1.5 text-xs rounded-md transition-colors ${
                          editorMode === 'survey'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                        title="OfferShow 薪酬爆料输入"
                      >
                        <FontAwesomeIcon icon={faClipboardList} className="mr-1.5" />
                        OfferShow
                      </button>
                      <button
                        onClick={() => setEditorMode('qa')}
                        className={`flex items-center px-2.5 py-1.5 text-xs rounded-md transition-colors ${
                          editorMode === 'qa'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                        title="问答输入"
                      >
                        <FontAwesomeIcon icon={faQuestionCircle} className="mr-1.5" />
                        问答
                      </button>
                  </div>

                  <button
                    onClick={() => setShowImageUpload(true)}
                    className="flex items-center px-3 py-1 rounded bg-green-50 text-green-600 hover:bg-green-100 mr-1"
                    title="上传图片到 IPFS"
                  >
                    <FontAwesomeIcon icon={faImage} className="mr-2" />
                    图片
                  </button>

                  {/* 隐藏的文件选择器 */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".json,.md"
                    style={{ display: 'none' }}
                    onChange={handleImport}
                  />
                  <button
                    onClick={() => fileInputRef.current.click()}
                    className="flex items-center px-3 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100"
                    title="导入 JSON 文档"
                  >
                    <FontAwesomeIcon icon={faDownload} className="mr-2" />
                    导入
                  </button>
                  <button
                    onClick={handleExport}
                    className="flex items-center px-3 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100"
                    title="导出为 JSON 文档"
                  >
                    <FontAwesomeIcon icon={faUpload} className="mr-2" />
                    导出
                  </button>
                  <button
                    onClick={saveDocument}
                    disabled={isSaving}
                    className={`px-4 py-2 rounded ${
                      isSaving
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    <FontAwesomeIcon icon={faSave} className="mr-2" />
                    {isSaving ? '保存中...' : '保存'}
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <FontAwesomeIcon icon={faTags} className="text-gray-500" />
                    <span className="font-medium">标签:</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full flex items-center"
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-2 text-blue-700 hover:text-blue-900"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <form onSubmit={handleTagSubmit} className="flex">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="输入标签后按回车添加"
                      className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </form>
                </div>
              </div>

              <div className="mb-4">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="请输入文档标题"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                />
              </div>

              {editorMode === 'markdown' ? (
                <MDEditor
                  value={content}
                  onChange={setContent}
                  height={500}
                  preview="edit"
                  previewOptions={{
                    components: {
                      img: (props) => <AsyncBase64Image {...props} />,
                    },
                  }}
                />
              ) : editorMode === 'survey' ? (
                <SurveyEditor
                  value={content}
                  onChange={setContent}
                  companyName={company?.name || ''}
                />
              ) : (
                <QAEditor
                  value={content}
                  onChange={setContent}
                  companyName={company?.name || ''}
                  onYesNoChange={(checked) => {
                    if (checked) {
                      setCategory({ type: 'qa-tf', label: '问答-TF' });
                    } else {
                      setCategory({ type: 'qa', label: '问答' });
                    }
                  }}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* 图片上传弹窗 */}
      {showImageUpload && (
        <ImageUploader
          companyId={companyId || company?.id || ''}
          onUploadSuccess={(cid) => {
            const imageMarkdown = `![图片](http://localhost:3456/api/image/${cid})`;
            setContent((prev) => (prev ? prev + '\n\n' + imageMarkdown : imageMarkdown));
            setShowImageUpload(false);
          }}
          onClose={() => setShowImageUpload(false)}
        />
      )}
    </div>
  );
};

export default MarkdownEditor;