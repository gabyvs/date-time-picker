import jQuery from 'jquery';
import dtPickerMain from '../main';

describe('Double Calendar', function () {
    var scope, $compile, $rootScope, element;
    var $ = jQuery;

    function compileDirective() {
        element = $compile('<double-calendar on-range-selected="onRangeSelected" max-range="maxRange" range="dateRange"></double-calendar>')(scope);
        $rootScope.$digest();
    }

    beforeEach(angular.mock.module(dtPickerMain));

    beforeEach(angular.mock.inject([
        '$rootScope',
        '$compile',
        function (_$rootScope_, _$compile_) {
            $compile = _$compile_;
            scope = _$rootScope_.$new();
            $rootScope = _$rootScope_;
            compileDirective();
        }
    ]));

    it('Loads calendar component', function () {
        expect(element.isolateScope()).toBeDefined();
        expect(element.find('.datepick').length).toBe(1);
    });

    it('User selects a range from calendar, controller is alerted', function () {
        var rangeTest;
        scope.onRangeSelected = function (rangeSelected) {
            rangeTest = rangeSelected;
        };
        $(element).datepick('setDate', new Date(), new Date());
        expect(rangeTest).toBeDefined();
    });

    it('Calendar is initialized with a range from controller', function () {
        expect($(element).datepick('getDate')[0]).toBeUndefined();
        var rangeTest;
        scope.onRangeSelected = function (rangeSelected) {
            rangeTest = rangeSelected;
        };
        scope.dateRange = { from: new Date(), to: new Date() };
        $rootScope.$apply();
        expect(rangeTest).toBeUndefined();
        expect($(element).datepick('getDate')[0]).toBeDefined();
        expect($(element).datepick('getDate')[1]).toBeDefined();
    });

    it('Sets a max range available', function () {
        scope.maxRange = 15;
        $rootScope.$digest();
        expect(element.isolateScope().maxRange).toBe(15);
    });
});

