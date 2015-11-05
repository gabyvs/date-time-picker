'use strict';

import angular from 'angular';

import dtPicker from './dtPicker';
import pickerService from './pickerService';
import bootstrapService from './bootstrapService';

export default angular
    .module( 'dt-picker', [])
    .service('pickerService', pickerService)
    .service('bootstrapService', bootstrapService)
    .directive('dtPicker', ['pickerService', 'bootstrapService', dtPicker])
    .name;
