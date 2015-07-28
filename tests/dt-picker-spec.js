define([
    'angular',
    'angularMocks',
    'partials',
    'jQuery',
    'datepick',
    'base/src/date-time-picker'
], function (angular, mocks) {
    describe('toolbarDirectives', function () {
        var scope, $compile, $rootScope, service, element;

        function compileDirective() {
            element = $compile('<dt-picker range="range" options="options" range-dictionary="rangeDictionary"></dt-picker>')(scope);
            $rootScope.$digest();
        }


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
                compileDirective();
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

        it('Loads default configuration', function () {
            expect(element.isolateScope().dictionary).toBeDefined();
            expect(element.isolateScope().internalRangeObject).toBeDefined();
            expect(element.isolateScope().threeLetterTimezoneLabel).toBeDefined();
            expect(element.isolateScope().internalRangeObject.selectedRange).toBeDefined();
            expect(element.isolateScope().internalRangeObject.selectedRange.label).toBe('Last 24 Hours');
            expect(element.isolateScope().internalRangeObject.timeUnit).toBe('hour');
            expect(element.isolateScope().savedRange).toBeDefined();
            expect(element.isolateScope().range).toBeDefined();
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

        it('Saves selection to controller scope', function () {
            element.isolateScope().selectRangeOption(element.isolateScope().dictionary[2]);
            $rootScope.$digest();
            element.isolateScope().save();
            $rootScope.$digest();
            expect(element.isolateScope().configuring).toBe(false);
            expect(element.find('.date-time-configure').hasClass('ng-hide')).toBe(true);
            expect(new moment(scope.range.to).diff(scope.range.from, 'days')).toBe(7);
        });

        it('Selects available ranges', function () {
            var selectedDates;
            // By default it selects last 24 hours
            expect(element.find('.date-range-selection').hasClass('ng-hide')).toBe(true);
            expect(element.find('.time-range-selection').hasClass('ng-hide')).toBe(false);
            expect(element.isolateScope().internalRangeObject.selectedRange.label).toBe('Last 24 Hours');
            expect(element.isolateScope().internalRangeObject.timeUnit).toBe('hour');
            expect(element.isolateScope().selectedDuration.value).toBe(24);
            expect(element.isolateScope().selectedFrom.value).toBeDefined();
            expect(angular.element(element.find(".to-value")[0]).html()).toBe(element.isolateScope().selectedFrom.label);
            selectedDates = $(element.find('.single-calendar-container')).datepick('getDate');
            expect(selectedDates[0]).toBeDefined();
            // Selecting last hour
            element.isolateScope().selectRangeOption(element.isolateScope().dictionary[0]);
            $rootScope.$digest();
            expect(element.find('.date-range-selection').hasClass('ng-hide')).toBe(true);
            expect(element.find('.time-range-selection').hasClass('ng-hide')).toBe(false);
            expect(element.isolateScope().internalRangeObject.selectedRange.label).toBe('Last Hour');
            expect(element.isolateScope().internalRangeObject.timeUnit).toBe('minute');
            expect(element.isolateScope().selectedDuration.value).toBe(1);
            expect(element.isolateScope().selectedFrom.value).toBeDefined();
            expect(angular.element(element.find(".to-value")[0]).html()).not.toBe('');
            selectedDates = $(element.find('.single-calendar-container')).datepick('getDate');
            expect(selectedDates[0]).toBeDefined();
            // selecting last 7 days
            element.isolateScope().selectRangeOption(element.isolateScope().dictionary[2]);
            $rootScope.$digest();
            expect(element.find('.date-range-selection').hasClass('ng-hide')).toBe(false);
            expect(element.find('.time-range-selection').hasClass('ng-hide')).toBe(true);
            expect(element.isolateScope().internalRangeObject.selectedRange.label).toBe('Last 7 Days');
            expect(element.isolateScope().internalRangeObject.timeUnit).toBe('hour');
            expect(element.isolateScope().internalRangeObject.selectedRange.timeUnits.length).toBe(2);
            selectedDates = $(element.find('.double-calendar-container')).datepick('getDate');
            expect(selectedDates[0]).toBeDefined();
            expect(selectedDates[1]).toBeDefined();
            // selecting time range
            element.isolateScope().selectRangeOption(element.isolateScope().dictionary[4]);
            $rootScope.$digest();
            expect(element.find('.date-range-selection').hasClass('ng-hide')).toBe(true);
            expect(element.find('.time-range-selection').hasClass('ng-hide')).toBe(false);
            expect(element.isolateScope().internalRangeObject.selectedRange.label).toBe('Time Range');
            expect(element.isolateScope().internalRangeObject.timeUnit).toBe('hour');
            expect(element.isolateScope().selectedDuration.value).toBe(24);
            expect(element.isolateScope().selectedFrom.value).toBeDefined();
            expect(angular.element(element.find(".to-value")[0]).html()).toBe(element.isolateScope().selectedFrom.label);
            selectedDates = $(element.find('.single-calendar-container')).datepick('getDate');
            expect(selectedDates[0]).toBeDefined();
            expect(selectedDates[0].getDate()).toBe(new moment().subtract(7, 'day').date());
            // selecting date range
            element.isolateScope().selectRangeOption(element.isolateScope().dictionary[3]);
            $rootScope.$digest();
            expect(element.find('.date-range-selection').hasClass('ng-hide')).toBe(false);
            expect(element.find('.time-range-selection').hasClass('ng-hide')).toBe(true);
            expect(element.isolateScope().internalRangeObject.selectedRange.label).toBe('Date Range');
            expect(element.isolateScope().internalRangeObject.timeUnit).toBe('hour');
            selectedDates = $(element.find('.double-calendar-container')).datepick('getDate');
            expect(selectedDates[0]).toBeDefined();
            expect(selectedDates[1]).toBeDefined();
        });

        it('Selects a single date', function () {
            element.isolateScope().selectRangeOption(element.isolateScope().dictionary[4]);
            $rootScope.$digest();
            expect(element.isolateScope().internalRangeObject.selectedRange.label).toBe('Time Range');
            var firstDayOfMonth = new Date(new moment().date(1).valueOf());
            element.isolateScope().singleDateSelected([firstDayOfMonth]);
            expect(element.isolateScope().internalRangeObject.timeUnit).toBe('hour');
            expect(element.isolateScope().selectedDuration.value).toBe(24);
            expect(element.isolateScope().selectedFrom.value).toBeDefined();
            expect(angular.element(element.find(".to-value")[0]).html()).toBe(element.isolateScope().selectedFrom.label);
            var selectedDates = $(element.find('.single-calendar-container')).datepick('getDate');
            expect(selectedDates[0]).toBeDefined();
        });

        it('Selects a different starting hour', function () {
            element.isolateScope().selectFrom({ value: 0, label: '0:00' });
            $rootScope.$digest();
            expect(element.isolateScope().internalRangeObject.selectedRange.label).toBe('Time Range');
            expect(element.isolateScope().selectedDuration.value).toBe(24);
            expect(element.isolateScope().selectedFrom.value).toBeDefined();
            expect(angular.element(element.find(".to-value")[0]).html()).toBe('0:00');
            expect(new moment(element.isolateScope().internalRangeObject.from).hour()).toBe(0);
        });
        it('Selects a different duration', function () {
            element.isolateScope().selectDuration({ value: 2, label: '2 hours', unit: 'hours' });
            $rootScope.$digest();
            expect(element.isolateScope().internalRangeObject.selectedRange.label).toBe('Time Range');
            expect(element.isolateScope().selectedDuration.value).toBe(2);
            expect(element.isolateScope().internalRangeObject.timeUnit).toBe('minute');
            expect(element.isolateScope().selectedFrom.value).toBeDefined();
            expect(angular.element(element.find(".to-value")[0]).html()).not.toBe('');
            var from = new moment(element.isolateScope().internalRangeObject.from);
            var to = new moment(element.isolateScope().internalRangeObject.to);
            expect(to.diff(from, 'hours')).toBe(2);
        });
        // There is a problem with the range picker because of the fact that the min and max dates need to be adjusted with every click
        // Because of that, the first date selected by the user sends to the picker only this date [date1, date1]
        // and the second time only the second date selected [date2, date2]
        // When the min and max date are not adjusted, it is send as [date1, date2] instead.
        // This test makes sure that a range is selected even with that problem.
       it('Selects a date range from calendar', function () {
            element.isolateScope().selectRangeOption(element.isolateScope().dictionary[2]);
            $rootScope.$digest();
            var firstDayOfLastMonth = new Date(moment().subtract(1, 'month').date(1).valueOf());
            var fifthDayOfLastMonth = new Date(moment(firstDayOfLastMonth).add(4, 'day').valueOf());
            element.isolateScope().dateRangeSelected([firstDayOfLastMonth, firstDayOfLastMonth]);
            $rootScope.$digest();
            expect(element.isolateScope().internalRangeObject.selectedRange.label).toBe('Date Range');
            expect(element.isolateScope().internalRangeObject.timeUnit).toBe('hour');
            var from = new moment(element.isolateScope().internalRangeObject.from);
            var to = new moment(element.isolateScope().internalRangeObject.to);
            expect(to.diff(from, 'days')).toBe(0);
            element.isolateScope().dateRangeSelected([fifthDayOfLastMonth, fifthDayOfLastMonth]);
            $rootScope.$digest();
            expect(element.isolateScope().internalRangeObject.selectedRange.label).toBe('Date Range');
            expect(element.isolateScope().internalRangeObject.timeUnit).toBe('hour');
            var from = new moment(element.isolateScope().internalRangeObject.from);
            var to = new moment(element.isolateScope().internalRangeObject.to);
            expect(to.diff(from, 'days')).toBe(4);
        });

        it('Can refresh page', function () {
            expect(element.isolateScope().internalRangeObject.selectedRange.label).toBe('Last 24 Hours');
            expect(element.isolateScope().internalRangeObject.selectedRange.duration.unit).toBe('day');
            expect(element.isolateScope().internalRangeObject.selectedRange.duration.value).toBe(1);
            expect(element.isolateScope().savedRange.duration.unit).toBe('day');
            expect(element.isolateScope().savedRange.duration.value).toBe(1);
            element.isolateScope().configure();
            element.isolateScope().selectRangeOption(element.isolateScope().dictionary[2]);
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

        it('Hides custom date range', function () {
            scope.options = { hideCustom: true };
            compileDirective();
            expect(_.find(element.isolateScope().dictionary, { custom: 'date'})).toBeUndefined();
        });

        it('Selects last 10 minutes', function () {
            scope.rangeDictionary = [
                { label: 'Last 10 Minutes', duration: { unit: 'minutes', value: 10 }},
                { label: 'Last Hour', duration: { unit: 'hour', value: 1 }},
                { label: 'Last 24 Hours', duration: { unit: 'day', value: 1 }, preselected: true},
                { label: 'Last 7 Days', duration: { unit: 'week', value: 1 }},
                { label: 'Date Range', custom: 'date' },
                { label: 'Time Range', custom: 'time' }
            ];
            compileDirective();
            // selection last 10 minutes
            element.isolateScope().selectRangeOption(element.isolateScope().dictionary[0]);
            $rootScope.$digest();
            expect(element.find('.date-range-selection').hasClass('ng-hide')).toBe(true);
            expect(element.find('.time-range-selection').hasClass('ng-hide')).toBe(false);
            expect(element.isolateScope().internalRangeObject.selectedRange.label).toBe('Last 10 Minutes');
            expect(element.isolateScope().internalRangeObject.timeUnit).toBe('minute');
            expect(element.isolateScope().selectedDuration.value).toBe(10);
            expect(element.isolateScope().selectedFrom.value).toBeDefined();
            expect(angular.element(element.find(".to-value")[0]).html()).not.toBe('');
            var selectedDates = $(element.find('.single-calendar-container')).datepick('getDate');
            expect(selectedDates[0]).toBeDefined();
            expect(selectedDates[0].getDate()).toBe(new moment().subtract(10, 'minutes').date());
        });

        it('Honors time unit for refreshing', function () {
            element.isolateScope().configure();
            element.isolateScope().selectRangeOption(element.isolateScope().dictionary[2]);
            $rootScope.$digest();
            expect(element.isolateScope().internalRangeObject.timeUnit).toBe('hour');
            element.isolateScope().internalRangeObject.timeUnit = 'day';
            $rootScope.$digest();
            element.isolateScope().save();
            $rootScope.$digest();
            element.isolateScope().refresh();
            $rootScope.$digest();
            expect(element.isolateScope().internalRangeObject.timeUnit).toBe('day');
        });
    });
});
