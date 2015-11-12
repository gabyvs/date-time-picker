import dtPickerMain from '../main';
import RangeObserver from '../rangeObserver';
import TimeResolution from '../timeResolution';

describe('Range Panel', function () {
    var scope, $compile, element, $timeout, service;

    function compileDirective() {
        scope.observer = new RangeObserver();
        scope.dictionary = service.defaultDictionary;
        element = $compile('<range-panel observer="observer" dictionary="dictionary"></range-panel>')(scope);
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
        scope.observer.emit('durationPanelSpec', TimeResolution.timeResolutionFromLocal({ label: 'Last 24 Hours', duration: { unit: 'day', value: 1 }}));
        expect(element.isolateScope().internalRange).toBeDefined();
    });

    // TODO: write this test
    it('Can select a different range', function () {

    });

    // TODO: write this test
    it('Can select a different unit', function () {

    });
});

