import React, { useState, useEffect } from 'react'

import "./download.less"


const { dlMgr } = electron;

// TODO:
// thumbnail links, klick darauf führt zu einer infopage mit videowiedergabe, daten
// thumbnail hover erstellt popup mit gemutetem autoplay
// Rechts mittig titel, darüber status, länge, datum, andere stats
// darunter progress bar mit prozentzahl, andere stats
// ganz rechts menu mit dropdown
// context menu actions
const Download = ({url, info}) => {

    const [status, setStatus] = useState("downloading");
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

    useEffect(() => {
        const stCb = (status) => {
            setStatus(status);
        };
        const prCb = (progress) => {
            setProgress(progress);
        };
        dlMgr.onStatusChange(url, stCb);
        dlMgr.onProgress(url, prCb);

        return () => {
            dlMgr.offStatusChange(url, callback);
            dlMgr.offProgress(url, callback);
        };
    }, []);


    return (
        <>
            <div className="downloadContainer">

                {/* Shows reload button when unable to load image */}
                {imgLoad ? (
                    <img
                        className="thumbnail"
                        src={info.thumbnail}
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
                        {!isNaN(info.dislikes) && <h3>{info.dislikes}</h3>}
                        {!isNaN(info.likes) && <h3>{info.likes}</h3>}
                        {!isNaN(info.views) && <h3>{info.views}</h3>}
                    </div>
                    <div className="title">
                        {info.title ? info.title : "Initializing..."}
                    </div>
                    {status == "downloading" &&
                        <ProgressBar progress={progress} />
                    }
                </div>
            </div>
        </>
    );
}


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

export default Download
