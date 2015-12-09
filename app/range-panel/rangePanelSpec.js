import dtPickerMain from '../main';
import RangeObserver from '../rangeObserver';
import TimeResolution from '../timeResolution';
import moment from 'moment';

describe('Range Panel', function () {
    var scope, $compile, element, $timeout, service;

    function compileDirective() {
        scope.observer = new RangeObserver();
        scope.dictionary = [{ label: 'Last 10 Minutes', duration: { unit: 'minutes', value: 10 }},
            { label: 'Last Hour', duration: { unit: 'hour', value: 1 }},
            { label: 'Last 24 Hours', duration: { unit: 'day', value: 1 }},
            { label: 'Last 7 Days', duration: { unit: 'week', value: 1 }},
            { label: 'Custom Range', custom: true }];
        element = $compile('<range-panel observer="observer" dictionary="dictionary" hide-time-unit="hideTimeUnit" single-date="singleDate"></range-panel>')(scope);
        $timeout.flush();
    }

    beforeEach(angular.mock.module(dtPickerMain));

    beforeEach(angular.mock.inject([
        '$rootScope',
        '$timeout',
        '$compile',
        'pickerService',
        function (_$rootScope_, _$timeout_, _$compile_, _service_) {
            $compile = _$compile_;
            scope = _$rootScope_.$new();
            $timeout = _$timeout_;
            service = _service_;
            compileDirective();
        }
    ]));

    it('Loads component', function () {
        expect(element.isolateScope()).toBeDefined();
        expect(element.isolateScope().dictionary).toBeDefined();
        expect(element.isolateScope().hours).toBeDefined();
        expect(element.isolateScope().durations).toBeDefined();
    });

    it('Component is initialized with a date from controller', function () {
        expect(element.isolateScope().internalRange).toBeUndefined();
        expect(element.isolateScope().selectedFrom).toBeUndefined();
        expect(element.isolateScope().selectedDuration).toBeUndefined();
        scope.observer.emit('rangePanelSpec', TimeResolution.timeResolutionFromLocal({ label: 'Last 24 Hours', duration: { unit: 'day', value: 1 }}));
        expect(element.isolateScope().internalRange).toBeDefined();
        expect(element.isolateScope().selectedFrom).toBeDefined();
        expect(element.isolateScope().selectedDuration).toBeDefined();
    });

    it('Can select units for certain ranges', function () {
        scope.observer.emit('rangePanelSpec', TimeResolution.timeResolutionFromLocal({ label: 'Last 24 Hours', duration: { unit: 'day', value: 1 }}));
        expect(element.isolateScope().internalRange.selectedRange.timeUnits).toBeUndefined();
        scope.observer.emit('rangePanelSpec', TimeResolution.timeResolutionFromLocal({ label: 'Last 7 Days', duration: { unit: 'week', value: 1 }}));
        expect(element.isolateScope().internalRange.selectedRange.timeUnits.length).toBe(2);
        scope.observer.emit('rangePanelSpec', TimeResolution.timeResolutionFromLocal({ label: 'Last 24 Hours', duration: { unit: 'day', value: 1 }}));
        expect(element.isolateScope().internalRange.selectedRange.timeUnits).toBeUndefined();
        scope.observer.emit('rangePanelSpec', element.isolateScope().internalRange.changeWithDuration({ value: 3, unit: 'hours', label: '3 hours' }));
        expect(element.isolateScope().internalRange.selectedRange.timeUnits.length).toBe(2);
    });

    it('Can select a different range', function () {
        scope.observer.emit('rangePanelSpec', TimeResolution.timeResolutionFromLocal({ label: 'Last 24 Hours', duration: { unit: 'day', value: 1 }}));
        var dateTest;
        element.isolateScope().observer.subscribe('rangePanelSpec', function (date) {
            dateTest = date;
        });
        element.isolateScope().selectRangeOption({ label: 'Last Hour', duration: { unit: 'hour', value: 1 }});
        expect(element.isolateScope().internalRange).toBeDefined();
        expect(dateTest.selectedRange.label).toBe('Last Hour');
    });

    it('Can select a different unit', function () {
        scope.observer.emit('rangePanelSpec', TimeResolution.timeResolutionFromLocal({ label: 'Last Hour', duration: { unit: 'hour', value: 1 }}));
        var dateTest;
        element.isolateScope().observer.subscribe('rangePanelSpec', function (date) {
            dateTest = date;
        });
        scope.observer.emit('otherPanelSpec', element.isolateScope().internalRange.changeWithDuration({ value: 2, unit: 'hours', label: '2 hours' }));
        expect(element.isolateScope().internalRange.timeUnit).toBe('minute');
        if (moment().minute() > 0 && moment().minute() < 59) {
            expect(moment(dateTest.to).minute()).not.toBe(0);
        }
        element.isolateScope().selectTimeUnit('hour');
        expect(dateTest.timeUnit).toBe('hour');
        expect(moment(dateTest.to).minute()).toBe(0);
    });

    it('Can select a different from', function () {
        scope.observer.emit('durationPanelSpec', TimeResolution.timeResolutionFromLocal({ label: 'Last 24 Hours', duration: { unit: 'day', value: 1 }}));
        var dateTest;
        element.isolateScope().observer.subscribe('durationPanelSpec', function (date) {
            dateTest = date;
        });
        element.isolateScope().selectFrom({ value: -1 });
        expect(dateTest.selectedRange.label).toBe('Last Hour');
        element.isolateScope().selectFrom({ value: -10 });
        expect(dateTest.selectedRange.label).toBe('Last 10 Minutes');
        const twoHoursAgo = moment().subtract(2, 'hours').hours();
        element.isolateScope().selectFrom({ value: twoHoursAgo, label: `{twoHoursAgo}:00` });
        expect(dateTest.selectedRange.label).toBe('Custom Range');
        expect(moment(element.isolateScope().internalRange.from).hours()).toBe(twoHoursAgo);
    });

    it('Can select a different duration', function () {
        scope.observer.emit('durationPanelSpec', TimeResolution.timeResolutionFromLocal({ label: 'Last Hour', duration: { unit: 'hour', value: 1 }}));
        var dateTest;
        element.isolateScope().observer.subscribe('durationPanelSpec', function (date) {
            dateTest = date;
        });
        element.isolateScope().selectDuration({ value: 2, label: '2 hours', unit: 'hours' });
        scope.$digest();
        expect(element.isolateScope().internalRange.selectedRange.label).toBe('Custom Range');
        expect(element.isolateScope().selectedDuration.value).toBe(2);
        expect(element.isolateScope().internalRange.timeUnit).toBe('minute');
        expect(element.isolateScope().selectedFrom.value).toBeDefined();
        expect(angular.element(element.find(".to-value")[0]).html()).not.toBe('');
        var from = new moment(element.isolateScope().internalRange.from);
        var to = new moment(element.isolateScope().internalRange.to);
        expect(to.diff(from, 'hours')).toBe(2);
    });
});

