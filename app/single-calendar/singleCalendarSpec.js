import jQuery from 'jquery';
import dtPickerMain from '../main';
import RangeObserver from '../rangeObserver';
import TimeResolution from '../timeResolution';

describe('Single Calendar', function () {
    var scope, $compile, element, $timeout;
    var $ = jQuery;

    function compileDirective() {
        scope.observer = new RangeObserver();
        element = $compile('<single-calendar observer="observer"></single-calendar>')(scope);
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

    it('Loads calendar component', function () {
        expect(element.isolateScope()).toBeDefined();
        expect(element.find('.datepick').length).toBe(1);
    });

    it('User selects a date from calendar, controller is alerted', function () {
        var dateTest;
        element.isolateScope().observer.subscribe('singleCalendarSpec', function (date) {
            dateTest = date;
        });
        $(element).datepick('setDate', new Date());
        expect(dateTest).toBeDefined();
    });

    it('Calendar is initialized with a date from controller', function () {
        expect($(element).datepick('getDate')[0]).toBeUndefined();
        scope.observer.emit('singleCalendarSpec', TimeResolution.timeResolutionFromLocal({ label: 'Last 24 Hours', duration: { unit: 'day', value: 1 }}));
        expect($(element).datepick('getDate')[0]).toBeDefined();
    });
});

