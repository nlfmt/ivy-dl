import React, { useState } from 'react'

import "./toggleButton.less";

const ToggleButton = (props) => {

    const [active, setActive] = useState(!!props.default);

    return (
        <div
            className={ active ? "toggleButton active" : "toggleButton"}
            onClick={() => {
                setActive(!active);
                props.onChange && props.onChange(active);
            }}
        >
            {props.children}
        </div>
    )
}

export default ToggleButton
