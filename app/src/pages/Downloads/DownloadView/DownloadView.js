import React from 'react'
import { useEffect } from 'react';

import "./downloadView.less"

import {
    ThumbDownRounded,
    ThumbUpRounded,
    VisibilityRounded,
    CloudQueueRounded,
    AspectRatioRounded,
    QueryBuilderRounded,
    PersonRounded,
    CloseRounded
} from "@material-ui/icons";

import Link from '../../../components/Link/Link';



const DownloadView =({ dl, close, hidden }) => {
    
    const videoRef = React.useRef();
    
    function skipToTime(time) {
        const seconds = parseInt(time.split(":")[0]) * 60 + parseInt(time.split(":")[1]);
        videoRef.current.currentTime = Math.round(seconds);
    }
    
    useEffect(() => {
        const cb = e => {
            if (e.code == "Escape") close();

            const vid = videoRef.current;
            if (!vid) return;
            if (vid?.readyState !== vid.HAVE_ENOUGH_DATA) return;
            
            let valid = true;
            switch(e.code) {

                // Video Controls
                case "ArrowLeft":
                    vid.currentTime -= 10;
                    break;
                case "ArrowRight":
                    vid.currentTime += 10;
                    break;
                case "ArrowUp":
                    if (vid.volume <= 0.9) vid.volume += 0.1
                    else vid.volume = 1;
                    break;
                case "ArrowDown":
                    if (vid.volume >= 0.1) vid.volume -= 0.1;
                    else vid.volume = 0;
                    break;
                case "Space":
                case "Enter":
                    if (window.innerHeight > screen.availHeight - 30) return;
                    vid.paused ? vid.play() : vid.pause();
                    break;
                    
                case "KeyM":
                    vid.muted = !vid.muted;
                    break;
                default:
                    valid = false;
            }
            if (valid) e.preventDefault();
        }
        document.addEventListener("keydown", cb);
        return () => document.removeEventListener("keypress", cb);
    }, [hidden]);

    
    const myHandlers = [
        [ // Replace newlines with <br/>
            /(\n+)/g,
            (str, i) => {
                return str.split("").map((_, j)=><br key={i + "-" + j} />);
            }
        ],
        [ // Replace URLS with Link elements
            /(https?:\/\/[^\s]+)/g,
            (str, i) => <Link key={i} href={str}>{str.split("//").slice(1).join("//")}</Link>
        ],
        [ // Replace timecodes with clickable elements
            /(\d{1,2}:\d{2})/g,
            (str, i) => <a key={i} href="#" onClick={() => skipToTime(str)}>{str}</a>
        ],
    ]

    
    return hidden ? (
        <div className="downloadView hidden"></div>
    ) : (
        <div className="downloadView">
            <div className="closeBtn" onClick={close}><CloseRounded /></div>
            <div className="videoContainer">
                <video ref={videoRef} src={dl.filename} controls></video>
                <div className="info">
                    <NumStat v={dl.views}><VisibilityRounded /></NumStat>
                    <NumStat v={dl.likes}><ThumbUpRounded /></NumStat>
                    <NumStat v={dl.dislikes}><ThumbDownRounded /></NumStat>
                    <StrStat v={parseDuration(dl.duration)}><QueryBuilderRounded /></StrStat>
                    <StrStat v={dl.resolution}><AspectRatioRounded /></StrStat>
                    <StrStat v={dl.uploader} link={dl.uploaderUrl}><PersonRounded /></StrStat>
                    <StrStat v={dl.website} link={dl.url}><CloudQueueRounded /></StrStat>
                </div>
            </div>
            <span className="title">{dl.title}</span>
            <div className="description">
                {regexMap(dl.description, myHandlers, (str, i) => <span key={i}>{str}</span>)}
            </div>
        </div>
    );
}

/**
 * Split up a string with a regex but keep the 1st capturing group of the regex in the resulting array.
 * @param {*} str The string to split
 * @param {*} regex The regex to split with
 * @returns the split array.
 */
function splitAround(str, regex) {
    const id = "[" + Math.random().toString() + "]";
    return str.replace(regex, id + "$1" + id).split(id);
}

/**
 * Split a string up with many regexes and map every match with a corresponding function.
 * @param {*} str The string to apply the regexes to
 * @param {*} handlers An array of arrays of regexes and corresponding functions.
 * @param {*} defaultHandler The handler that gets called if no regex matches.
 * @returns a mapped array of the results of the functions.
 */
function regexMap(str, handlers, defaultHandler=(str, _)=>str) {
    // this array contains parts of the string with the index of the regex that matches it.
    let matchArray = [[-1, str]];
    handlers.forEach(([regex, _], handlerIndex) => {
        let nMatchArray = [];
        matchArray.forEach(([hIndex, part], i) => {
            if (hIndex !== -1) return nMatchArray.push([hIndex, part]);
            const partSplit = splitAround(part, regex).map((part, k) => [k % 2 == 1 ? handlerIndex : -1, part])
            nMatchArray = nMatchArray.concat(partSplit.filter(p => p[1] !== ""));
        });
        matchArray = nMatchArray;
    });
    
    return matchArray.map(([hIndex, str], i) => {
        return hIndex === -1
            ? defaultHandler(str, i)
            : handlers[hIndex][1](str, i)
    });
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

function abbrNum(d) {
    const digits = String(d).length;
    if (digits < 4) return String(d);
    let category = Math.min(Math.floor((digits-1) / 3), 3);

    return (digits < (category+1)*3
            ? Math.floor(d / Math.pow(10, category * 3 - 1)) / 10
            : Math.floor(d / Math.pow(10, category * 3))
        ) + ["K", "M", "B"][category-1];
}

export default DownloadView