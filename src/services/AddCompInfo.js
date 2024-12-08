import { openDB } from "idb";

const DB_NAME = 'NewprovinceDB2';
const DB_VERSION = 3;

const initDB = async (data) => {
  const db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      // 创建新的对象仓库
      for (const key in data) {
        if (!db.objectStoreNames.contains(key)) {
          db.createObjectStore(key, { keyPath: 'id' });
        }
      }
    },
  });
  return db;
};

const storeData = async (jsonData) => {
  try {
    const db = await initDB(jsonData);
    for (const [province, items] of Object.entries(jsonData)) {
      try {
        const tx = db.transaction(province, 'readwrite');
        const store = tx.objectStore(province);
        const promises = items.map(item => store.put(item));
        await Promise.all(promises);
        console.log(`${province} 的数据已存储`);
      } catch (error) {
        console.error(`${province} 的数据存储失败:`, error);
      }
    }
    console.log('所有数据已成功存储到 IndexedDB');
  } catch (error) {
    console.error('存储数据时出错:', error);
  }
};

// 读取JSON文件并存储到IndexedDB
const loadAndStoreData = () => {

  fetch('/allData.json')
    .then((response) => response.json())
    .then((jsonData) => {
      storeData(jsonData);
      for (const key in jsonData) {
        if (jsonData.hasOwnProperty(key)) {
          console.log(key, "---", jsonData[key]);
        }
      }
    })
    .catch((error) => {
      console.error('读取JSON文件出错:', error);
    });
};


export { loadAndStoreData, storeData, initDB };
