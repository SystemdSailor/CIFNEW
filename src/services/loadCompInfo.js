const loadAndStoreData = () => {
    fetch('/allData.json')
      .then((response) => response.json())
      .then((jsonData) => {
        // 将 jsonData 保存到 window 对象中
        window.jsonData = jsonData;
  
        // 可选：在控制台打印 jsonData 以确认其已存储
        console.log('JSON Data has been stored in window.jsonData:', window.jsonData);
  
        // 打印 jsonData 中的所有 key 和 value
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
  
  export { loadAndStoreData };
  