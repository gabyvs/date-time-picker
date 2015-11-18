import dtPickerMain from '../main';
import RangeObserver from '../rangeObserver';
import TimeResolution from '../timeResolution';
import moment from 'moment';

describe('Absolute Panel', function () {
    var scope, $compile, element, $timeout, service;

    function compileDirective() {
        scope.observer = new RangeObserver();
        scope.dictionary = service.defaultDictionary;
        element = $compile('<absolute-panel observer="observer" dictionary="dictionary" hide-time-unit="hideTimeUnit"></absolute-panel>')(scope);
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
    });

    it('Component is initialized with a date from controller', function () {
        expect(element.isolateScope().internalRange).toBeUndefined();
        scope.observer.emit('absolutePanelSpec', TimeResolution.timeResolutionFromLocal({ label: 'Last 24 Hours', duration: { unit: 'day', value: 1 }}));
        expect(element.isolateScope().internalRange).toBeDefined();
    });

    it('Can select units for certain ranges', function () {
        scope.observer.emit('absolutePanelSpec', TimeResolution.timeResolutionFromLocal({ label: 'Last 24 Hours', duration: { unit: 'day', value: 1 }}));
        expect(element.isolateScope().internalRange.selectedRange.timeUnits).toBeUndefined();
        scope.observer.emit('absolutePanelSpec', TimeResolution.timeResolutionFromLocal({ label: 'Last 7 Days', duration: { unit: 'week', value: 1 }}));
        expect(element.isolateScope().internalRange.selectedRange.timeUnits.length).toBe(2);
        scope.observer.emit('absolutePanelSpec', TimeResolution.timeResolutionFromLocal({ label: 'Last 24 Hours', duration: { unit: 'day', value: 1 }}));
        expect(element.isolateScope().internalRange.selectedRange.timeUnits).toBeUndefined();
        scope.observer.emit('absolutePanelSpec', element.isolateScope().internalRange.changeWithDuration({ value: 3, unit: 'hours', label: '3 hours' }));
        expect(element.isolateScope().internalRange.selectedRange.timeUnits.length).toBe(2);
    });

    it('Can select a different range', function () {
        scope.observer.emit('absolutePanelSpec', TimeResolution.timeResolutionFromLocal({ label: 'Last 24 Hours', duration: { unit: 'day', value: 1 }}));
        var dateTest;
        element.isolateScope().observer.subscribe('absolutePanelSpec', function (date) {
            dateTest = date;
        });
        element.isolateScope().selectRangeOption({ label: 'Last Hour', duration: { unit: 'hour', value: 1 }});
        expect(element.isolateScope().internalRange).toBeDefined();
        expect(dateTest.selectedRange.label).toBe('Last Hour');
    });

    it('Can select a different unit', function () {
        scope.observer.emit('absolutePanelSpec', TimeResolution.timeResolutionFromLocal({ label: 'Last Hour', duration: { unit: 'hour', value: 1 }}));
        var dateTest;
        element.isolateScope().observer.subscribe('absolutePanelSpec', function (date) {
            dateTest = date;
        });
        scope.observer.emit('otherPanelSpec', element.isolateScope().internalRange.changeWithDuration({ value: 2, unit: 'hours', label: '2 hours' }));
        expect(dateTest.timeUnit).toBe('minute');
        if (moment().minute() > 0 && moment().minute() < 59) {
            expect(moment(dateTest.to).minute()).not.toBe(0);
        }
        element.isolateScope().selectTimeUnit('hour');
        expect(dateTest.timeUnit).toBe('hour');
        expect(moment(dateTest.to).minute()).toBe(0);
    });
});

