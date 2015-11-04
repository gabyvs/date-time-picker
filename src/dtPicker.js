import angular from 'angular';
import template from './dtPicker.html'

function dtPicker() {
    return {
        restrict: 'E',
        scope: {
            name: '='
        },
        template: template
    }
}

export default dtPicker;
