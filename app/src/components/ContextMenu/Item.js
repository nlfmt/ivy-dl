import React from "react";


const Item = ({children, onClick, icon}) => {

    function handleClick(e) {
        e.preventDefault();
        onClick?.(e);
    }

    return (
        <div className="contextMenu-item" onClick={handleClick}>
            {icon}
            {children}
        </div>
    );
};

export { Item };
