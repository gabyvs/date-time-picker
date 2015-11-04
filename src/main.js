import angular from 'angular';

import dtPicker from './dtPicker';
import service from './service';

export default angular
    .module( 'dt-picker', [])
    .service('pickerService', service)
    .directive('dtPicker', ['pickerService', dtPicker])
    .name;
