import moment from 'moment';

import dtPickerMain from './main';

describe('Picker Service', function () {
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
        expect(service.browserTimezone).toBeDefined();
    });

    it('Detects time ranges', function () {
        expect(service.isTimeRange({ label: 'Last Hour', duration: { unit: 'hour', value: 1 }})).toBe(true);
        expect(service.isTimeRange({ label: 'Last 24 Hours', duration: { unit: 'day', value: 1 }})).toBe(true);
        expect(service.isTimeRange({ label: 'Yesterday', duration: { unit: 'day', value: 1, offset: 1 } })).toBe(true);
        expect(service.isTimeRange({ label: 'Last 7 Days', duration: { unit: 'week', value: 1 }})).toBe(false);
    });
});

