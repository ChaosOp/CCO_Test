const widthList = [27, 30, 27];

const defaultPos = {
    "#refreshInv": [550, 10],
    "#refreshMap": [1255, 5],
    "#refreshChat": [1600, 60]
};

const iconList = {
    "Inv": "https://i.imgur.com/WJA22Rn.png",
    "Map": "https://i.imgur.com/k8KdSVE.png",
    "Chat": "https://i.imgur.com/VvRco9j.png"
};


["Inv", "Map", "Chat"].forEach((route, i) => {
    let frame = window.newNode("iframe", {
        id: `${route}Window`,
        frameBorder: "0",
        src: `https://cybercodeonline.com/tabs/${route}`,
        style: {
            "width": `${widthList[i]}%`,
            "margin": `0px ${i == 1 ? "8%" : ""}`
        }
    });

    window.get("#wrap")[0].appendChild(frame);

    addRefresh(route, frame);
});

/**
 * @param {String} selector selector of the element to be inited
 */
function initDrag(selector) {

    let dragElement = window.get(selector)[0];
    if (dragElement.initedDrag) return;

    let eventList = (window.ontouchstart === undefined) ?
        (['mousedown', 'mousemove', 'mouseup'])
        :
        (['touchstart', 'touchmove', 'touchend']);

    let [startEvt, moveEvt, endEvt] = eventList;


    setElementPos(selector, ...(JSON.parse(localStorage.tempPos ? localStorage.tempPos : "{}")?.[selector] ?? [0, 0]));

    dragElement.style.cursor = 'move';
    dragElement.initedDrag = true;

    dragElement.addEventListener(startEvt, (dragEvent) => {

        dragElement.drag = false;

        dragEvent.preventDefault();

        let startPos = getEventPos(dragEvent);

        let distance = ["Left", "Top"].map((type, i) => startPos[i] - dragElement[`offset${type}`]);

        let moveHandler = (event) => {

            dragElement.drag = true;

            let pos = getEventPos(event).map((pos, i) => pos - distance[i]);

            setElementPos(selector, ...pos);
        }

        let endHandler = () => {
            dragElement.removeEventListener(moveEvt, moveHandler);
            dragElement.removeEventListener(endEvt, endHandler);
        }

        dragElement.addEventListener(moveEvt, moveHandler);
        dragElement.addEventListener(endEvt, endHandler);
    });


    /**
     * @param {Event} event the event includes [x, y]
     * @returns {Array} [X, Y]
     */
    function getEventPos(event) {
        return ["clientX", "clientY"].map((type) => event.touches?.[0][type] ?? event[type]);
    }


    /**
     * @param {String} selector selector of the element to be selected
     * @param {Number} left absolute pos offset from left
     * @param {Number} top absolute pos offset from top
     */
    function setElementPos(selector, left = 0, top = 0) {
        let element = window.get(selector)[0];
        let pos = JSON.parse(localStorage.tempPos ? localStorage.tempPos : "{}");

        if (left || top) {
            pos[selector] = [left, top];
        }

        if (!pos[selector]) {
            pos[selector] = defaultPos[selector];
        }

        const getPercentBorder = (val, total, max, min = 0) => Math.min(Math.max(val, min), max) / total * 100

        const widthLimit = window.innerWidth - dragElement.offsetWidth;
        const heightLimit = window.innerHeight - dragElement.offsetHeight;

        element.style.left = `${getPercentBorder(pos[selector][0], window.innerWidth, widthLimit)}%`;
        element.style.top = `${getPercentBorder(pos[selector][1], window.innerHeight, heightLimit)}%`;

        localStorage.tempPos = JSON.stringify(pos);
    }
}


/**
 * @param {String} id id of IFrame
 * @param {HTMLIFrameElement} windowRef selected IFrame 
 */
function addRefresh(id, windowRef) {


    const refresh = window.newNode("a", {
        id: `refresh${id}`
    });

    const icon = window.newNode("img", {
        src: iconList[id]
    });
    refresh.appendChild(icon);

    refresh.addEventListener("mouseup", () => {
        if (refresh.drag) return;
        windowRef.src = windowRef.src;
    });


    setTimeout(() => {
        window.get("body")[0].appendChild(refresh);
        initDrag(`#refresh${id}`);
    }, 2000);
}