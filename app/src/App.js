import React, { useEffect } from 'react'

import Home from './pages/Home/Home';
import Downloads from './pages/Downloads/Downloads';
import Conversions from './pages/Conversions/Conversions';

import TitleBar from './components/TitleBar/TitleBar';
import SideBar from './components/SideBar/SideBar';

import "./app.less";

const { shell } = electron;

const App = () => {

    useEffect(() => {
        const callback = event => {
            if (event.target.tagName.toLowerCase() === 'a') {
              event.preventDefault();
              shell.openExternal(event.target.href);
            }
        }
        document.body.addEventListener('click', callback);

        return () => document.body.removeEventListener('click', callback);
    })

    return (
        <>
            <SideBar />
            <section className="appContent">
                <TitleBar />
                <Downloads />
            </section>
        </>
    )
}

export default App