import { useState, useEffect } from 'react';


function useContextMenu({ duration }) {

    const [data, setData] = useState({
        visible: false,
        willEnter: false,
        willLeave: false,
        triggerEvent: null,
        domNodes: null,
    });
    

    /**
     * Shows the context menu
     * @param {Event} event the event from contextmenu listener
     */
    function show(event, domNodes) {
        console.log("show menu");
        if (event) {
            if (event.defaultPrevented) return;
            event.preventDefault();
            event.stopPropagation();
        }
        
        setData(d => ({
            ...d,
            visible: true,
            willLeave: false,
            willEnter: true,
            triggerEvent: event,
            domNodes,
        }));
        
        setTimeout(() => {
            console.log("show menu done");
            // setupListeners();
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
        console.log("hide menu");
        setData(d => ({
            ...d,
            willLeave: true,
        }));
        setTimeout(() => {
            console.log("hide menu done");
            // removeListeners();
            setData(d => ({
                ...d,
                visible: false,
                willLeave: false,
                triggerEvent: null,
                domNodes: null
            }));
        }, duration);
    }


    useEffect(() => {
        document.addEventListener("click", () => {console.log("listener calls hideMenu"); hideMenu();});
        document.addEventListener("contextmenu", () => {console.log("listener calls hideMenu"); hideMenu();});
        document.addEventListener("keydown", () => {console.log("listener calls hideMenu"); hideMenu();});
        return () => {
            document.removeEventListener("click", () => {console.log("listener calls hideMenu"); hideMenu();});
            document.removeEventListener("contextmenu", () => {console.log("listener calls hideMenu"); hideMenu();});
            document.removeEventListener("keydown", () => {console.log("listener calls hideMenu"); hideMenu();});
        };
    }, []);


    /**
     * The data to pass to your context menu
     */
    const dataOut = {
        ...data,
        hideMenu,
        duration
    }

    return [show, dataOut];
}


export { useContextMenu };