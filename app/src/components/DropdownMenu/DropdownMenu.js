import React, { useState } from 'react'

import { ChevronRightRounded } from '@material-ui/icons';

import "./dropdownMenu.less";

const DropdownMenu = (props) => {

    const [currentValue, setCurrentValue] = useState(props.default);
    const [isOpen, setIsOpen] = useState(false);

    const selectOption = (value) => {
        props.onChange && props.onChange(value, props.options[value]);
        setCurrentValue(value);
        setIsOpen(false);
    }

    return (
        <div className="dropdownMenu">
            <span className="label">{props.label}</span>
            <div
                className="dropdown"
                onClick={(e) => {
                    if (e.target.className == "dropdownOptionList visible") return;
                    setIsOpen(!isOpen);
                }}
            >
                <span className="currentOption">
                    {!isNaN(currentValue)
                        ? props.options[currentValue]
                        : props.placeholder}
                </span>
                <ChevronRightRounded className={isOpen ? "active" : ""} />
                <div
                    className={
                        isOpen
                            ? "dropdownOptionList visible"
                            : "dropdownOptionList"
                    }
                >
                    {Object.entries(props.options).map(([v, n]) => {
                        return (
                            <div
                                key={v}
                                className={
                                    currentValue == v
                                        ? "dropdownOption selected"
                                        : "dropdownOption"
                                }
                                onClick={() => selectOption(v)}
                            >
                                {n}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default DropdownMenu
