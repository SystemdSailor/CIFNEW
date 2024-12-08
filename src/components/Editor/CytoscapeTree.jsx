import React, { useEffect, useRef, useState } from 'react';
import './CytoscapeTree.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import cxtmenu from "cytoscape-cxtmenu";
import gunService from '../../services/gunDB';
import AddNodeModal from './AddNodeModal';
import UpdateNodeModal from './UpdateNodeModal';
import { useIndexedDB } from "../../services/useIndexedDB";
import Select from 'react-select';

import { openDB } from 'idb'; 
const DB_NAME = 'NewprovinceDB2';
const DB_VERSION = 3;

cytoscape.use(dagre);
cytoscape.use(cxtmenu);

const CytoscapeTree = () => {
    let db = useIndexedDB();
    var [IndexedDBDATA, setIndexedDBDATA] = useState([]);
    const cyRef = useRef(null);
    const containerRef = useRef(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [updataOpen, setUpdateOpen] = useState(false);
    const [selectedNodeId, setSelectedNodeId] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [currentNodeId, setcurrentNodeId] = useState(null);
    const [selectedOption1, setSelectedOption1] = useState(null);
    const [selectedOption2, setSelectedOption2] = useState(null);
    const [options1, setOptions1] = useState([]);
    const [options2, setOptions2] = useState([]);

    useEffect(() => {// 读取IndexedDB Comp数据
        PerInsertAllDBData();
    }, []);

    useEffect(() => {// 读取IndexedDB数据
        if (!db) return; // 如果数据库尚未初始化完成，直接返回
        const performDBOperations = async () => {
          try {
            setIndexedDBDATA(await db.getAll("myIndexedDBDATA"));
            console.log("获取所有数据 setIndexedDBDATA:", await db.getAll("myIndexedDBDATA"));
          } catch (error) {
            console.error("Error performing DB operations:", error);
          }
        };
    
        performDBOperations();
      }, [db]);

    useEffect(() => {
        cyRef.current = cytoscape({
            container: containerRef.current,
            elements: {
                nodes: [{
                    data: {
                        id: '112345612345123451234512345',
                        label: 'HelloWorlD',
                        author: "CIFNEW",
                        city : "N/A",
                        details : "N/A",
                        englishName : "N/A",
                        fullCompanyName : "N/A",
                        parentid :"N/A",
                        province : "N/A",
                        stockCode: "N/A",
                        tags : "N/A",
                        value : "N/A",
                        expanded: false,
                        hasChildren: true
                    }}],
                edges: []
            },
            style: [
                {
                    selector: 'node',
                    style: {
                        'background-color': '#007bff',
                        'label': 'data(label)',
                        'width': 40,
                        'height': 40,
                        'text-valign': 'center',
                        'text-halign': 'center',
                        'font-size': '6px',
                        'color': '#fff',
                        'border-width': 2,
                        'border-color': '#0056b3'
                    }
                },
                {
                    selector: 'edge',
                    style: {
                        'width': 2,
                        'line-color': '#999',
                        'curve-style': 'bezier',
                        'target-arrow-shape': 'triangle',
                        'target-arrow-color': '#999',
                        'arrow-scale': 1.2
                    }
                },
                {
                    selector: 'node.new-node',
                    style: {
                        'background-color': '#aaa',
                        'label': 'data(label)',
                        'color': '#333', 
                        'border-color': '#888' 
                    }
                },
            ],
            layout: {
                name: 'dagre',
                rankDir: 'TB',
                spacingFactor: 1.2,
                animate: true,
                animationDuration: 500
            }
        });

        const tooltip = document.createElement('div');
        tooltip.style.position = 'absolute';
        tooltip.style.padding = '12px 16px';
        tooltip.style.backgroundColor = 'rgba(33, 37, 41, 0.95)';
        tooltip.style.color = '#fff';
        tooltip.style.borderRadius = '6px';
        tooltip.style.fontSize = '13px';
        tooltip.style.display = 'none';
        tooltip.style.pointerEvents = 'none';
        tooltip.style.zIndex = '1000';
        tooltip.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        tooltip.style.backdropFilter = 'blur(4px)';
        tooltip.style.border = '1px solid rgba(255, 255, 255, 0.1)';
        tooltip.style.maxWidth = '500px';
        tooltip.style.lineHeight = '1.5';
        document.body.appendChild(tooltip);

        cyRef.current.on('mouseover', 'node', (event) => {
            const node = event.target;
            console.log("当前节点的数据：", node.data())
            tooltip.innerHTML = `
                <div style="margin-bottom: 8px;">
                    <span style="font-weight: 600; font-size: 14px; color: #fff;">${node.data().label}</span>
                </div>
                <div style="display: grid; grid-template-columns: auto 1fr; gap: 4px;">
                    <span style="color: rgba(255,255,255,0.7);">ID:</span>
                    <span style="color: #fff;">${node.data().id}</span>
                    <span style="color: rgba(255,255,255,0.7);">fullCompanyName:</span>
                    <span style="color: #fff;">${node.data().fullCompanyName}</span>
                    <span style="color: rgba(255,255,255,0.7);">city:</span>
                    <span style="color: #fff;">${node.data().city}</span>
                    <span style="color: rgba(255,255,255,0.7);">province:</span>
                    <span style="color: #fff;">${node.data().province}</span>
                    <span style="color: rgba(255,255,255,0.7);">details:</span>
                    <span style="color: #fff;">${node.data().details}</span>
                    <span style="color: rgba(255,255,255,0.7);">tags:</span>
                    <span style="color: #fff;">${node.data().tags}</span>
                    <span style="color: rgba(255,255,255,0.7);">englishName:</span>
                    <span style="color: #fff;">${node.data().englishName}</span>
                </div>
            `;
            tooltip.style.display = 'block';
            setTimeout(() => {
                tooltip.style.display = 'none';
            }, 10000);
        });

        cyRef.current.on('mousemove', (event) => {
            const padding = 15;
            const tooltipWidth = tooltip.offsetWidth;
            const tooltipHeight = tooltip.offsetHeight;

            let left = event.renderedPosition.x + padding;
            let top = event.renderedPosition.y + padding;
            if (left + tooltipWidth > window.innerWidth) {
                left = event.renderedPosition.x - tooltipWidth - padding;
            }
            if (top + tooltipHeight > window.innerHeight) {
                top = event.renderedPosition.y - tooltipHeight - padding;
            }
            tooltip.style.left = `${left}px`;
            tooltip.style.top = `${top}px`;
        });

        cyRef.current.on('mouseout', 'node', () => {
            tooltip.style.display = 'none';
        });

        cyRef.current.on('tap', 'node', async function (evt) {
            const node = evt.target;
            const nodeId = node.id();
            const isExpanded = node.data('expanded');
            console.log("特殊节点",isExpanded);
            if(isExpanded=="specialExpanded"){
                console.log("特殊节点");
            }else{
                if (!isExpanded) {
                    const { nodes, edges } = await getChildNodes(nodeId);
                    cyRef.current.add([...nodes, ...edges]);
                    node.data('expanded', true);
                } else {
                    const descendants = node.successors();
                    cyRef.current.remove(descendants);
                    node.data('expanded', false);
                }
            }

            cyRef.current.layout({
                name: 'dagre',
                rankDir: 'TB',
                spacingFactor: 1.2,
                animate: true,
                animationDuration: 500
            }).run();
        });

        cyRef.current.cxtmenu({
            selector: 'node, edge',
            commands: [
                {
                    content: '添加节点',
                    select: function(ele){
                        console.log( ele.id() );
                        setSelectedNodeId(ele.id());
                        setModalOpen(true);
                    }
                },
        
                {
                    content: '更新节点',
                    select: function(ele){
                        console.log( ele.id() );
                        setSelectedNodeId(ele.id());
                        setUpdateOpen(true);
                    },
                },
        
                {
                    content: '添加到侧边栏',
                    select: function(ele){
                        console.log(  '添加到侧边栏',ele.data() );
                        insertNodeIndexDB(ele.data());
                    }
                }
            ]
        });
        
        return () => {
            if (cyRef.current) {
                cyRef.current.destroy();
            }
        };
    }, [db]);
    
    const readTableData = async (TableName,parentId) => {
        try {
            const db = await openDB(DB_NAME, DB_VERSION);
            const tx = db.transaction(TableName, 'readonly');
            const store = tx.objectStore(TableName);
            const items = await store.getAll();
            return items;
        } catch (error) {
            console.error(`读取${TableName}数据时出错:`, error);
            return [];
        }
    };
      
    // 读取所有IndexedDB数据
    const  PerInsertAllDBData = async () => {
        try {
            const db = await openDB(DB_NAME, DB_VERSION);
            const tableNames = Array.from(db.objectStoreNames); 
            let ProvienceIndex = 0
            for (const [index, tableName] of tableNames.entries()) {
                ProvienceIndex = ProvienceIndex + 1;
                let item_id ;
                if (ProvienceIndex <= 9) {
                    item_id = "10" + (ProvienceIndex).toString() + "000000" + "0000000000" + "0000000000"
                } else {
                    item_id = "1" + (ProvienceIndex).toString() + "000000" + "0000000000" + "0000000000"
                }
                options1.push({ value: item_id , label: tableName },);
            }
            setOptions1(options1);
        } catch (error) {
            console.error('读取数据时出错:', error);
        }
    };

    const Selected1Changed = async (selectedOption) => {
        setSelectedOption1(selectedOption); 
        console.log('当前选中的值:', selectedOption);
        let item_id = selectedOption.value
        let tableName = selectedOption.label
        const items = await readTableData(tableName, item_id);
        console.log(items)
        console.log(options2)
        let comps = [];
        for (let item of items) {
            comps.push(
                { value: item.id , 
                    label: item.companyName || (item.id).toString(),
                    fullCompanyName: item.fullCompanyName,
                    city: item.city,
                    province: item.province,
                    details: item.details,
                    stockCode: item.stockCode,
                    tags: item.tags,
                    englishName: item.englishName,
                    author: "N/A",
                    expanded: "specialExpanded",
                    hasChildren: true,
                    parentid: item_id,
                });
        };
        setOptions2(comps);

        let newDagpart = []
        newDagpart.push({
            data: {
                id: item_id,
                label: tableName || (item_id).toString(),
                author: "N/A",
                expanded: true,
                hasChildren: true,
            }
        });
        newDagpart.push({
            data: {
                id: `edge-${112345612345123451234512345}-${item_id}`,
                source:  '112345612345123451234512345',
                target: item_id
            }
        });
        cyRef.current.add(newDagpart);
        cyRef.current.layout({
            name: 'dagre',
            rankDir: 'TB',
            spacingFactor: 1.2,
            animate: true,
            animationDuration: 500
        }).run();
        console.log('Selected1Changed当前选中的值:', selectedOption);
    };
    const Selected2Changed = async (selectedOption) => {
        setSelectedOption2(selectedOption);
        console.log('Selected2Changed 当前选中的值:', selectedOption);
        let item_id = selectedOption.value
        let tableName = selectedOption.label        

        let newDagpart = []
        newDagpart.push({
            data: {
                id: item_id,
                label: tableName || (item_id).toString(),
                author: "N/A",

                fullCompanyName: selectedOption.fullCompanyName,
                city: selectedOption.city,
                province: selectedOption.province,
                details: selectedOption.details,
                stockCode: selectedOption.stockCode,
                tags: selectedOption.tags,
                englishName: selectedOption.englishName,
                author: "N/A",
                expanded: false,
                hasChildren: true,
            }
        });
        newDagpart.push({
            data: {
                id: `edge-${selectedOption.parentid}-${item_id}`,
                source:  selectedOption.parentid,
                target: item_id
            }
        });
        cyRef.current.add(newDagpart);
        cyRef.current.layout({
            name: 'dagre',
            rankDir: 'TB',
            spacingFactor: 1.2,
            animate: true,
            animationDuration: 500
        }).run();
        console.log('当前选中的值:', selectedOption);
    };

    // 获取子节点的函数
    const getChildNodes = async (parentId,) => {
        const existingNodes = cyRef.current.nodes().map(node => node.id());//已经存在的所有节点
        const nodes = [];
        const edges = [];
        // 子节点数据
        let childernodes;
        console.log("从DB获取" + parentId + "的子节点数据：===================================>", parentId + '/children')
        childernodes = await gunService.getChildernodeArray(parentId)// 'root/children'

        const count = childernodes.length
        for (let i = 0; i < count; i++) {
            const nodeId = childernodes[i].id;
            const nodeprop = childernodes[i].props;
            let jsonObject = {};
            try {
                jsonObject = JSON.parse(nodeprop);
            } catch (error) {
                console.error(nodeprop,"解析失败:", error.message);
            }


            if (!existingNodes.includes(nodeId)) {
                nodes.push({
                    data: {
                        id: nodeId,
                        label: jsonObject.label || (nodeId).toString(),
                        expanded: false,
                        hasChildren: true,
                        city: jsonObject.city,
                        details: jsonObject.details,
                        author: jsonObject.author
                    }
                });
                edges.push({
                    data: {
                        id: `edge-${parentId}-${nodeId}`,
                        source: parentId,
                        target: nodeId
                    }
                });
            }
        }
        return { nodes, edges };
    };

    // 侧边栏添加节点
    const handleAddNode = (newNodeLabel) => {
        const nodeId = selectedNodeId;
        const newNodeId = `${nodeId}-new-${Date.now()}`;
        let res = gunService.setChildernodeArray(nodeId, newNodeLabel);//将id和属性传递到gundb
        console.log("右键后当前添加的数据为：", newNodeLabel)
        const newNode = {
            data: {
                id: newNodeId,
                label: newNodeLabel.label,
                expanded: false,
                hasChildren: false
            }
        };

        const newEdge = {
            data: {
                id: `edge-${nodeId}-${newNodeId}`,
                source: nodeId,
                target: newNodeId
            }
        };

        cyRef.current.add([newNode, newEdge]);
        cyRef.current.$(`#${newNodeId}`).addClass('new-node');

        cyRef.current.layout({
            name: 'dagre',
            rankDir: 'TB',
            spacingFactor: 1.2,
            animate: true,
            animationDuration: 500
        }).run();

        setModalOpen(false);
    };

    const handleUpdateNode = (newNodeInfo) => {
        const nodeId = selectedNodeId;
        let res = gunService.setNodeArray(nodeId, newNodeInfo);//将id和属性传递到gundb
        console.log(nodeId,"右键后当前添加的数据为：", newNodeInfo)
        setUpdateOpen(false);
    };
    
    const OpenSidebar = async () => {
        if (!db) {
            console.error("ON OpenSidebar Database is not initialized yet.");
            return;
        }
        setIndexedDBDATA(await db.getAll("myIndexedDBDATA"));
        setSidebarOpen(true);
    };

    const deleteNodeIndexDB = async (newNodeLabel) => {
        if (!db) {
            console.error("ON deleteNodeIndexDB Database is not initialized yet.");
            return;
        }
        console.log(newNodeLabel);
        await db.delete("myIndexedDBDATA", newNodeLabel); // 从存储对象删除数据,删除 id 为newNodeLabel的数据
        setIndexedDBDATA(await db.getAll("myIndexedDBDATA"));
    };

    const insertNodeIndexDB = async (data) => {
        console.log(data);
        if (!db) {
            console.error("ON insertNodeIndexDB Database is not initialized yet.");
            return;
        }
        try { 
          // 添加数据到对象存储
          await db.put("myIndexedDBDATA", { id: data.id, city: data.city, label:data.label,abbreviation:data.abbreviation });
        } catch (error) {
          console.error("ON insertNodeIndexDB Error performing DB operations:", error);
        }
    };

    return (
        <div style={{ position: 'relative', width: '80%', height: '100vh' }}>
            {/* Searchable dropdowns and button */}
            <div style={{ 
                position: 'absolute', 
                top: '10px', 
                left: '10px', 
                zIndex: 10, 
                display: 'flex', 
                justifyContent: 'space-between', 
                width: 'calc(70% - 10px)' 
            }}>
                <Select
                    options={options1}
                    value={selectedOption1}
                    onChange={Selected1Changed}
                    placeholder="选择省份……"
                    isSearchable
                    style={{ width: '35%' }}
                />
                <Select
                    options={options2}
                    value={selectedOption2}
                    onChange={Selected2Changed}
                    placeholder="选择名称……"
                    isSearchable
                    style={{ width: '35%' }}
                />
            </div>

            <div
                ref={containerRef}
                style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#f8f8f8'
                }}
            />

            <AddNodeModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleAddNode}
                parentNodeId={selectedNodeId}
            />
            <UpdateNodeModal
                isOpen={updataOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleUpdateNode}
                parentNodeId={selectedNodeId}
            />

            <div class="btwrapper"  onClick={() => OpenSidebar(!sidebarOpen)}>
                <div class="svg-shape">
                    <div class="inner-svg">
                        {/* <svg width="30px" height="30px" viewBox="0 0 24.00 24.00" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#54a93d"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0.144"></g><g id="SVGRepo_iconCarrier"> <path d="M7.82054 20.7313C8.21107 21.1218 8.84423 21.1218 9.23476 20.7313L15.8792 14.0868C17.0505 12.9155 17.0508 11.0167 15.88 9.84497L9.3097 3.26958C8.91918 2.87905 8.28601 2.87905 7.89549 3.26958C7.50497 3.6601 7.50497 4.29327 7.89549 4.68379L14.4675 11.2558C14.8581 11.6464 14.8581 12.2795 14.4675 12.67L7.82054 19.317C7.43002 19.7076 7.43002 20.3407 7.82054 20.7313Z" fill="#257933"></path> </g></svg>   */}
                        <svg width="30px" height="30px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#000000" stroke-width="0.768"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M7.82054 20.7313C8.21107 21.1218 8.84423 21.1218 9.23476 20.7313L15.8792 14.0868C17.0505 12.9155 17.0508 11.0167 15.88 9.84497L9.3097 3.26958C8.91918 2.87905 8.28601 2.87905 7.89549 3.26958C7.50497 3.6601 7.50497 4.29327 7.89549 4.68379L14.4675 11.2558C14.8581 11.6464 14.8581 12.2795 14.4675 12.67L7.82054 19.317C7.43002 19.7076 7.43002 20.3407 7.82054 20.7313Z" fill="#ebf0ee"></path> </g></svg>
                        {/* <svg width="30px" height="30px" viewBox="-2.16 -2.16 28.32 28.32" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#000000" stroke-width="1.488"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M7.82054 20.7313C8.21107 21.1218 8.84423 21.1218 9.23476 20.7313L15.8792 14.0868C17.0505 12.9155 17.0508 11.0167 15.88 9.84497L9.3097 3.26958C8.91918 2.87905 8.28601 2.87905 7.89549 3.26958C7.50497 3.6601 7.50497 4.29327 7.89549 4.68379L14.4675 11.2558C14.8581 11.6464 14.8581 12.2795 14.4675 12.67L7.82054 19.317C7.43002 19.7076 7.43002 20.3407 7.82054 20.7313Z" fill="#000000"></path> </g></svg> */}
                    </div>
                </div>
                <div class="rectangle-below"></div>
            </div>
           
            <div
                style={{
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    height: '100%',
                    width: '300px',
                    backgroundColor: 'white',
                    boxShadow: '-2px 0 5px rgba(0,0,0,0.1)',
                    transform: `translateX(${sidebarOpen ? '0' : '100%'})`,
                    transition: 'transform 0.3s ease-in-out',
                    padding: '20px',
                    boxSizing: 'border-box'
                }}
            >

                <button
                    onClick={() => setSidebarOpen(false)}
                    style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        fontSize: '20px'
                    }}
                >
                    ×
                </button>

                <h2>节点列表：</h2>
                <div className='addedNodesList'>
                    <div className="space-y-2">
                        {IndexedDBDATA.map((IndexedDBNODE) => (
                        <div
                            key={IndexedDBNODE.id}
                            className={`p-2 rounded cursor-pointer flex justify-between items-center ${
                                currentNodeId === IndexedDBNODE.id ? 'bg-blue-100' : 'hover:bg-gray-100'
                            }`}
                            onClick={() => setcurrentNodeId(IndexedDBNODE.id)}
                        >
                            <div className="flex items-center space-x-2">
                            <span className="truncate">✓ {IndexedDBNODE.label}:{IndexedDBNODE.id}</span>
                            </div>
                            <FontAwesomeIcon 
                            icon={faTrash} 
                            className="text-red-500 hover:text-red-700"
                            onClick={(e) => {
                                e.stopPropagation();
                                deleteNodeIndexDB(IndexedDBNODE.id);
                            }}
                            />
                        </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default CytoscapeTree;
