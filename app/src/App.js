import React, { useEffect } from 'react'

import Home from './pages/Home/Home';
import Downloads from './pages/Downloads/Downloads';
import Conversions from './pages/Conversions/Conversions';

import TitleBar from './components/TitleBar/TitleBar';
import SideBar from './components/SideBar/SideBar';

import { ContextMenuRenderer, useContextMenu, ContextMenuContext } from './components/ContextMenu';

import "./app.less";



const App = () => {

    const [showContextMenu, menuData] = useContextMenu({ duration: 200 });

    return (
        <>
            <ContextMenuContext.Provider value={{ showContextMenu }}>

                <SideBar />
                <section className="appContent">
                    <TitleBar />
                    <Downloads />
                </section>

                <ContextMenuRenderer {...menuData} />

            </ContextMenuContext.Provider>

        </>
    )
}

export default App