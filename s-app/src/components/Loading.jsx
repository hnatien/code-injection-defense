import React from 'react';
import '../index.css';

function Loading() {
  return (
    <>
      <div className="security-banner">SECURE VERSION</div>
      <div className="container">
        <div className="empty-state">
          <p>Loading...</p>
        </div>
      </div>
    </>
  );
}

export default Loading;

