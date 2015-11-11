import moment from 'moment';

import dtPickerMain from './main';

xdescribe('Picker Service', function () {
    var scope, $compile, $rootScope, service;

    beforeEach(angular.mock.module(dtPickerMain));

    beforeEach(angular.mock.inject([
        '$rootScope',
        '$compile',
        'pickerService',
        function (_$rootScope_, _$compile_, _service_) {
            $compile = _$compile_;
            scope = _$rootScope_.$new();
            $rootScope = _$rootScope_;
            service = _service_;
        }
    ]));

    it('Loading service.', function () {
        expect(service.hours).toBeDefined();
        expect(service.durations).toBeDefined();
        expect(service.defaultDictionary).toBeDefined();
    });
});

