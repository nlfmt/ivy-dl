import React, { useState, useEffect, useContext } from 'react'

import { Menu, Item, Separator, Submenu, ContextMenuContext } from "../../../components/ContextMenu";

import Link from '../../../components/Link/Link';

import {
    ThumbDownRounded,
    ThumbUpRounded,
    VisibilityRounded,
    CloudQueueRounded,
    AspectRatioRounded,
    QueryBuilderRounded,
    PersonRounded,

    InfoOutlined,
    DescriptionOutlined,
    LaunchOutlined,
    LanguageOutlined,
    FileCopyOutlined,
    AutorenewOutlined,
    HighlightOffOutlined,
    PersonOutlineRounded,
} from "@material-ui/icons";

import "./download.less"

const { dlMgr, shell } = electron;

// TODO:
// thumbnail links, klick darauf führt zu einer infopage mit videowiedergabe, daten
// thumbnail hover erstellt popup mit gemutetem autoplay
// Rechts mittig titel, darüber status, länge, datum, andere stats
// darunter progress bar mit prozentzahl, andere stats
// ganz rechts menu mit dropdown
// context menu actions
const Download = React.forwardRef(({dl, key, viewDlView}, ref) => {

    const { url } = dl;

    const [status, setStatus] = useState(dl.status || "downloading");
    const [progress, setProgress] = useState({
        perc: 0,
        speed: 0,
        eta: 0,
        done: 0,
        total: 0,

        eta_str: "0s",
        perc_str: "0%",
        speed_str: "64KB/s"
    });
    const [imgLoad, setImgLoad] = useState(true);
    // const [info, setInfo] = useState({});

    useEffect(() => {
        const stCb = (status) => {
            setStatus(status);
        };
        const prCb = (progress) => {
            setStatus("downloading");
            setProgress(progress);
        };
        dlMgr.onStatusChange(url, stCb);
        dlMgr.onProgress(url, prCb);

        return () => {
            dlMgr.offStatusChange(url, stCb);
            dlMgr.offProgress(url, prCb);
        };
    }, []);

    // Context Menu
    const { showContextMenu } = useContext(ContextMenuContext);

    const contextMenu = (
        <Menu>
            <Item onClick={() => viewDlView()} icon={<InfoOutlined />}>Details</Item>
            <Item onClick={() => shell.showFile(dl.filename)} icon={<DescriptionOutlined />}>Show File</Item>
            <Separator />
            <Item onClick={() => shell.openPath(dl.filename)} icon={<LaunchOutlined />}>Open</Item>
            <Item onClick={() => shell.openExternal(url)} icon={<LanguageOutlined />}>Open Link</Item>
            <Item onClick={() => navigator.clipboard.writeText(url)} icon={<FileCopyOutlined />}>Copy Link</Item>
            <Separator />
            <Submenu label="Convert" icon={<AutorenewOutlined />}>
                <Item>To MP4</Item>
                <Item>To MP3</Item>
                <Item>To FLV</Item>
                <Item>To WEBM</Item>
            </Submenu>
            <Separator />
            <Submenu label="Delete" icon={<HighlightOffOutlined />}>
                <Item>Keep File</Item>
                <Item>Delete File</Item>
            </Submenu>
            {/* <Submenu label="Submenu" icon={<PersonOutlineRounded />}>
                <Item>Item</Item>
                <Submenu label="Submenu 2">
                    <Item>Item</Item>
                    <Submenu label="Submenu 2">
                        <Item>Item</Item>
                        <Submenu label="Submenu 2">
                            <Item>Item</Item>
                        </Submenu>
                    </Submenu>
                </Submenu>
            </Submenu> */}
        </Menu>
    )


    return (
        <div
            className="downloadContainer"
            key={key}
            ref={ref}
            onClick={(e) => {
                if (!["A", "SVG"].includes(e.target.tagName) && !e.isDefaultPrevented()) viewDlView();
            }}
            onContextMenu={e => showContextMenu(e, contextMenu)}
        >
            {/* Shows reload button when unable to load image */}
            {imgLoad ? (
                <div
                    className="thumbnail"
                    style={{
                        backgroundImage:
                            "url(" + dl?.thumbnail ||
                            "https://via.placeholder.com/150" + ")"
                    }}
                    onError={() => setImgLoad(false)}
                />
            ) : (
                <div className="thumbnail" onClick={() => setImgLoad(true)}>
                    Reload
                </div>
            )}

            {/* Dynamically shows available info */}
            <div className="info">
                <div className="topInfo">
                    <NumStat v={dl.views}>
                        <VisibilityRounded />
                    </NumStat>
                    <NumStat v={dl.likes}>
                        <ThumbUpRounded />
                    </NumStat>
                    <NumStat v={dl.dislikes}>
                        <ThumbDownRounded />
                    </NumStat>
                    <StrStat v={parseDuration(dl.duration)}>
                        <QueryBuilderRounded />
                    </StrStat>
                    <StrStat v={dl.resolution}>
                        <AspectRatioRounded />
                    </StrStat>
                    <StrStat v={dl.uploader} link={dl.uploaderUrl}>
                        <PersonRounded />
                    </StrStat>
                    <StrStat v={dl.website} link={url}>
                        <CloudQueueRounded />
                    </StrStat>
                </div>
                <div className="title">
                    {dl?.title ? dl?.title : "Initializing..."}
                </div>
                {status == "downloading" ? (
                    <ProgressBar progress={progress} />
                ) : (
                    <div className="stat">
                        {dl.date
                            ? new Date(dl.date)
                                  .toISOString()
                                  .split("T")[0]
                                  .split("-")
                                  .reverse()
                                  .join(".")
                            : null}
                    </div>
                )}
            </div>
        </div>
    );
});


const ProgressBar = ({progress}) => {
    const indeterminate = progress.total == 0;
    const percent = String(Math.round((progress.done / progress.total) * 100));

    return (
        <div className="progressBar">
            {indeterminate ? <progress /> :
                <>
                    <span className="percentView">{percent}%</span>
                    <progress value={percent} max="100" />
                    <span className="progressEta">{parseDuration(progress.eta)}</span>
                </>
            }
        </div>
    )
}

const NumStat = (props) => {
    return isNaN(props.v) ? null : (
        <div className="stat">
            {props.children}
            {abbrNum(props.v)}
        </div>
    );
}
const StrStat = (props) => {
    return !props.v || props.v.trim() == "" ? null : (
        !props.link ? <div className="stat">
            {props.children}
            {String(props.v).trim()}
        </div> :
        <Link className="stat" href={props.link}>
            {props.children}
            {String(props.v).trim()}
        </Link>
    );
}

function parseDuration(d, precise) {
    if (d===0 || isNaN(d)) return "0s";
    
    const hours = Math.floor(d / 3600);
    const mins = Math.floor((d % 3600) / 60);
    const secs = d % 60;

    let strArr = []
    if (hours !== 0) strArr.push(hours + "h");
    if (mins !== 0) strArr.push(mins + "m");
    if (precise || (secs !== 0 && hours == 0)) strArr.push(secs + "s");
    
    return strArr.join(" ");
}
// function duration(s) {
//     s = Math.round(s);
//     let h = Math.floor(s / 3600);
//     s -= h * 3600;
//     let m = Math.floor(s / 60);
//     s -= m * 60;
//     return (h > 0 ? `${h}h ` : "")
//          + (m > 0 ? `${m}m ` : "")
//          + `${s}s`;
// }

function abbrNum(d) {
    const digits = String(d).length;
    if (digits < 4) return String(d);
    let category = Math.min(Math.floor((digits-1) / 3), 3);

    return (digits < (category+1)*3
            ? Math.floor(d / Math.pow(10, category * 3 - 1)) / 10
            : Math.floor(d / Math.pow(10, category * 3))
        ) + ["K", "M", "B"][category-1];
}


export default Download
