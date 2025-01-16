import React, { useState, useEffect } from 'react';
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
} from '@fortawesome/free-solid-svg-icons';
import gunService from '../../services/gunDB';
import ipfsService from '../../services/ipfsDB';
import CytoscapeTree from './CytoscapeTree';
import { useIndexedDB } from "../../services/useIndexedDB";

const MarkdownEditor = () => {
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
  const [categories, setCategories] = useState([{label:'技术笔记',id:"1"},{label:'学习总结',id:"2"},{label:'项目文档',id:"2"}]); // 预设的分类列表
  
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
      const docs = await gunService.getMarkdowns();
      console.log('error', '获取所有文档',docs);
      if (docs) {
        const docList = Object.entries(docs)
          .filter(([key, value]) => key !== '_' && value)
          .map(([key, value]) => ({
            id: key,
            ...value
          }));
          console.log('loadDocuments函数', '加载文档得到列表',docList);
        setDocuments(docList);
      }
    } catch (err) {
      showMessage('error', '加载文档列表失败');
    }
  };

  // 显示消息
  const showMessage = (type, content) => {
    setMessage({ type, content });
    setTimeout(() => setMessage({ type: '', content: '' }), 3000);
  };


  const createNewDocument = () => {
    const newId = Date.now().toString();
    setCurrentDocId(newId);
    setContent('');
    setTitle(''); 
    setIsPublic(false); // 新建文档默认为私有
    setTags([]); 
    setTagInput(''); 
    setCategory({}); 
  };

  const loadDocument = async (id) => {
    try {
      const doc = await gunService.getMarkdown(id);
      if (doc) {
        setContent(doc.content);
        setTitle(doc.title || ''); 
        setCurrentDocId(id);
        setIsPublic(doc.isPublic || false);
        const tagArray = doc.tagObject ? doc.tagObject.split('+') : [];
        setTags(tagArray);
        setCategory(doc.category || ''); 
      }
    } catch (err) {
      showMessage('error', '加载文档失败');
    }
  };


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
    if (!currentDocId) {
      showMessage('error', '请先创建新文档');
      return;
    }

    try {
      await gunService.saveMarkdown(currentDocId, content, isPublic, tags, category, title); 
      let cid = await ipfsService.saveMarkdown(currentDocId, content, isPublic, tags, category, title); 
      console.log("article key in ipfs:",cid);// TODO 显示保存后的提示信息
      await gunService.saveCIDToIPFS(currentDocId, cid); 
      showMessage('success', isPublic ? '文档已保存并发布' : '文档已保存');
      loadDocuments(); // 刷新文档列表
    } catch (err) {
      showMessage('error', '保存失败');
    }
  };

  const deleteDocument = async (id) => {
    try {
      await gunService.deleteMarkdown(id);
      if (currentDocId === id) {
        setCurrentDocId(null);
        setContent('');
        setIsPublic(false);
      }
      loadDocuments();
      showMessage('success', '文档已删除');
    } catch (err) {
      showMessage('error', '删除失败');
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
        <div className="w-64 bg-white rounded-lg shadow-md p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold">
              <FontAwesomeIcon icon={faList} className="mr-2" />
              文档列表
            </h3>
            <button
              onClick={createNewDocument}
              className="p-2 text-blue-600 hover:text-blue-800"
            >
              <FontAwesomeIcon icon={faPlus} />
            </button>
          </div>
          
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className={`p-2 rounded cursor-pointer flex justify-between items-center ${
                  currentDocId === doc.id ? 'bg-blue-100' : 'hover:bg-gray-100'
                }`}
                onClick={() => loadDocument(doc.id)}
              >
                <div className="flex items-center space-x-2">
                  <FontAwesomeIcon 
                    icon={doc.isPublic ? faGlobe : faLock}
                    className={`${doc.isPublic ? 'text-green-500' : 'text-gray-500'}`}
                  />
                  <span className="truncate">{ doc.title ? doc.title: `文档 ${doc.id}`}</span>
                </div>
                <FontAwesomeIcon 
                  icon={faTrash} 
                  className="text-red-500 hover:text-red-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteDocument(doc.id);
                  }}
                />
              </div>
            ))}
          </div>
        </div>

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
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setIsPublic(!isPublic)}
                    className={`flex items-center px-3 py-1 rounded ${
                      isPublic 
                        ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <FontAwesomeIcon icon={isPublic ? faGlobe : faLock} className="mr-2" />
                    {isPublic ? '公开' : '私有'}
                  </button>

                  <button
                    onClick={saveDocument}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    <FontAwesomeIcon icon={faSave} className="mr-2" />
                    保存
                  </button>
                </div>
              </div>
              

              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <button
                      onClick={() => setShowGlobalTags(!showGlobalTags)}
                      >
                      <FontAwesomeIcon icon={faProjectDiagram} color="blue" />
                    </button>
                    <span className="font-medium">所属分类: </span>
                  </div>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">请选择分类</option>
                    {categories.map((cat) => (
                      <option key={cat.label} value={cat.label+"+"+cat.id}>
                        { cat.label}
                      </option>
                    ))}
                  </select>
                </div>

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

              <MDEditor
                value={content}
                onChange={setContent}
                height={500}
                preview="edit"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarkdownEditor; 