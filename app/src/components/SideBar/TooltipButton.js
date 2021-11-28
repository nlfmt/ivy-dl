import React from 'react'
import "./tooltipButton.less";

const TooltipButton = ({id, name, children, expanded}) => {

    return (
        <div className={ expanded ? "tooltipBtn expanded" : "tooltipBtn"} id={id}>
            {children}
            <div className="tooltip">{name}</div>
        </div>
    )
}

export default TooltipButton