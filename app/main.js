'use strict';

import angular from 'angular';

import dtPicker from './dateTimePicker';
import { timePicker, hours, minutes } from './time-picker/timePicker';
import singleCalendar from './single-calendar/singleCalendar';
import doubleCalendar from './double-calendar/doubleCalendar';
import durationPanel from './duration-panel/durationPanel';
import rangePanel from './range-panel/rangePanel';
import absolutePanel from './absolute-panel/absolutePanel';
import pickerService from './pickerService';
import bootstrapService from './custom-bootstrap/bootstrapService';

export default angular
    .module( 'dt-picker', [])
    .service('pickerService', pickerService)
    .service('bootstrapService', bootstrapService)
    .directive('hours', hours)
    .directive('timePicker', timePicker)
    .directive('singleCalendar', ['$timeout', singleCalendar])
    .directive('doubleCalendar', ['$timeout', doubleCalendar])
    .directive('durationPanel', ['$timeout', 'pickerService', durationPanel])
    .directive('rangePanel', ['$timeout', rangePanel])
    .directive('absolutePanel', ['$timeout', absolutePanel])
    .directive('dtPicker', ['$timeout', 'pickerService', 'bootstrapService', dtPicker])
    .name;
