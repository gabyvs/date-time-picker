import angular from 'angular';

function dtPicker() {
    return {
        restrict: 'E',
        scope: {
            name: '='
        },
        template: '<h1>Hello World</div>'
    }
}

export default angular.module('dt-picker', [])
    .directive('dt-picker', dtPicker)
    .name;
