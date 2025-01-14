import { create } from "kubo-rpc-client";

const DATA_SIZE = 812;

// 本地 IPFS 节点的多地址
const API_MULTIADDR = "/ip4/127.0.0.1/tcp/5001";

// 网关列表
const GATEWAYS = [
  "http://127.0.0.1:8081"
];

const ipfsService = {
  saveMarkdown: async (id, content, isPublic = false, tags = [], category = "uncategorized", title = "wuti") => {
    let tagObject = tags.join('+');
    console.log("tagObject", tagObject)
    const data = {
      content,
      timestamp: Date.now(),
      author: "anonymous",// TODO
      isPublic,
      tagObject,
      category,
      title
    };
    console.log("保存 Markdown 内容:", data)

    try {
      const ipfs = create(API_MULTIADDR);
      const result = await ipfs.add(JSON.stringify(data));
      const { cid } = result;
      await ipfsService.checkGateways(cid);
      return cid.toString();
    } catch (e) {
      return null;
    }
  },

  // 读取内容
  fetchMarkdown : async (cidToFetch) => {
    try {
      const ipfs = create(API_MULTIADDR);
      console.log(ipfs)
      const chunks = [];
      
      // 使用 for await...of 遍历异步迭代器
      for await (const chunk of ipfs.cat(cidToFetch)) {
        chunks.push(chunk);
        console.log('chunk',chunk)
      }
      
      // 将所有块连接成一个 Uint8Array
      const allChunks = new Uint8Array(chunks.reduce((acc, chunk) => [...acc, ...chunk], []));
      console.log('allChunks',allChunks)
      // 尝试将内容解码为文本
      try {
        const content = new TextDecoder().decode(allChunks);
        return content;
      } catch (e) {
        // 如果解码失败，显示二进制数据的长度
        console.log(`二进制数据，长度: ${allChunks.length} 字节`);
        return null;
      }
    } catch (e) {
      console.log(`获取失败: ${e.message}`);
      return null;
    }
  },

  // 检查网关可用性
  checkGateways : async (cid) => {
    await Promise.all(
      GATEWAYS.map((gateway) =>
        fetch(`${gateway}/ipfs/${cid.toString()}`)
          .then((res) => {
            if (!res.ok) {
              throw Error(`${gateway} 响应错误: ${res.status}`);
            } else {
              const gatewayMessage = `在 ${gateway} 上找到 ${cid.toString()}\n`;
              console.log(gatewayMessage);
            }
          })
          .catch((e) => {
            console.log(e.message);
          })
      )
    );
  },
};

export default ipfsService; 