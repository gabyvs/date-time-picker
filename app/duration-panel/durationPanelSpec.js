import dtPickerMain from '../main';
import RangeObserver from '../rangeObserver';
import TimeResolution from '../timeResolution';

describe('Duration Panel', function () {
    var scope, $compile, element, $timeout;

    function compileDirective() {
        scope.observer = new RangeObserver();
        element = $compile('<duration-panel observer="observer"></duration-panel>')(scope);
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

    // TODO: write this test
    it('Can select a different from', function () {

    });

    // TODO: write this test
    it('Can select a different duration', function () {

    });
});

