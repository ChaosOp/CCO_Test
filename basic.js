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