'use strict';

import angular from 'angular';

import dtPicker from './dtPicker';
import singleCalendar from './single-calendar';
import doubleCalendar from './double-calendar';
import pickerService from './pickerService';
import bootstrapService from './custom-bootstrap/bootstrapService';

export default angular
    .module( 'dt-picker', [])
    .service('pickerService', pickerService)
    .service('bootstrapService', bootstrapService)
    .directive('singleCalendar', ['pickerService', singleCalendar])
    .directive('doubleCalendar', ['pickerService', doubleCalendar])
    .directive('dtPicker', ['pickerService', 'bootstrapService', dtPicker])
    .name;
