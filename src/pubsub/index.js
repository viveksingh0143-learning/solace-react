export function subscribeEvent(eventClass, handler) {
    let eventHandler = function (event) {
        handler(...event.detail);
    };
    document.addEventListener(eventClass.name, eventHandler, { passive: true });
    return {
        unsubscribe: function unsubscribe() {
            document.removeEventListener(eventClass.name, eventHandler);
        },
    };
}

export function publishEvent(event) {
    let nativeEvent = new CustomEvent(event.constructor.name, {
        detail: event.args,
    });
    document.dispatchEvent(nativeEvent);
}