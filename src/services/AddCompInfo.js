import { openDB } from "idb";

const DB_NAME = 'NewprovinceDB2';
const DB_VERSION = 3;


const initDB = async (data) => {
  const db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // 获取所有省份并为每个省份创建一个对象仓库
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          if (!db.objectStoreNames.contains(key)) {
            db.createObjectStore(key, { keyPath: 'id' });
          }
        }
      }
    },
  });
  return db;
};

// 将数据存储到IndexedDB
const storeData = async (jsonData) => {
  try {
    const db = await initDB(jsonData);
    // 存储每个省份的数据
    for (const [province, items] of Object.entries(jsonData)) {
      const tx = db.transaction(province, 'readwrite');
      const store = tx.objectStore(province);
      // 清除现有数据
      await store.clear();
      // 存储新数据
      for (const item of items) {
        await store.add(item);
      }
      await tx.done;
      console.log(`${province}的数据已存储`);
    }
    console.log('所有数据已成功存储到IndexedDB');
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
