import React from 'react'

import "./appPage.less";

const AppPage = (props) => {
    return (
        <div className={"appPage " + props.name}>
            {props.children}
        </div>
    )
}

export default AppPage
