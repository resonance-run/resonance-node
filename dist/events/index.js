export var EVENT_TYPE;
(function (EVENT_TYPE) {
    EVENT_TYPE["IMPRESSION"] = "impression";
})(EVENT_TYPE || (EVENT_TYPE = {}));
const listeners = {
    [EVENT_TYPE.IMPRESSION]: [],
};
export const addListener = (eventType, listener) => {
    listeners[eventType].push(listener);
};
export const triggerEvent = (eventType, eventData) => {
    listeners[eventType].forEach(cb => cb(eventData));
};
