function calculatePosStyle(element, clickEvent, margin=10) {

    const { offsetWidth, offsetHeight } = element;

    const menuLeft = clickEvent.clientX;
    const menuTop = clickEvent.clientY;
    const menuRight = menuLeft + offsetWidth;
    const menuBottom = menuTop + offsetHeight;

    const { innerWidth: width, innerHeight: height } = window;

    let vOrigin = "top";
    let hOrigin = "left";
    let top = menuTop;
    let left = menuLeft;

    if (menuRight > width - margin) {
        hOrigin = "right";
        left = menuLeft - offsetWidth;
    }
    if (menuBottom > height - margin) {
        vOrigin = "bottom";
        top = menuTop - offsetHeight;
    }


    return {top, left, transformOrigin: `${hOrigin} ${vOrigin}`};
}

export default calculatePosStyle;