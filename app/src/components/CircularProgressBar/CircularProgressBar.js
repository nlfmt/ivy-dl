import React from 'react'

import "./circularProgressBar.less"


const CircularProgressBar = (props) => {

    const { strokeWidth=2, size: s=80 } = props;
    const r = s / 2 - strokeWidth;

    const max = Math.round(20 * Math.PI * r) / 10;


    return (
        <svg className="circularProgressBar" viewBox={`0 0 100 100`}>
            <circle
                className="progressLineBg"
                cx={50}
                cy={50}
                r={r}
                fill="none"
                strokeWidth={strokeWidth}
            />
            {props.value != 0 && (
                <path
                    className="progressLineFg"
                    fill="none"
                    strokeLinecap="round"
                    strokeWidth={strokeWidth}
                    strokeDasharray={
                        Math.round(props.value * (max / 100.0)) + "," + max
                    }
                    d={`M ${50} ${50 - r}
                    a ${r} ${r} 0 0 1 0 ${2 * r}
                    a ${r} ${r} 0 0 1 0 -${2 * r}`}
                />
            )}
        </svg>
    );
}

export default CircularProgressBar
