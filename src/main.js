import angular from 'angular';

import dtPicker from './dtPicker';

export default angular
    .module( 'dt-picker', [])
    .directive('dtPicker', dtPicker)
    .name;