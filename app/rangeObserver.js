import _ from 'lodash';

class RangeObserver {
    constructor() {
        this.subscribers = {};
    }

    emit(id, range) {
        if (!range) { return; }
        _.forEach(this.subscribers, (callback, key) => {
            if (key !== id) {
                callback(range);
            }
        });
    }

    emitTo(id, range) {
        if (!range) { return; }
        if (this.subscribers[id]) {
            this.subscribers[id](range);
        }
    }

    subscribe(id, callback) {
        this.subscribers[id] = callback;
    }
}

export default RangeObserver;