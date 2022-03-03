import React from "react";

import MenuContext from "./MenuContext";


const Item = (props) => {

    const { hideMenu, triggerEvent, willLeave } = React.useContext(MenuContext);

    function handleClick(e) {
        e.preventDefault();
        e.stopPropagation();
        hideMenu();

        console.log("click!");
    }

    return (
        <div className="contextMenu-item" onClick={handleClick}>
            {props.children}
        </div>
    );
};

export default Item;
