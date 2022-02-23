import React, { useState, useRef, useEffect } from 'react'
import "./sideBar.less";

import TooltipButton from './TooltipButton';
import CircularProgressBar from '../CircularProgressBar/CircularProgressBar';

import {
    SyncRounded,
    GetAppRounded,
    SettingsRounded,
    PlayCircleFilledRounded,
    HomeRounded
} from "@material-ui/icons";

const { dlMgr } = electron;


const SideBar = () => {

    const [isExpanded, setIsExpanded] = useState(false);
    const [progress, setProgress] = useState({
        done: 0,
        total: 0,
        perc: 0
    });
    // custom appState hooks for ETA, total progress, remaining bytes
    // const appState = useAppState();


    const toggleSidebar = (e) => {
        const cl = e.target.classList;
        if (!cl.contains('sideBar') && !cl.contains("expandArea")) return;
        setIsExpanded(!isExpanded);
    }

    useEffect(() => {
        const cb = (p) => setProgress(p);
        dlMgr.onTotalProgress(cb);

        return () => {
            dlMgr.offTotalProgress(cb);
        }
    }, []);

    console.log(progress);

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

                <div className="lineSpacer"></div>
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

            {/* TODO: Dynamically change icon to home icon if there are no downloads */}
            <TooltipButton
                id="progressBtn"
                name={progress.total > 0 ? "Downloading" : "Home"}
                expanded={isExpanded}
            >
            {progress.total == 0 ? (
                <HomeRounded />
            ) : (
                <CircularProgressBar
                    value={progress.perc}
                    size={100}
                    strokeWidth={15}
                />
            )}
            </TooltipButton>
        </aside>
    );
}

export default SideBar