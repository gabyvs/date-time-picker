import dtPickerMain from '../main';
import moment from 'moment';

describe('Time Picker', function () {
    var element, $compile, scope, now, updatedValue;
    function compileDirective() {
        updatedValue = undefined;
        now = new Date();
        scope.time = now;
        scope.update = function (value) {
            updatedValue = value;
        };
        element = $compile('<time-picker time="time" update="update(value)"></time-picker>')(scope);
        scope.$digest();
    }

    beforeEach(angular.mock.module(dtPickerMain));

    beforeEach(angular.mock.inject([
        '$rootScope',
        '$compile',
        function ($rootScope, _$compile_) {
            scope = $rootScope.$new();
            $compile = _$compile_;
            compileDirective();
        }
    ]));

    it('Loads directive', function () {
        expect(element.isolateScope().hours).toBe(moment(now).format('HH'));
        expect(element.isolateScope().minutes).toBe(moment(now).format('mm'));
    });

    it('Increments hours', function () {
        element.isolateScope().incrementHours();
        expect(element.isolateScope().hours).toBe(moment(now).add(1, 'hours').format('HH'));
        expect(updatedValue).toBeDefined();
    });

    it('Decrements hours', function () {
        element.isolateScope().decrementHours();
        expect(element.isolateScope().hours).toBe(moment(now).subtract(1, 'hours').format('HH'));
        expect(updatedValue).toBeDefined();
    });

    it('Increments minutes', function () {
        element.isolateScope().incrementMinutes();
        expect(element.isolateScope().minutes).toBe(moment(now).add(5, 'minutes').format('mm'));
        expect(updatedValue).toBeDefined();
    });

    it('Decrements minutes', function () {
        element.isolateScope().decrementMinutes();
        expect(element.isolateScope().minutes).toBe(moment(now).subtract(5, 'minutes').format('mm'));
        expect(updatedValue).toBeDefined();
    });

    it('Changes hours', function () {
        element.isolateScope().hours = 'invalid value';
        element.isolateScope().changeHours();
        expect(updatedValue).toBeUndefined();
        expect(element.isolateScope().invalidHours).toBe(true);
        element.isolateScope().hours = 23;
        element.isolateScope().changeHours();
        expect(updatedValue).toBeDefined();
        expect(element.isolateScope().invalidHours).toBe(false);
        element.isolateScope().hours = 26;
        element.isolateScope().changeHours();
        expect(element.isolateScope().invalidHours).toBe(true);
    });

    it('Changes minutes', function () {
        element.isolateScope().minutes = 'invalid value';
        element.isolateScope().changeMinutes();
        expect(updatedValue).toBeUndefined();
        expect(element.isolateScope().invalidMinutes).toBe(true);
        element.isolateScope().minutes = 16;
        element.isolateScope().changeMinutes();
        expect(updatedValue).toBeDefined();
        expect(element.isolateScope().invalidMinutes).toBe(false);
        element.isolateScope().minutes = 61;
        element.isolateScope().changeMinutes();
        expect(element.isolateScope().invalidMinutes).toBe(true);
    });
});