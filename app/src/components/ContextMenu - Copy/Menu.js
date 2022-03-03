import React from "react";

import MenuContext from "./MenuContext";

import "./style/Menu.less";


const Menu = ({children, id, data: { visible, willEnter, willLeave, triggerEvent, hideMenu }}) => {

    const postfix = willEnter ? " willEnter" : willLeave ? " willLeave" : "";

    const { x, y } = triggerEvent?.target.getClientRects()[0] || {};

    const posStyle = triggerEvent ? {
        left: triggerEvent.clientX - x,
        top: triggerEvent.clientY - y,
    } : {};

    console.log(id, { posStyle, visible, willEnter, willLeave, triggerEvent, hideMenu });

    return visible && (
        <div className={"contextMenu" + postfix} style={posStyle} >
            <MenuContext.Provider value={{hideMenu, triggerEvent, willLeave}}>
                {children}
            </MenuContext.Provider>
        </div>
    );
};

export default Menu;
