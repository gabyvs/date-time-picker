'use strict';

import angular from 'angular';

import dtPicker from './dateTimePicker';
import singleCalendar from './single-calendar/singleCalendar';
import doubleCalendar from './double-calendar/doubleCalendar';
import durationPanel from './duration-panel/durationPanel';
import pickerService from './pickerService';
import bootstrapService from './custom-bootstrap/bootstrapService';

export default angular
    .module( 'dt-picker', [])
    .service('pickerService', pickerService)
    .service('bootstrapService', bootstrapService)
    .directive('singleCalendar', ['$timeout', singleCalendar])
    .directive('doubleCalendar', ['pickerService', doubleCalendar])
    .directive('durationPanel', ['pickerService', durationPanel])
    .directive('dtPicker', ['pickerService', 'bootstrapService', dtPicker])
    .name;
