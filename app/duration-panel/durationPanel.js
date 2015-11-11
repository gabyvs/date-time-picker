import template from './durationPanel.html';

function durationPanel(pickerService) {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            dictionary: '='
        },
        template: template,
        link: function (scope) {
            var h = [];
            var d = [];

            if (_.find(scope.dictionary, { label: 'Last 10 Minutes'})) {
                h.push({ value: -10, unit: 'minute', label: 'Ten minutes ago' });
                d.push({ value: 10, unit: 'minutes', label: '10 minutes' });
            }

            if (_.find(scope.dictionary, { label: 'Last Hour'})) {
                h.push({ value: -1, unit: 'hour', label: 'An hour ago' });
            }

            scope.hours = h.concat(pickerService.hours);
            scope.durations = d.concat(pickerService.durations);
        }
    }
}

export default durationPanel;
