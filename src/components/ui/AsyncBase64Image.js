import React, { useState, useEffect } from 'react';
import { ipfsClient } from '../../services/ipfsDB';

/**
 * 异步从 IPFS 加载图片并显示为 base64 的 React 组件
 * 支持 data: URI 和 IPFS URL（形如 http://.../{cid}）两种 src 格式
 */
const AsyncBase64Image = ({ src, alt, ...props }) => {
  const [base64Src, setBase64Src] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 如果 src 已经是完整的 Data URI，直接使用
    if (src && src.startsWith('data:')) {
      setBase64Src(src);
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchImageAsBase64 = async () => {
      if (!src) return;
      console.log("AsyncBase64Image fetchImageAsBase64", src);
      setLoading(true);

      try {
        // 从 URL 中提取 CID（src 形如 http://localhost:3456/api/image/{cid}）
        const cid = src.split('/').pop();
        console.log("提取的 CID:", cid);

        // 使用 ipfsClient 的 cidToBase64 方法获取 base64 数据 URI
        const base64 = await ipfsClient.cidToBase64(cid);

        if (isMounted) {
          setBase64Src(base64);
        }
      } catch (error) {
        console.error('Base64 图片加载失败:', error);
        if (isMounted) setBase64Src('');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchImageAsBase64();

    return () => { isMounted = false; };
  }, [src]);

  if (loading) return <span style={{ padding: '8px', background: '#f0f0f0' }}>加载中...</span>;
  if (!base64Src) return <span style={{ color: 'red' }}>图片加载失败</span>;

  return (
    <img
      src={base64Src}
      alt={alt}
      style={{ maxWidth: '100%', borderRadius: '8px', cursor: 'pointer' }}
      onClick={() => window.open(base64Src, '_blank')}
      {...props}
    />
  );
};

export default AsyncBase64Image;