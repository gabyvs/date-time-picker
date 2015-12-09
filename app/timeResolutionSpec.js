import moment from 'moment';
import TimeResolution from './timeResolution';

describe('Time Resolution', function () {
    it('Creates time resolution with from and to', function () {
        const now = new Date();
        const timeRes = new TimeResolution(moment(now).subtract(1, 'hour').valueOf(), moment(now).valueOf());
        expect(timeRes.from).toBe(moment(now).subtract(1, 'hour').valueOf());
        expect(timeRes.to).toBe(moment(now).valueOf());
        expect(timeRes.timeUnit).toBe('minute');
        expect(timeRes.selectedRange.custom).toBe(true);
    });

    it('Creates time resolution with from, to, time unit and range', function () {
        const now = new Date();
        const timeRes = new TimeResolution(moment(now).subtract(7, 'days').valueOf(), moment(now).valueOf(), 'day', { label: 'Last 7 Days', duration: { unit: 'week', value: 1 }});
        expect(timeRes.from).toBe(moment(now).subtract(7, 'days').valueOf());
        expect(timeRes.to).toBe(moment(now).valueOf());
        expect(timeRes.timeUnit).toBe('day');
        expect(timeRes.selectedRange.label).toBe('Last 7 Days');
        expect(timeRes.suggestedTimeUnit()).toBe('day');
    });

    it('Suggests time unit', function () {
        const now = new Date();
        var timeRes = new TimeResolution(moment(now).subtract(1, 'hour').valueOf(), moment(now).valueOf());
        expect(timeRes.timeUnit).toBe('minute');
        timeRes = new TimeResolution(moment(now).subtract(4, 'hour').valueOf(), moment(now).valueOf());
        expect(timeRes.timeUnit).toBe('hour');
        timeRes = new TimeResolution(moment(now).subtract(9, 'day').valueOf(), moment(now).valueOf());
        expect(timeRes.timeUnit).toBe('day');
        timeRes = new TimeResolution(moment(now).subtract(8, 'month').valueOf(), moment(now).valueOf());
        expect(timeRes.timeUnit).toBe('week');
        timeRes = new TimeResolution(moment(now).subtract(4, 'year').valueOf(), moment(now).valueOf());
        expect(timeRes.timeUnit).toBe('month');
    });

    it('Rounds ranges', function () {
        const now = new Date();
        const timeRes = new TimeResolution(moment(now).subtract(1, 'hour').valueOf(), moment(now).valueOf());
        expect(timeRes.timeUnit).toBe('minute');
        const suggestedRange = timeRes.suggestedRange();
        expect(moment(suggestedRange.to).minutes()).toBe(moment(now).minutes());
        expect(moment(suggestedRange.to).seconds()).toBe(0);
        expect(moment(suggestedRange.from).seconds()).toBe(0);
    });

    it('Creates a new time resolution from an existing one and a new starting date', function () {
        const now = new Date();
        const timeRes = new TimeResolution(moment(now).subtract(1, 'hour').valueOf(), moment(now).valueOf());
        const newDate = timeRes.changeStartingDate(moment(now).subtract(2, 'day').valueOf());
        expect(moment(newDate.from).date()).toBe(moment(now).subtract(2, 'days').date());
        expect(moment(newDate.to).hours()).toBe(moment(now).hours());
        expect(moment(newDate.to).minutes()).toBe(moment(now).minutes());
        expect(newDate.timeUnit).toBe('minute');
        expect(newDate.timeUnit).toBe(timeRes.timeUnit);
        expect(newDate.selectedRange.custom).toBe(true);
    });

    it('Creates a new time resolution from an existing one and a new starting hour', function () {
        const now = new Date();
        const timeRes = new TimeResolution(moment(now).subtract(1, 'hour').valueOf(), moment(now).valueOf());
        const newDate = timeRes.changeStartingHour({ value: 10, label: '10:00' });
        expect(moment(newDate.to).diff(moment(newDate.from), 'hours')).toBe(1);
        expect(moment(newDate.from).minutes()).toBe(0);
        expect(moment(newDate.to).minutes()).toBe(0);
        expect(newDate.timeUnit).toBe('minute');
        expect(newDate.selectedRange.custom).toBe(true);
    });

    it('Creates a new time resolution from an existing one and a new duration', function () {
        const now = new Date();
        const timeRes = new TimeResolution(moment(now).subtract(6, 'hour').valueOf(), moment(now).subtract(5, 'hour').valueOf());
        const newDate = timeRes.changeWithDuration({ value: 6, unit: 'hours', label: '6 hours' });
        expect(moment(newDate.to).diff(moment(newDate.from), 'hours')).toBe(6);
        expect(newDate.timeUnit).toBe('hour');
        expect(newDate.selectedRange.custom).toBe(true);
    });

    it('Creates a new time resolution from an existing one and a new range option', function () {
        const now = new Date();
        const timeRes = new TimeResolution(moment(now).subtract(6, 'hour').valueOf(), moment(now).valueOf());
        const newDate = timeRes.changeWithRangeOption({ label: 'Last Hour', duration: { unit: 'hour', value: 1 }});
        expect(moment(newDate.to).diff(moment(newDate.from), 'hours')).toBe(1);
        expect(newDate.timeUnit).toBe('minute');
        expect(newDate.selectedRange.label).toBe('Last Hour')
    });

    it('Creates a new time resolution from an existing one and a new time unit', function () {
        const timeRes = TimeResolution.timeResolutionFromLocal({ label: 'Last 7 Days', duration: { unit: 'week', value: 1 }}, 'day');
        const newDate = timeRes.changeWithTimeUnit('hour');
        expect(newDate.from).toBe(timeRes.from);
        expect(newDate.to).toBe(timeRes.to);
        expect(newDate.selectedRange.label).toBe(timeRes.selectedRange.label);
        expect(newDate.timeUnit).toBe('hour');
    });

    it('Refreshes a time resolution', function () {
        const aMinuteAgo = moment().subtract(1, 'minute').valueOf();
        const timeRes = new TimeResolution(moment(aMinuteAgo).subtract(1, 'hour').valueOf(), aMinuteAgo, 'minute', { label: 'Last Hour', duration: { unit: 'hour', value: 1 }});
        const newDate = timeRes.refresh();
        expect(moment(newDate.to).minutes()).toBe(moment().minutes());
        expect(newDate.selectedRange.label).toBe(timeRes.selectedRange.label);
        expect(newDate.timeUnit).toBe(timeRes.timeUnit);
    });

    it('Clones a new time resolution', function () {
        const timeRes = TimeResolution.timeResolutionFromLocal({ label: 'Last 7 Days', duration: { unit: 'week', value: 1 }}, 'day');
        const newDate = timeRes.clone();
        expect(newDate.selectedRange.label).toBe(timeRes.selectedRange.label);
        expect(newDate.timeUnit).toBe(timeRes.timeUnit);
        expect(newDate.to).toBe(timeRes.to);
        expect(newDate.from).toBe(timeRes.from);
        expect(newDate.refresh).toBeDefined();
    });

    it('Creates new time resolutions for each of the range options', function () {
        var timeRes = TimeResolution.timeResolutionFromLocal({ label: 'Last Hour', duration: { unit: 'hour', value: 1 }});
        expect(moment(timeRes.to).diff(moment(timeRes.from), 'hours')).toBe(1);
        expect(timeRes.timeUnit).toBe('minute');
        expect(timeRes.selectedRange.label).toBe('Last Hour');
        timeRes = TimeResolution.timeResolutionFromLocal({ label: 'Last 24 Hours', duration: { unit: 'day', value: 1 }});
        expect(moment(timeRes.to).diff(moment(timeRes.from), 'hours')).toBe(24);
        expect(timeRes.timeUnit).toBe('hour');
        expect(timeRes.selectedRange.label).toBe('Last 24 Hours');
        timeRes = TimeResolution.timeResolutionFromLocal({ label: 'Yesterday', duration: { unit: 'day', value: 1, offset: 1 } });
        expect(moment(timeRes.to).diff(moment(timeRes.from), 'hours')).toBe(24);
        expect(moment(timeRes.from).hours()).toBe(0);
        expect(moment(timeRes.to).hours()).toBe(0);
        expect(timeRes.timeUnit).toBe('hour');
        expect(timeRes.selectedRange.label).toBe('Yesterday');
        timeRes = TimeResolution.timeResolutionFromLocal({ label: 'Last 7 Days', duration: { unit: 'week', value: 1 }});
        expect(moment(timeRes.to).diff(moment(timeRes.from), 'days')).toBe(7);
        expect(timeRes.timeUnit).toBe('hour');
        expect(timeRes.selectedRange.label).toBe('Last 7 Days');
        timeRes = timeRes.changeWithRangeOption({ label: 'Custom Range', custom: true });
        expect(moment(timeRes.to).diff(moment(timeRes.from), 'days')).toBe(8);
        expect(timeRes.timeUnit).toBe('hour');
        expect(timeRes.selectedRange.label).toBe('Custom Range');
    });
});

