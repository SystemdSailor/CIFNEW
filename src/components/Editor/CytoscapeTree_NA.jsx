import React, { useEffect, useRef, useState } from 'react';
import './CytoscapeTree.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import cxtmenu from "cytoscape-cxtmenu";
import gunService from '../../services/gunDB';
import { useIndexedDB } from "../../services/useIndexedDB";
import Select from 'react-select'; 

cytoscape.use(dagre);
cytoscape.use(cxtmenu);


const STYLES = {
  container: {
    position: 'relative',
    width: '100%', 
    height: '100vh',
    backgroundColor: '#f8f8f8'
  },
  controlsContainer: {
    position: 'absolute',
    top: '20px',
    left: '20px',
    right: '20px',
    zIndex: 10,
    display: 'flex',
    gap: '15px',
    padding: '15px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
  },
  select: {
    flex: 1,
    minWidth: '200px'
  },
  cytoscapeContainer: {
    width: '100%',
    height: '100%'
  },
  alertBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: '8px 16px',
    backgroundColor: '#e1f5fe',
    color: '#0277bd',
    borderBottom: '1px solid #b3e5fc',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1000
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: '#0277bd',
    cursor: 'pointer',
    padding: '4px',
    fontSize: '16px'
  }
};

const CytoscapeTree = () => {
    let db = useIndexedDB();
    var [IndexedDBDATA, setIndexedDBDATA] = useState([]);
    const cyRef = useRef(null);
    const containerRef = useRef(null);
    const [selectedNodeId, setSelectedNodeId] = useState(null);
    const [selectedOption1, setSelectedOption1] = useState(null); 
    const [selectedOption2, setSelectedOption2] = useState(null); 
    const [options1, setOptions1] = useState([]);
    const [options2, setOptions2] = useState([]);
    const [showAlert, setShowAlert] = useState(true);

    useEffect(() => {// 读取Company数据
        PerInsertAllDBData();
    }, []);

    useEffect(() => {// 读取IndexedDB数据
        if (!db) return; 
        const performDBOperations = async () => {
          try {
            setIndexedDBDATA(await db.getAll("myIndexedDBDATA"));
            console.log("获取所收藏节点数据 setIndexedDBDATA:", await db.getAll("myIndexedDBDATA"));
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
                    content: '未登录',
                    select: function(ele){
                    }
                },
        
                {
                    content: '未登录',
                    select: function(ele){
                        console.log( ele.id() );
                    },
                },
        
                {
                    content: '未登录',
                    select: function(ele){
                        console.log(  '添加到侧边栏',ele.data() );
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
            const items = window.jsonData[TableName];
            return items;
        } catch (error) {
            console.error(`读取${TableName}数据时出错:`, error);
            return [];
        }
    };
      
    const  PerInsertAllDBData = async () => {
        try {
            const tableNames = Object.entries(window.jsonData).map(([key, value]) => key);// Array.from(db.objectStoreNames); 
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

    const handleButtonClick = () => {// 暂时没用到
        console.log('Selected Option 1:', selectedOption1);
        console.log('Selected Option 2:', selectedOption2);
    };

    const Selected1Changed = async (selectedOption) => {
        setSelectedOption1(selectedOption); 
        let item_id = selectedOption.value
        let tableName = selectedOption.label
        const items = await readTableData(tableName, item_id);
        console.log("readTableData",items)
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
                    expanded: false,
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

                fullCompanyName: selectedOption.fullCompanyName,
                city: selectedOption.city,
                province: selectedOption.province,
                details: selectedOption.details,
                stockCode: selectedOption.stockCode,
                tags: selectedOption.tags,
                englishName: selectedOption.englishName,
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
            animate: "specialExpanded",
            animationDuration: 500
        }).run();
        console.log('当前选中的值:', selectedOption);
    };
    const Selected2Changed = async (selectedOption) => {
        setSelectedOption2(selectedOption); 
        console.log('当前选中的值:', selectedOption);
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
        childernodes = await gunService.getChildernodeArray(parentId)

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
        <div style={STYLES.container}>
            {showAlert && (
                <div style={STYLES.alertBanner}>
                    <span>此项目已添加部分上市公司信息，请在下拉栏选择。</span>
                    <button 
                        onClick={() => setShowAlert(false)}
                        style={STYLES.closeButton}
                        aria-label="关闭提示"
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>
            )}
            
            <div style={{
                ...STYLES.controlsContainer,
                top: showAlert ? '45px' : '20px',
                transition: 'top 0.3s ease'
            }}>
                <Select
                    options={options1}
                    value={selectedOption1}
                    onChange={Selected1Changed}
                    placeholder="选择省份..."
                    isSearchable
                    styles={{
                        control: (base) => ({
                            ...base,
                            minHeight: '40px',
                            borderRadius: '6px'
                        }),
                        menu: (base) => ({
                            ...base,
                            zIndex: 100
                        })
                    }}
                    style={STYLES.select}
                />
                <Select
                    options={options2}
                    value={selectedOption2}
                    onChange={Selected2Changed}
                    placeholder="选择名称..."
                    isSearchable
                    styles={{
                        control: (base) => ({
                            ...base,
                            minHeight: '40px',
                            borderRadius: '6px'
                        }),
                        menu: (base) => ({
                            ...base,
                            zIndex: 100
                        })
                    }}
                    style={STYLES.select}
                />
            </div>

            <div
                ref={containerRef}
                style={STYLES.cytoscapeContainer}
            />
        </div>
    );
};

export default CytoscapeTree;
