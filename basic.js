/**
 * @param {string} selector
 * @param {HTMLElement} ref
 * @returns {HTMLElement[]}
 */
window.get = (selector, ref = document) => {
    return Array.from(ref.querySelectorAll(selector)).map((e) => {
        e.get = (selector) => window.get(selector, e);
        return e;
    });
}


/**
 * @param {string} tagname
 * @param {object} properties
 * @returns {HTMLElement}
 */
window.newNode = (tagname, properties = {}) => {
    let propertyModifier = (obj, properties) => {
        for (let key of Object.keys(properties)) {
            (
                (typeof (obj[key]) === 'object') ?
                    (propertyModifier(obj[key], properties[key]))
                    :
                    (obj[key] = properties[key])
            );
        }

        return obj;
    };
    return propertyModifier(document.createElement(tagname), properties);
}

window.ls = ls_proxy(localStorage);



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

/**
 * @param {Array} values 
 * @param {Array} keys 
 * @param {Function} customMap 
 * @returns {Object}
 */
function mapArrToObj(values, keys = [], customMap = () => { }) {

    if (keys.length != values.length) keys = new Array(values.length).fill().map((e, i) => i);

    if (customMap(0) === undefined) customMap = (key, val) => val;

    return values.reduce((obj, val, index) => {
        const key = keys[index];
        return ({ ...obj, [key]: customMap(key, val) });
    }, {});
}