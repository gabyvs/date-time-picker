'use strict';

import angular from 'angular';

import dtPicker from './dateTimePicker';
import { timePicker, hours, minutes } from './time-picker/timePicker';
import doubleCalendar from './double-calendar/doubleCalendar';
import rangePanel from './range-panel/rangePanel';
import absolutePanel from './absolute-panel/absolutePanel';
import pickerService from './pickerService';
import bootstrapService from './custom-bootstrap/bootstrapService';

export default angular
    .module( 'dt-picker', [])
    .service('pickerService', pickerService)
    .service('bootstrapService', bootstrapService)
    .directive('minutes', minutes)
    .directive('hours', hours)
    .directive('timePicker', timePicker)
    .directive('doubleCalendar', ['$timeout', doubleCalendar])
    .directive('rangePanel', ['$timeout', 'pickerService', rangePanel])
    .directive('absolutePanel', ['$timeout', absolutePanel])
    .directive('dtPicker', ['$timeout', 'pickerService', 'bootstrapService', dtPicker])
    .name;
