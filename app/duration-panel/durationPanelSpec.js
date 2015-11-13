import dtPickerMain from '../main';
import RangeObserver from '../rangeObserver';
import TimeResolution from '../timeResolution';
import moment from 'moment';

describe('Duration Panel', function () {
    var scope, $compile, element, $timeout;

    function compileDirective() {
        scope.observer = new RangeObserver();
        scope.dictionary = [{ label: 'Last 10 Minutes', duration: { unit: 'minutes', value: 10 }},
            { label: 'Last Hour', duration: { unit: 'hour', value: 1 }},
            { label: 'Last 24 Hours', duration: { unit: 'day', value: 1 }, preselected: true},
            { label: 'Last 7 Days', duration: { unit: 'week', value: 1 }},
            { label: 'Date Range', custom: 'date' },
            { label: 'Time Range', custom: 'time' }];
        element = $compile('<duration-panel observer="observer" dictionary="dictionary"></duration-panel>')(scope);
        $timeout.flush();
    }

    beforeEach(angular.mock.module(dtPickerMain));

    beforeEach(angular.mock.inject([
        '$rootScope',
        '$timeout',
        '$compile',
        function (_$rootScope_, _$timeout_, _$compile_) {
            $compile = _$compile_;
            scope = _$rootScope_.$new();
            $timeout = _$timeout_;
            compileDirective();
        }
    ]));

    it('Loads component', function () {
        expect(element.isolateScope()).toBeDefined();
        expect(element.isolateScope().hours).toBeDefined();
        expect(element.isolateScope().durations).toBeDefined();
    });

    it('Component is initialized with a date from controller', function () {
        expect(element.isolateScope().internalRange).toBeUndefined();
        expect(element.isolateScope().selectedFrom).toBeUndefined();
        expect(element.isolateScope().selectedDuration).toBeUndefined();
        scope.observer.emit('durationPanelSpec', TimeResolution.timeResolutionFromLocal({ label: 'Last 24 Hours', duration: { unit: 'day', value: 1 }}));
        expect(element.isolateScope().internalRange).toBeDefined();
        expect(element.isolateScope().selectedFrom).toBeDefined();
        expect(element.isolateScope().selectedDuration).toBeDefined();
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
        const twoHoursAgo = moment().hour() - 2;
        element.isolateScope().selectFrom({ value: twoHoursAgo, label: `{twoHoursAgo}:00` });
        expect(dateTest.selectedRange.label).toBe('Time Range');
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
        expect(element.isolateScope().internalRange.selectedRange.label).toBe('Time Range');
        expect(element.isolateScope().selectedDuration.value).toBe(2);
        expect(element.isolateScope().internalRange.timeUnit).toBe('minute');
        expect(element.isolateScope().selectedFrom.value).toBeDefined();
        expect(angular.element(element.find(".to-value")[0]).html()).not.toBe('');
        var from = new moment(element.isolateScope().internalRange.from);
        var to = new moment(element.isolateScope().internalRange.to);
        expect(to.diff(from, 'hours')).toBe(2);
    });
});

