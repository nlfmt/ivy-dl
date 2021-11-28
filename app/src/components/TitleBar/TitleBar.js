import React from 'react';

import { CloseRounded, Crop54Rounded, RemoveRounded } from '@material-ui/icons';

import "./titleBar.less";


const { window } = electron;

const TitleBar = (props) => {

    return (
        <nav className="titleBar">
            <div className="titleBarDragArea">
                Ivy Downloader v1.0 alpha
            </div>
            <ul id="windowControls">
                <li className="windowControlButton" onClick={window.minimize}>
                    <RemoveRounded />
                </li>
                <li className="windowControlButton" onClick={window.maximize}>
                    <Crop54Rounded />
                </li>
                <li className="windowControlButton" onClick={window.close}>
                    <CloseRounded />
                </li>
            </ul>
        </nav>
    )
}

export default TitleBar