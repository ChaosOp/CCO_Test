const windowWidth = window.outerWidth;

const definedIdList = [
    "#refreshInv",
    "#refreshMap",
    "#refreshChat",
    "#switchInv",
    "#switchChat",
    "chat"
];

const scale = mapArrToObj(
    [3.765, 1.745, 1.2, 1.628, 1.548, 68.571],
    definedIdList
);

//const widthList = [29, 100, (56 - (windowWidth / scale.chat))];
const widthList = [27, 30, 27];

const defaultPos = mapArrToObj(
    [10, 5, 60, 5, 5],
    definedIdList.slice(0, -1),
    (key, val) => [windowWidth / scale[key], val]
);


const iconList = {
    "refresh": {
        "Inv": "https://i.imgur.com/WJA22Rn.png",
        "Map": "https://i.imgur.com/k8KdSVE.png",
        "Chat": "https://i.imgur.com/VvRco9j.png"
    },
    "switch": {
        "Inv": "https://i.imgur.com/6EiLQbu.png",
        "Chat": "https://i.imgur.com/mkrQJQB.png"
    }
};

(() => {


    ["switchStatus", "tempPos"].forEach((key) => {
        if (!ls[key]) ls[key] = {};
    });


    ["Inv", "Map", "Chat"].forEach((route, i) => {
        // const notMap = route !== "Map";

        let frame = window.newNode("iframe", {
            id: `${route}Window`,
            frameBorder: "0",
            src: `https://cybercodeonline.com/tabs/${route}`,
            style: {
                "width": `${widthList[i]}%`,
                "margin": `0px ${i == 1 ? "8%" : ""}`
                //"position": notMap ? "absolute" : "",
                //"z-index": notMap ? 500 : 0,
                //"left": `${i * (100 - widthList[i]) / 2}%`
            }
        });

        window.get("#wrap")[0].appendChild(frame);

        addDragButton("refresh", route, (refresh) => {
            if (refresh.drag) return;
            frame.src = frame.src;
        });

        // if (notMap) {
        //     const setSwitchStatus = (OnOffSwitch, status) => {
        //         OnOffSwitch.style.backgroundColor = (+status) ? "#bdffc8" : "#fc5688";
        //         frame.style.display = (+status) ? "" : "none";
        //         ls.switchStatus[OnOffSwitch.id] = status;
        //     };

        //     const OnOffSwitch = addDragButton("switch", route, (OnOffSwitch) => {
        //         if (OnOffSwitch.drag) return;
        //         setSwitchStatus(OnOffSwitch, +!ls.switchStatus[OnOffSwitch.id]);
        //     });

        //     setSwitchStatus(OnOffSwitch, ls.switchStatus[OnOffSwitch.id] ?? 1);
        // }

    });
})();

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


    setElementPos(selector, ...(ls.tempPos[selector] ?? [0, 0]));

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
        let pos = ls.tempPos;

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

        ls.tempPos = pos;
    }
}


/**
 * @param {String} type type of button
 * @param {String} id id of IFrame 
 * @param {Function} event callback when mouseup
 * @returns {HTMLElement} the button added
 */
function addDragButton(type, id, event) {

    const dragButton = window.newNode("a", {
        id: `${type}${id}`
    });

    const icon = window.newNode("img", {
        src: iconList[type][id]
    });
    dragButton.appendChild(icon);

    dragButton.addEventListener("mouseup", () => event(dragButton));

    setTimeout(() => {
        window.get("body")[0].appendChild(dragButton);
        initDrag(`#${type}${id}`);
    }, 1500);

    return dragButton;
}