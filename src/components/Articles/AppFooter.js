import React from 'react';

const HappyFooter = () => {
  return (
    <footer style={{
      padding: '10px 0 0 0',
      textAlign: 'center',
      width: '100vw',
      marginTop: '20px',
      height: 'auto', 
      display: 'flex',
      flexDirection: 'column', 
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      left: '50%',
      transform: 'translateX(-50%)',
      maxWidth: '100vw',
    }}>
    
      <div style={{
        fontSize: '12px',
        color: 'rgba(0, 0, 0, 0.4)',
        marginBottom: '10px'
      }}>
        {/* <span>© 2024 CIFNEW Website. All rights reserved.</span> */}
         <span>CIFNEW</span>
        <span style={{ margin: '0 10px' }}>|</span>
        <span>Discovering Happiness Through Browsing ！</span>
        {/* <span style={{ margin: '0 10px' }}>|</span>
        <span>Last updated: {new Date().toLocaleDateString()}</span> */}
      </div>
    </footer>
  );
};

export default HappyFooter;


