// 导入 Gun 库和 SEA (Security, Encryption, Authorization) 模块
import GUN from 'gun';
import 'gun/sea';
import BigInt from 'big-integer';
import md5 from 'js-md5';// MD5

const gun = GUN({
  peers: [
    'https://gun-manhattan.herokuapp.com/gun',
    'https://gun-eu.herokuapp.com/gun',
    'https://gun-us.herokuapp.com/gun',
    'http://localhost:8765/gun'],
  localStorage: false // 启用本地存储
});

// 创建用户实例并启用会话存储
const user = gun.user().recall({ sessionStorage: true });

// 导出 Gun 相关工具函数
const gunService = {
  register: async (username, password) => {
    return new Promise((resolve, reject) => {
      user.create(username, password, (ack) => {
        if (ack.err) {
          reject(ack.err);
        } else {
          resolve(ack);
        }
      });
    });
  },

  login: async (username, password) => {
    return new Promise((resolve, reject) => {
      user.auth(username, password, (ack) => {
        if (ack.err) {
          reject(ack.err);
        } else {
          resolve(ack);
        }
      });
    });
  },

  logout: () => {
    user.leave();
  },

  saveUserProfile: (data) => {
    const userProfile = user.get('profile');
    userProfile.put(data);
    return new Promise((resolve) => {
      userProfile.once((savedData) => resolve(savedData));
    });
  },

  getUserProfile: () => {
    return new Promise((resolve) => {
      user.get('profile').once((data) => {
        resolve(data);
      });
    });
  },

  saveMarkdown: (id, content, isPublic = false, tags = [], category = "uncategorized", title = "wuti") => {
    let tagObject = tags.join('+');
    console.log("tagObject", tagObject);
    let data = null;
    if (user && user.is && user.is.alias) {
      data = {
        content,
        timestamp: Date.now(),
        author: user.is.alias,
        isPublic,
        tagObject,
        category,
        title
      };
    }else{
      data = {
        content,
        timestamp: Date.now(),
        author: 'anonymous',
        isPublic,
        tagObject,
        category,
        title
      };
      gunService.saveMarkdown_anonymous(id,data);
      return 0;
    }

    const markdownNode = user.get('markdowns').get(id);
    markdownNode.put(data);
    // 如果是公开文档，则保存到公共空间
    if (isPublic) {
      gun.get('tname-all-articles').get(id).put(data);
    } else {
      // 如果设为私有，从公共空间移除
      gun.get('tname-all-articles').get(id).put(null);
    }
    return new Promise((resolve) => {
      markdownNode.once((savedData) => resolve(savedData));
    });
  },

  saveMarkdown_anonymous: (id,data) => {
      gun.get('tname-all-articles').get(id).put(data);
  },

  saveCIDToIPFS: (id, cid) => {
    if (cid == null) {
      console.log("值为null或undefined");
    }else{
      const now = new Date();
      const formattedDate = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}-CIFNEW-DATA`;
      const hash = md5(formattedDate);
      let data = {id,cid};
      gun.get(hash).put(data);
    }
  },

  getMarkdowns: () => {
    return new Promise((resolve) => {
      user.get('markdowns').once((data) => {
        const docs = data ?
          Object.entries(data)
            .filter(([key]) => key !== '_') // 过滤掉内部使用的字段
            .reduce((acc, [key, value]) => {
              acc[key] = value;
              return acc;
            }, {})
          : {};
        resolve(docs);
      });
    });
  },

  getMarkdown: (id) => {
    return new Promise((resolve) => {
      user.get('markdowns').get(id).once((data) => {
        resolve(data);
      });
    });
  },

  deleteMarkdown: (id) => {
    return new Promise((resolve) => {
      user.get('markdowns').get(id).put(null);
      resolve(true);
    });
  },

  getAllArticles: () => {
    return new Promise((resolve) => {
      const articles = [];
      gun.get('tname-all-articles').map().once((data, id) => {
        console.log("gunService.getAllArticles :", data)
        if (data && id !== '_') {
          articles.push({
            id,
            ...data
          });
        }
      });
      console.log("gunService.getAllArticles :", articles)
      // 给异步操作一些时间来收集数据
      setTimeout(() => resolve(articles), 100);
    });
  },

  getArticleById: async (id) => {
    return new Promise((resolve) => {
      gun.get('tname-all-articles').get(id).once((data) => {
        console.log("getArticleById", id, " is ", data)
        if (data) {
          resolve({
            id: id,
            ...data
          });
        } else {
          resolve(null);
        }
      });
    });
  },

  //获取树状图的子节点数组
  getChildernodeArray: async (parentnodeid) => {
    const arr = [];
    const pushNode = async (val) => {
      return new Promise((resolve) => {
        gun.get(val).once((childData) => {
          if (!childData) {
            childData = {};
          }
          childData.id = val;
          arr.push(childData);
          resolve(); // 标记当前节点的操作完成
        });
      });
    };

    // 收集所有子节点的 Promise
    const childPromises = [];
    gun.get(parentnodeid + '/children').map().once((v) => {
      childPromises.push(pushNode(v));
    });
    await Promise.all(childPromises);// 等待所有子节点数据加载完成

    // 当前点击节点的数据
    const userData = gun.get(parentnodeid);
    await userData.once((data) => {
      console.log('当前点击节点的数据为:', data);
    });

    return arr; // 确保所有异步操作完成后返回
  },

  // 获取分类id , groupindex为当前的编码索引
  getindex1: (parentid, groupindex, canreuse = []) => {
    let cur_index = BigInt(groupindex + 1)
    const groupsizes = [BigInt(10000), BigInt(100), BigInt(100), BigInt(100)]
    let parentid_num = BigInt(parentid);
    //如果当前节点是最后一层节点，返回错误
    if (parentid_num % groupsizes[groupsizes.length - 1] != 0) {
      console.log("当前的节点在获取id时出现问题:", parentid_num, "parentid_num%", groupsizes[-1], "的值为：", parentid_num % groupsizes[-1])
      return null;
    }
    let i = 1, newid = BigInt(1);
    let tail_part = BigInt(1);
    let before_tail_part = BigInt(1);
    for (i = 1; i <= groupsizes.length; i++) {
      if ((parentid_num % groupsizes[groupsizes.length - i]) == 0) {
        parentid_num = parentid_num / groupsizes[groupsizes.length - i]
        tail_part = tail_part * groupsizes[groupsizes.length - i];
        if (i > 1) {// before_tail_part比tail_part少乘法一次
          before_tail_part = before_tail_part * groupsizes[groupsizes.length - (i - 1)];
        }
      } else {
        console.log("getindex1", before_tail_part)
      }
    }
    console.log("tail_part", tail_part, parentid_num % tail_part)
    newid = (BigInt(parentid) / before_tail_part + cur_index) * before_tail_part;
    console.log(newid.toString())
    return newid.toString();
  },
  getindex: (parentid, groupindex, canreuse = []) => {
    let cur_index = BigInt(groupindex + 1)
    const groupsizes = [BigInt(10), BigInt(100), BigInt(1000000), BigInt(100), BigInt(100), BigInt(100), BigInt(100), BigInt(100), BigInt(100), BigInt(100), BigInt(100), BigInt(100), BigInt(100)]
    let parentid_num = BigInt(parentid);
    //如果当前节点是最后一层节点，返回错误
    if (parentid_num.mod(groupsizes[groupsizes.length - 1]) != 0) {
      console.log("如果当前节点是最后一层节点，返回错误", "当前的节点在获取id时出现问题:", parentid_num, "parentid_num%", groupsizes[groupsizes.length - 1], "的值为：", parentid_num.mod(groupsizes[groupsizes.length - 1]))
      console.log(parentid_num, "parentid_num%", groupsizes[groupsizes.length - 1], "的值为：", parentid_num % groupsizes[groupsizes.length - 1])
      console.log(parentid_num, "parentid_num.mod(", groupsizes[groupsizes.length - 1], ")的值为：", parentid_num.mod(groupsizes[groupsizes.length - 1]))
      return null;
    }

    let i = 1, newid = BigInt(1);
    let tail_part = BigInt(1);// 获取parentid的尾部
    let before_tail_part = BigInt(1);
    for (i = 1; i <= groupsizes.length; i++) {
      if (parentid_num.mod(groupsizes[groupsizes.length - i]) == 0) {
        parentid_num = parentid_num.divide(groupsizes[groupsizes.length - i])
        tail_part = tail_part.multiply(groupsizes[groupsizes.length - i]);
        if (i > 1) {// before_tail_part比tail_part少乘法一次
          before_tail_part = before_tail_part.multiply(groupsizes[groupsizes.length - (i - 1)]);
          console.log("===", before_tail_part)
        }
        console.log("---", before_tail_part)
      } else {
        console.log("+++", before_tail_part)
      }
    }

    let newid_ = BigInt(parentid).divide(before_tail_part)
    newid = (newid_.add(cur_index)).multiply(before_tail_part);
    console.log(newid.toString())

    return newid.toString();
  },

  setNodeArray: async (parentnodeid, newNodeLabel, name = 'testname') => {
    newNodeLabel["author"] = user.is?.alias;
    const jsonString = JSON.stringify(newNodeLabel); console.log(jsonString);
    const arr = [];
    const userData = gun.get(parentnodeid);

    await userData.once(data => {
      console.log('Stored Data:', data, jsonString);
      userData.put({ index: 1, props: jsonString })
      userData.put({ jsonString })
    });
    return arr;
  },
  setChildernodeArray: async (parentnodeid, newNodeLabel, name = 'testname') => {
    newNodeLabel["author"] = user.is?.alias;
    const jsonString = JSON.stringify(newNodeLabel); console.log(jsonString);
    const arr = [];
    const userData = gun.get(parentnodeid);
    let groupindex = 200;
    await userData.once(data => {
      console.log('Stored Data:', data);
      groupindex = (data && data.index !== undefined) ? data.index : 1;
      console.log("当前父节点的索引值为：", groupindex)
    });

    userData.once(data => {
      console.log('Stored Data:', data);
    });

    // 在父节点的位children放入子节点的id
    let childid = gunService.getindex(parentnodeid, groupindex);
    console.log("新的子节点id为：", childid)
    if (childid != null) {
      gun.get(parentnodeid).get('children').set(childid);
    } else {
      console.log("error : 已经为最后一层节点");
    }
    gun.get(parentnodeid).put({ index: groupindex + 1 });// 更新index计数
    // 创建子节点并将数据放入 GunDB
    console.log("新增子节点", childid)
    gun.get(childid).put({ index: 1, props: jsonString });
    return arr;
  },

};

export default gunService; 