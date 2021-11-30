import React, { useState, useRef, useEffect } from 'react'
import "./sideBar.less";

import TooltipButton from './TooltipButton';

import { SyncRounded, GetAppRounded, SettingsRounded, PlayCircleFilledRounded } from '@material-ui/icons';
import CircularProgressBar from '../CircularProgressBar/CircularProgressBar';
const { window } = electron;


const SideBar = () => {

    const [isExpanded, setIsExpanded] = useState(false);
    const [progress, setProgress] = useState(0);


    const toggleSidebar = (e) => {
        const cl = e.target.classList;
        if (!cl.contains('sideBar') && !cl.contains("expandArea")) return;
        setIsExpanded(!isExpanded);
    }

    useEffect(() => {
        setInterval(() => {
            setProgress(Math.random() * 100);
        }, 200);

        return () => {
            clearInterval();
        }
    }, []);
    return (
        <aside
            className={isExpanded ? "sideBar expanded" : "sideBar"}
            onClick={toggleSidebar}
        >
            <div className="logo">
                <PlayCircleFilledRounded />
                <span>made by Tom F.</span>
            </div>

            <div className="lineSpacer"></div>

            <div className="sideBarPages">
                <TooltipButton
                    id="downloadsBtn"
                    name="Downloads"
                    expanded={isExpanded}
                >
                    <GetAppRounded />
                </TooltipButton>

                <TooltipButton
                    id="conversionsBtn"
                    name="Conversions"
                    expanded={isExpanded}
                >
                    <SyncRounded />
                </TooltipButton>

                <TooltipButton
                    id="settingsBtn"
                    name="Settings"
                    expanded={isExpanded}
                >
                    <SettingsRounded />
                </TooltipButton>
            </div>

            <div
                className="expandArea"
                onClick={() => setIsExpanded((s) => !s)}
            ></div>

            <TooltipButton
                id="progressBtn"
                name="400MB / 1,3GB"
                expanded={isExpanded}
            >
                <CircularProgressBar
                    value={progress}
                    size={100}
                    strokeWidth={15}
                />
            </TooltipButton>
        </aside>
    );
}

export default SideBar