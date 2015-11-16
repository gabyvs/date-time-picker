import moment from 'moment';
import TimeResolution from './timeResolution';

describe('Time Resolution', function () {
    xit('Creates new time resolution', function () {
        var now = new Date();
        const newDate = new TimeResolution(moment(now).valueOf(), moment(now).subtract(1, 'hour').valueOf());
        expect(newDate.from).toBe(moment(now).valueOf());
        expect(newDate.to).toBe(moment(now).subtract(1, 'hour').valueOf());
        expect(newDate.timeUnit).toBe('minute');
        expect(newDate.selectedRange.custom).toBe('time');
    });
});

