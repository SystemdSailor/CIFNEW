/*
* 此文件用于承载 对数据库进行数据初始化 的代码
*/
import GUN from 'gun';
import 'gun/sea';
import BigInt from 'big-integer';
import { openDB } from 'idb'; 
const DB_NAME = 'NewprovinceDB2';
const DB_VERSION = 3;

const gun = GUN({
  peers: [
    'https://gun-manhattan.herokuapp.com/gun',
    'https://gun-eu.herokuapp.com/gun',
    'https://gun-us.herokuapp.com/gun',
    'http://localhost:8765/gun'],
  localStorage: false // 启用本地存储
});


const gunDBPreInsert = {
  // 读取指定存储对象"表格"的数据
  readTableData: async (TableName,index) => {
    try {
      const db = await openDB(DB_NAME, DB_VERSION);
      const tx = db.transaction(TableName, 'readonly');
      const store = tx.objectStore(TableName);
      const items = await store.getAll();
     
      for (let item of items) {
        gun.get(item.id).put({index:1});// 更新index计数
        console.log(item.id);
    }
      return items;
    } catch (error) {
      console.error(`读取${TableName}数据时出错:`, error);
      return [];
    }
  },
  
  // 读取所有数据
  PerInsertAllDBData: async () => {
    // 遍历原有数据库的表格
    try {
      const db = await openDB(DB_NAME, DB_VERSION);
      const tableNames = Array.from(db.objectStoreNames);
      const allData = {};
      // 遍历所有表名
      let ProvienceIndex = 0
      for (const [index, tableName] of tableNames.entries()) {
        ProvienceIndex = ProvienceIndex + 1;
        const items = await gunDBPreInsert.readTableData(tableName,ProvienceIndex);
        allData[tableName] = items;
        console.log(`第${index + 1}个`, `${tableName}的数据:`, items);
      }

      console.log('导出的 allData 数据:', allData);
    } catch (error) {
      console.error('读取数据时出错:', error);
    }
  },

};

export default gunDBPreInsert; 