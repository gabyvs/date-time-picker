import dtPickerMain from './main';

describe('Date Time Picker', function () {
    var scope, $compile, $rootScope, service, element, $timeout;
    var $ = jQuery;

    function compileDirective () {
        element = $compile('<dt-picker range="range" options="options" range-dictionary="rangeDictionary"></dt-picker>')(scope);
        $rootScope.$digest();
    }

    beforeEach(angular.mock.module(dtPickerMain));

    beforeEach(angular.mock.inject([
        '$rootScope',
        '$compile',
        '$timeout',
        'pickerService',
        function (_$rootScope_, _$compile_, _$timeout_,  _service_) {
            $compile = _$compile_;
            scope = _$rootScope_.$new();
            $rootScope = _$rootScope_;
            service = _service_;
            $timeout = _$timeout_;
            compileDirective();
        }
    ]));

    it('Loading directive.', function () {
        var element = $compile('<dt-picker range="range" options="options" range-dictionary="rangeDictionary"></dt-picker>')(scope);
        scope.$digest();
        expect(element.isolateScope()).toBeDefined();
        expect(element.isolateScope().observer).toBeDefined();
        expect(element.isolateScope().dictionary).toBeDefined();
        var rangeSet;
        element.isolateScope().observer.subscribe('test', function (range) {
            rangeSet = range;
        });
        $timeout.flush();
        expect(element.isolateScope().threeLetterTimezoneLabel).toBeDefined();
        expect(element.isolateScope().range).toBeDefined();
        expect(element.isolateScope().internalRange).toBeDefined();
        expect(element.isolateScope().isTimeRange).toBe(true);
        expect(rangeSet).toBeDefined();
        expect(scope.range).toBeDefined();
    });

    it('Shows and hides configuration panel', function () {
        expect(element.isolateScope().configuring).toBeUndefined();
        expect(element.find('.date-time-configure').hasClass('ng-hide')).toBe(true);
        element.isolateScope().configure();
        $rootScope.$digest();
        expect(element.isolateScope().configuring).toBe(true);
        expect(element.find('.date-time-configure').hasClass('ng-hide')).toBe(false);
        element.isolateScope().close();
        $rootScope.$digest();
        expect(element.isolateScope().configuring).toBe(false);
        expect(element.find('.date-time-configure').hasClass('ng-hide')).toBe(true);
    });

    // TODO: fix this test
    xit('Can refresh page', function () {
        expect(element.isolateScope().internalRangeObject.selectedRange.label).toBe('Last 24 Hours');
        expect(element.isolateScope().internalRangeObject.selectedRange.duration.unit).toBe('day');
        expect(element.isolateScope().internalRangeObject.selectedRange.duration.value).toBe(1);
        expect(element.isolateScope().savedRange.duration.unit).toBe('day');
        expect(element.isolateScope().savedRange.duration.value).toBe(1);
        element.isolateScope().configure();
        element.isolateScope().selectRangeOption(element.isolateScope().dictionary[3]);
        $rootScope.$digest();
        expect(element.isolateScope().internalRangeObject.selectedRange.duration.unit).toBe('week');
        expect(element.isolateScope().internalRangeObject.selectedRange.duration.value).toBe(1);
        element.isolateScope().close();
        element.isolateScope().refresh();
        $rootScope.$digest();
        expect(element.isolateScope().internalRangeObject.selectedRange.duration.unit).toBe('day');
        expect(element.isolateScope().internalRangeObject.selectedRange.duration.value).toBe(1);
        expect(element.isolateScope().savedRange.duration.unit).toBe('day');
        expect(element.isolateScope().savedRange.duration.value).toBe(1);
    });

    // TODO: fix this test
    xit('Saves selection to controller scope', function () {
        element.isolateScope().selectRangeOption(element.isolateScope().dictionary[3]);
        $rootScope.$digest();
        element.isolateScope().save();
        $rootScope.$digest();
        expect(element.isolateScope().configuring).toBe(false);
        expect(element.find('.date-time-configure').hasClass('ng-hide')).toBe(true);
        expect(new moment(scope.range.to).diff(scope.range.from, 'days')).toBe(7);
    });
});