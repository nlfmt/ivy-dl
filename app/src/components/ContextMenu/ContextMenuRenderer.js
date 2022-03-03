import React, {useState} from "react";

import { MenuContext } from "./";
import calculatePosStyle from "./util";

import "./style/menu.less";
import "./style/contextMenu.less"
import { useEffect } from "react";
import { useRef } from "react";

/**
 * Renders a given Context Menu.
 * @param {*} props.menu The Context Menu to render. 
 * @returns the rendered Context Menu.
 */
const ContextMenuRenderer = ({ visible, willEnter, willLeave, triggerEvent, domNodes, hideMenu, duration }) => {


    const postfix = willEnter ? " willEnter" : willLeave ? " willLeave" : "";

    const posStyle = triggerEvent ? {
        left: triggerEvent.clientX,
        top: triggerEvent.clientY,
    } : {};
    Object.assign(posStyle, {
        "--duration": duration + "ms",
    });

    const [style, setStyle] = useState(posStyle);

    const menuRef = useRef(null);

    useEffect(() => {
        if (menuRef.current) {
            const style = calculatePosStyle(menuRef.current, triggerEvent, 10);
            setStyle(s => ({...s, ...style}));
        }
    }, [visible, domNodes]);


    return visible && (
        <div ref={menuRef} className={"contextMenu" + postfix} style={style} >
            <MenuContext.Provider value={{visible, hideMenu, triggerEvent, willLeave, style}}>
                {domNodes}
            </MenuContext.Provider>
        </div>
    );
};

export { ContextMenuRenderer };
