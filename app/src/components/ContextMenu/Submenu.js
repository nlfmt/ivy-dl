import React, { useEffect, useState, useRef, useContext } from "react";

import { MenuContext } from "./";

import { ChevronRightRounded } from "@material-ui/icons";



const Submenu = ({ label, icon, children }) => {

    const menuRef = useRef(null);
    const itemRef = useRef(null);
    const [style, setStyle] = useState({});

    const { triggerEvent, style: parentStyle } = useContext(MenuContext);

    useEffect(() => {
        if (menuRef.current && itemRef.current) {
            const item = itemRef.current, menu = menuRef.current;

            const itemX = item.getClientRects()[0].x,
                itemWidth = item.offsetWidth,
                menuWidth = menu.offsetWidth;

                console.log({itemX, itemWidth, menuWidth});

            if (itemX + item.offsetWidth + menu.offsetWidth > window.innerWidth - 20)
                setStyle(s => ({right: "100%", left: "auto"}));
            else
                setStyle(s => ({right: "auto", left: "100%"}));
        }
    }, [itemRef.current, menuRef.current, triggerEvent, parentStyle]);

    return (
        <>
            <div ref={itemRef} className="contextMenu-item">

                {icon}
                {label}
                <ChevronRightRounded className="contextMenu-arrow" />

                <div ref={menuRef} style={style} className="contextMenu contextMenu-submenu">
                    {children}
                </div>
            </div>
            
        </>
    );
};

export { Submenu };
