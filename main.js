const width_list = [27, 30, 27];

const default_pos = {
    "#refresh_inv": [550, 10],
    "#refresh_map": [1255, 5],
    "#refresh_chat": [1600, 60]
};

const svg_list = {
    "refresh": "https://www.svgrepo.com/show/54751/refresh.svg",
    "inv": "https://www.svgrepo.com/show/55207/left-arrow.svg",
    "map": "https://www.svgrepo.com/show/43345/dot.svg",
    "chat": "https://www.svgrepo.com/show/58877/right-straight-arrow.svg"
};


["inv", "map", "chat"].forEach((route, i) => {
    let frame = window.new_node("iframe", {
        id: `${route}_window`,
        frameBorder: "0",
        src: `https://cybercodeonline.com/tabs/${route}`,
        style: {
            "width": `${width_list[i]}%`,
            "margin": `0px ${i == 1 ? "8%" : ""}`
        }
    });

    window.get("#wrap")[0].appendChild(frame);

    add_refresh(route, frame);
});


function init_drag(selector) {

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

            const border = document.documentElement.clientWidth - dragElement.offsetWidth;
            let pos = getEventPos(event).map((pos, i) => Math.min(Math.max(pos - distance[i], 0), border));

            setElementPos(selector, ...pos);
        }

        let endHandler = () => {
            dragElement.removeEventListener(moveEvt, moveHandler);
            dragElement.removeEventListener(endEvt, endHandler);
        }

        dragElement.addEventListener(moveEvt, moveHandler);
        dragElement.addEventListener(endEvt, endHandler);
    });

    function getEventPos(event) {
        return ["clientX", "clientY"].map((type) => event.touches?.[0][type] ?? event[type]);
    }

    function setElementPos(selector, left = 0, top = 0) {
        let element = window.get(selector)[0];
        let pos = JSON.parse(localStorage.tempPos ? localStorage.tempPos : "{}");

        if (left || top) {
            pos[selector] = [left, top];
        }

        if (!pos[selector]) {
            pos[selector] = default_pos[selector];
        }


        element.style.left = `${pos[selector][0] / window.innerWidth * 100}%`;
        element.style.top = `${pos[selector][1] / window.innerHeight * 100}%`;


        localStorage.tempPos = JSON.stringify(pos);
    }
}

function add_refresh(id, window_ref) {


    const refresh = window.new_node("a", {
        id: `refresh_${id}`
    });

    const svg = ["refresh", id].map((key, i) => {
        return window.new_node("img", {
            src: svg_list[key],
            style: {
                "top": `${5 + 33 * i}px`,
                "left": "21px",
            }
        });
    });

    svg.forEach((img) => refresh.appendChild(img));

    refresh.addEventListener("mouseup", () => {
        if (refresh.drag) return;
        window_ref.src = window_ref.src;
    });


    setTimeout(() => {
        window.get("body")[0].appendChild(refresh);
        init_drag(`#refresh_${id}`);
    }, 2000);
}