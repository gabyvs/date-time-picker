import jQuery from 'jquery';
import dtPickerMain from '../main';

describe('Single Calendar', function () {
    var scope, $compile, $rootScope, element;
    var $ = jQuery;

    function compileDirective() {
        element = $compile('<single-calendar on-date-selected="onDateSelected(dateSelected)" single-date="singleDate"></single-calendar>')(scope);
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

    it('User selects a date from calendar, controller is alerted', function () {
        var dateTest;
        scope.onDateSelected = function (dateSelected) {
            dateTest = dateSelected;
        };
        $(element).datepick('setDate', new Date());
        expect(dateTest).toBeDefined();
    });

    it('Calendar is initialized with a date from controller', function () {
        expect($(element).datepick('getDate')[0]).toBeUndefined();
        var dateTest;
        scope.onDateSelected = function (dateSelected) {
            dateTest = dateSelected;
        };
        scope.singleDate = new Date();
        $rootScope.$apply();
        expect(dateTest).toBeUndefined();
        expect($(element).datepick('getDate')[0]).toBeDefined();
    });
});

