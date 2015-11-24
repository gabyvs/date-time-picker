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
        if (moment(now).hours() > 22) {
            expect(element.isolateScope().hours).toBe('00');
        } else {
            expect(element.isolateScope().hours).toBe(moment(now).add(1, 'hours').format('HH'));
        }
        expect(updatedValue).toBeDefined();
    });

    it('Decrements hours', function () {
        element.isolateScope().decrementHours();
        if (moment(now).hours() < 1) {
            expect(element.isolateScope().hours).toBe('23');
        } else {
            expect(element.isolateScope().hours).toBe(moment(now).subtract(1, 'hours').format('HH'));
        }
        expect(updatedValue).toBeDefined();
    });

    it('Increments minutes', function () {
        element.isolateScope().incrementMinutes();
        if (moment(now).minutes() > 54) {
            expect(element.isolateScope().minutes).toBe('00');
        } else {
            expect(element.isolateScope().minutes).toBe(moment(now).add(5, 'minutes').format('mm'));
        }
        expect(updatedValue).toBeDefined();
    });

    it('Decrements minutes', function () {
        element.isolateScope().decrementMinutes();
        if (moment(now).minutes() < 5) {
            expect(element.isolateScope().minutes).toBe('55');
        } else {
            expect(element.isolateScope().minutes).toBe(moment(now).subtract(5, 'minutes').format('mm'));
        }
        expect(updatedValue).toBeDefined();
    });
});