import React from 'react';
import ReactDom from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './styles/home.less';
import App from './App.jsx';
const root = ReactDom.createRoot(document.getElementById('app'));
root.render(<BrowserRouter><App /></BrowserRouter>);