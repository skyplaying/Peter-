import React from 'react';
import ReactDOM from 'react-dom';
import ManusViewer from './components/ManusViewer';
import mockData from './mock.json';
import './styles.css';

ReactDOM.render(
  <React.StrictMode>
    <ManusViewer data={mockData} />
  </React.StrictMode>,
  document.getElementById('root')
); 