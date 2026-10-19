/**
 * 配置文件
 * 
 * 集中管理应用级配置项，包括 IPFS 连接参数等。
 */
const config = {
  ipfs: {
    // 优先使用完整 URL（例如：'http://localhost:5001/api/v0'）
    url: 'http://localhost:5001/api/v0',// process.env.REACT_APP_IPFS_URL || '',
    
    // 若未配置 url，则使用以下参数拼接
    host: process.env.REACT_APP_IPFS_HOST || 'localhost',
    port: process.env.REACT_APP_IPFS_PORT || 5001,
    protocol: process.env.REACT_APP_IPFS_PROTOCOL || 'http',
  },

  // gunDB 配置
  gun: {
    peers: process.env.REACT_APP_GUN_PEERS
      ? process.env.REACT_APP_GUN_PEERS.split(',')
      : ['http://localhost:8765/gun'],
  },
};

export default config;