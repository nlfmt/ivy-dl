import React from 'react'

import Home from './pages/Home/Home';
import Downloads from './pages/Downloads/Downloads';
import Conversions from './pages/Conversions/Conversions';

import TitleBar from './components/TitleBar/TitleBar';
import SideBar from './components/SideBar/SideBar';

import "./app.less";

const App = () => {
    return (
        <>
            <SideBar />
            <section className="appContent">
                <TitleBar />
                <Home />
            </section>
        </>
    )
}

export default App