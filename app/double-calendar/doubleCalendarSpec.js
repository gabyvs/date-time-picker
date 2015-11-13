import jQuery from 'jquery';
import dtPickerMain from '../main';
import RangeObserver from '../rangeObserver';
import TimeResolution from '../timeResolution';

describe('Double Calendar', function () {
    var scope, $compile, $rootScope, element, $timeout;
    var $ = jQuery;

    function compileDirective() {
        scope.observer = new RangeObserver();
        element = $compile('<double-calendar observer="observer" max-range="maxRange"></double-calendar>')(scope);
        $timeout.flush();
    }

    beforeEach(angular.mock.module(dtPickerMain));

    beforeEach(angular.mock.inject([
        '$rootScope',
        '$compile',
        '$timeout',
        function (_$rootScope_, _$compile_, _$timeout_) {
            $compile = _$compile_;
            scope = _$rootScope_.$new();
            $rootScope = _$rootScope_;
            $timeout = _$timeout_;
            compileDirective();
        }
    ]));

    it('Loads calendar component', function () {
        expect(element.isolateScope()).toBeDefined();
        expect(element.find('.datepick').length).toBe(1);
    });

    it('User selects a range from calendar, controller is alerted', function () {
        var rangeSet;
        element.isolateScope().observer.subscribe('doubleCalendarSpec', function (range) {
            rangeSet = range;
        });
        $(element).datepick('setDate', new Date(), new Date());
        expect(rangeSet).toBeDefined();
        expect(rangeSet.selectedRange.custom).toBe('date');
    });

    it('Calendar is initialized with a range from controller', function () {
        expect($(element).datepick('getDate')[0]).toBeUndefined();
        scope.observer.emit('doubleCalendarSpec', TimeResolution.timeResolutionFromLocal({ label: 'Last 7 Days', duration: { unit: 'day', value: 7 }}));
        expect($(element).datepick('getDate')[0]).toBeDefined();
        expect($(element).datepick('getDate')[1]).toBeDefined();
    });

    it('Sets a max range available', function () {
        scope.maxRange = 15;
        $rootScope.$digest();
        expect(element.isolateScope().maxRange).toBe(15);
    });
});

