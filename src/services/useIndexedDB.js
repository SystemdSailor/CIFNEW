import React, { useEffect, useState } from "react";
import { openDB } from "idb";

export const useIndexedDB = () => {
  const [db, setDb] = useState(null);

  useEffect(() => {
    const initDB = async () => {
      try {
        const database = await openDB("MyDatabase1", 1, {
          upgrade(db) {
            if (!db.objectStoreNames.contains("myIndexedDBDATA")) {
              db.createObjectStore("myIndexedDBDATA", { keyPath: "id" });
            }
          },
        });
        setDb(database);
      } catch (error) {
        console.error("Failed to open IndexedDB:", error);
      }
    };

    initDB(); 
  }, []); 

  return db;
};
