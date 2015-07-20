define([
    'angular',
    'angularMocks',
    'base/src/dt-picker'
], function (angular, mocks, availability) {
    describe('toolbarDirectives', function () {
        var scope, $compile, $rootScope, service;

        beforeEach(mocks.module('dt-picker'));

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

            var element = $compile('<dt-picker></dt-picker>')(scope);
            scope.$digest();
            expect(element.isolateScope()).toBeDefined();
        });

        it('Loading service.', function () {

            expect(service.version).toBeDefined();
        });
    });
});
