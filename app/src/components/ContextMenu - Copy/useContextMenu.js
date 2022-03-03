import { useState } from 'react';


function useContextMenu({ duration, id }) {

    // const [visible, setVisible] = useState(false);
    // const [willLeave, setWillLeave] = useState(false);
    // const [willEnter, setWillEnter] = useState(false);
    // const [triggerEvent, setTriggerEvent] = useState(null);
    
    const [data, setData] = useState({
        visible: false,
        willEnter: false,
        willLeave: false,
        triggerEvent: null,
    });
    
    function setupListeners() {
        document.addEventListener("click", hideMenu);
        window.addEventListener("scroll", hideMenu);
        document.addEventListener("contextmenu", hideMenu);
    }
    function removeListeners() {
        document.removeEventListener("click", hideMenu);
        window.removeEventListener("scroll", hideMenu);
        document.removeEventListener("contextmenu", hideMenu);
    }
    

    /**
     * Shows the context menu
     * @param {Event} event the event from contextmenu listener
     */
    function show(event) {
        console.log("show menu", id);
        if (event) {
            if (event.defaultPrevented) return;
            event.preventDefault();
        }
        
        setData(d => ({
            ...d,
            visible: true,
            willLeave: false,
            willEnter: true,
            triggerEvent: event,
        }));
        
        setTimeout(() => {
            // setupListeners();
            console.log("show menu done", id);
            setData(d => ({
                ...d,
                willEnter: false,
            }));
        }, duration);
    }


    /**
     * Hides the context menu
     */    
    function hideMenu() {
        console.log("hide menu", id);
        setData(d => ({
            ...d,
            willLeave: true,
        }));
        setTimeout(() => {
            console.log("hide menu done", id);
            // removeListeners();
            setData(d => ({
                ...d,
                visible: false,
                willLeave: false,
                triggerEvent: null,
            }));
        }, duration);
    }


    /**
     * The data to pass to your context menu
     */
    const dataOut = {
        ...data,
        hideMenu
    }

    return [show, dataOut];
}


export default useContextMenu;