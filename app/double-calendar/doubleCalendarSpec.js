import jQuery from 'jquery';
import dtPickerMain from '../main';
import RangeObserver from '../rangeObserver';
import TimeResolution from '../timeResolution';
import moment from 'moment';
import datepick from 'imports?jQuery=jquery!../datepick/jquery.datepick.js';

describe('Double Calendar', function () {
    var scope, $compile, $rootScope, element, $timeout;
    var $ = jQuery;

    function compileDirective() {
        scope.observer = new RangeObserver();
        element = $compile('<double-calendar observer="observer" max-range="maxRange" single-date="singleDate"></double-calendar>')(scope);
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
        expect(rangeSet.selectedRange.custom).toBe(true);
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

    it('Selects only one day when single date flag is on, and a range if it is off', function () {
        var rangeSet;
        element.isolateScope().observer.subscribe('doubleCalendarSpec', function (range) {
            rangeSet = range;
        });
        $(element.find(`.datepick a[title='Select ${moment().date(1).format('dddd, MMM D, YYYY')}']`)).click();
        expect(moment(rangeSet.from).date()).toBe(1);
        expect(moment(rangeSet.to).date()).toBe(2);
        $(element.find(`.datepick a[title='Select ${moment().date(5).format('dddd, MMM D, YYYY')}']`)).click();
        expect(moment(rangeSet.from).date()).toBe(1);
        expect(moment(rangeSet.to).date()).toBe(6);
        scope.singleDate = true;
        scope.$digest();
        $(element.find(`.datepick a[title='Select ${moment().date(1).format('dddd, MMM D, YYYY')}']`)).click();
        expect(moment(rangeSet.from).date()).toBe(1);
        expect(moment(rangeSet.to).date()).toBe(2);
        $(element.find(`.datepick a[title='Select ${moment().date(5).format('dddd, MMM D, YYYY')}']`)).click();
        expect(moment(rangeSet.from).date()).toBe(5);
        expect(moment(rangeSet.to).date()).toBe(6);
    });
});

