import React, { Suspense, lazy } from 'react';
import { Link, Routes, Route } from 'react-router-dom';
// import Home from './pages/Home';
// import About from './pages/About';
import { Button } from 'antd';
import { ConfigProvider } from 'antd';

const Home = lazy(() => import(/* webpackChunkName: 'Home'*/ './pages/Home'));
const About = lazy(() => import(/* webpackChunkName: 'About'*/'./pages/About'));


function App() {
  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#00b96b' } }}>
      <div>
        <h1>Hello React Cli</h1>
        <Button type="primary">Button</Button>
        <ul>
          <li><Link to="/home">Home</Link></li>
          <li><Link to="/about">About</Link></li>
        </ul>
        <Suspense fallback={<div>loading</div>}>
          <Routes>
            <Route path="/home" element={<Home />}></Route>
            <Route path="/about" element={<About />}></Route>
          </Routes>
        </Suspense>
      </div>
    </ConfigProvider>
    
  )
}

export default App