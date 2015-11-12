'use strict';

import angular from 'angular';

import dtPicker from './dateTimePicker';
import singleCalendar from './single-calendar/singleCalendar';
import doubleCalendar from './double-calendar/doubleCalendar';
import durationPanel from './duration-panel/durationPanel';
import rangePanel from './range-panel/rangePanel';
import pickerService from './pickerService';
import bootstrapService from './custom-bootstrap/bootstrapService';

export default angular
    .module( 'dt-picker', [])
    .service('pickerService', pickerService)
    .service('bootstrapService', bootstrapService)
    .directive('singleCalendar', ['$timeout', singleCalendar])
    .directive('doubleCalendar', ['$timeout', doubleCalendar])
    .directive('durationPanel', ['$timeout', 'pickerService', durationPanel])
    .directive('rangePanel', ['$timeout', rangePanel])
    .directive('dtPicker', ['$timeout', 'pickerService', 'bootstrapService', dtPicker])
    .name;
