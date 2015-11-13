import template from './rangePanel.html';

function rangePanel($timeout) {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            observer: '=',
            dictionary: '=',
            hideTimeUnit: '='
        },
        template: template,
        link: function (scope) {
            /**
             * Executes when a range is selected and emitted by any of the other components
             * @param range
             */
            function onRangeSet(range) {
                scope.internalRange = range;
            }

            $timeout(function () {
                scope.observer.subscribe('rangePanel', onRangeSet);
            });

            // TODO: implement this
            scope.selectRangeOption = function (range) {

            };

            // TODO: implement this
            scope.selectTimeUnit = function (unit) {

            };
        }
    }
}

export default rangePanel;