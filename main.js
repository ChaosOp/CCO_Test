const widthList = [29, 100, 28];


const defaultPos = {
    "#refreshInv": [510, 10],
    "#refreshMap": [1100, 5],
    "#refreshChat": [1600, 60],
    "#switchInv": [1180, 5],
    "#switchChat": [1240, 5]
};

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

    window.ls = ls_proxy(localStorage);

    ["switchStatus", "tempPos"].forEach((key) => {
        if (!ls[key]) ls[key] = {};
    });


    ["Inv", "Map", "Chat"].forEach((route, i) => {
        const notMap = route !== "Map";

        let frame = window.newNode("iframe", {
            id: `${route}Window`,
            frameBorder: "0",
            src: `https://cybercodeonline.com/tabs/${route}`,
            style: {
                "width": `${widthList[i]}%`,
                "position": notMap ? "absolute" : "",
                "z-index": notMap ? 500 : 0,
                "left": `${i * (100 - widthList[i]) / 2}%`
            }
        });

        window.get("#wrap")[0].appendChild(frame);

        addDragButton("refresh", route, (refresh) => {
            if (refresh.drag) return;
            frame.src = frame.src;
        });

        if (notMap) {
            const setSwitchStatus = (OnOffSwitch, status) => {
                OnOffSwitch.style.backgroundColor = (+status) ? "#bdffc8" : "#fc5688";
                frame.style.display = (+status) ? "" : "none";
                ls.switchStatus[OnOffSwitch.id] = status;
            };

            const OnOffSwitch = addDragButton("switch", route, (OnOffSwitch) => {
                if (OnOffSwitch.drag) return;
                setSwitchStatus(OnOffSwitch, +!ls.switchStatus[OnOffSwitch.id]);
            });

            setSwitchStatus(OnOffSwitch, ls.switchStatus[OnOffSwitch.id] ?? 1);
        }

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

function ls_proxy(obj, keys = []) {
    return new Proxy(obj, { get, set });

    function get(obj, p, is_proxy = true) {

        if (!p.toString()) return obj;

        let result = obj;
        for (let k of p.toString().split(',')) {
            if (k in result) result = result[k];
            else break;
        }
        if (result === obj) return undefined;

        try {
            result = JSON.parse(result);
        }
        catch { }


        if (!Array.isArray(result) && typeof (result) === 'object' && is_proxy) {
            result = ls_proxy(result, keys.concat(p));
        }

        return result;
    }

    function set(obj, p, val) {

        if (keys.length !== 0) {
            let original_key = keys.shift();
            let pre_obj = get(localStorage, original_key, false);
            get(pre_obj, keys, false)[p] = val;

            localStorage[original_key] = JSON.stringify(pre_obj);
        }

        obj[p] = JSON.stringify(val);
    }

}
