define([
    'angular',
    'angularMocks',
    'partials',
    'base/src/dt-picker'
], function (angular, mocks) {
    describe('toolbarDirectives', function () {
        var scope, $compile, $rootScope, service;

        beforeEach(mocks.module('dt-picker', 'partials'));

        beforeEach(inject(([
            '$rootScope',
            '$compile',
            'dtPicker.service',
            function (_$rootScope_, _$compile_, _service_) {
                $compile = _$compile_;
                scope = _$rootScope_.$new();
                $rootScope = _$rootScope_;
                service = _service_;
            }
        ])));

        it('Loading directive.', function () {

            var element = $compile('<dt-picker range="range" options="options" range-dictionary="rangeDictionary"></dt-picker>')(scope);
            scope.$digest();
            expect(element.isolateScope()).toBeDefined();
        });

        it('Loading service.', function () {

            expect(service.version).toBeDefined();
        });
    });
});
