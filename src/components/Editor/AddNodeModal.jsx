import React, { useState } from 'react';
import './AddNodeModal.css';

const AddNodeModal = ({ isOpen, onClose, onSubmit, parentNodeId }) => {
    const [label, setLabel] = useState('');
    const [abbreviation, setAbbreviation] = useState('');
    const [city, setCity] = useState('');
    const [details, setDetails] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (label.trim()) {
            onSubmit({
                label: label.trim(),
                city: city.trim(),
                details: details.trim(),
                abbreviation:abbreviation.trim()
            });
            setLabel('');
            setCity('');
            setDetails('');
            setAbbreviation('');
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>添加新节点</h3>
                <p className="modal-subtitle">为节点 {parentNodeId} 添加子节点</p>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <input
                            type="text"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            placeholder="请输入节点标签"
                            autoFocus
                        />
                    </div>

                    <div className="input-group">
                        <input
                            type="text"
                            value={abbreviation}
                            onChange={(e) => setAbbreviation(e.target.value)}
                            placeholder="请输入节点简称"
                            autoFocus
                        />
                    </div>

                    <div className="input-group">
                        <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="请输入城市名称"
                        />
                    </div>

                    <div className="input-group">
                        <textarea
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            placeholder="请输入详细信息"
                            rows="3"
                        />
                    </div>

                    <div className="modal-buttons">
                        <button type="button" onClick={onClose} className="cancel-button">
                            取消
                        </button>
                        <button type="submit" className="submit-button">
                            确定
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddNodeModal; 