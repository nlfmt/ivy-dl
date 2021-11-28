import React from 'react'

const CircularProgressBar = (props) => {

    const { strokeWidth=2, bg="#000", fg="#fff" } = props;
    const r = 10;
    const s = 20;

    const max = 62.8;

    const width = s + strokeWidth;


    return (
            <svg className="svgProgressLine" viewBox={`0 0 ${width} ${width}`}>
            <circle cx={r + strokeWidth/2} cy={r + strokeWidth/2} r={10} fill="none" strokeWidth={strokeWidth} stroke={bg}/>
            <path fill="none" strokeLinecap="round" strokeWidth={strokeWidth} stroke={fg}
                    strokeDasharray={Math.round(props.value * (max/100.0)) + ",62.8"}
                    d={`M ${r + strokeWidth/2} ${strokeWidth/2}
                    a ${r} ${r} 0 0 1 0 ${s}
                    a ${r} ${r} 0 0 1 0 -${s}`}/>
            </svg>
    )
}

export default CircularProgressBar
