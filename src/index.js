// src/index.js
import React from 'react';
import ReactDOM from 'react-dom';
import MainApp from './App'; // Update import

ReactDOM.render(
  <React.StrictMode>
    <MainApp />
  </React.StrictMode>,
  document.getElementById('root')
);