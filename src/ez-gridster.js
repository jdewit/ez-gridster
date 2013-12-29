'use strict';

var gridster;

angular.module('ez.gridster', [])

.constant('gridsterConfig', {
  widget_base_dimensions: [400, 300],
  widget_margins: [5, 5],
  widget_selector: 'li',
  helper: 'clone',
  draggable: {},
  resize: {
    enabled: true
  }
})

.directive('widget', ['$timeout', function($timeout) {
  return {
    restrict: 'AE',
    templateUrl: 'ez-gridster-tpl.html',
    link: function(scope, $element) {
      gridster.add_widget($element);
    }
  };
}])

.directive('gridster', ['$timeout', 'gridsterConfig', function ($timeout, gridsterConfig) {
  return {
    restrict: 'AE',
    scope: {
      widgets: '=widgets'
    },
    template: '<ul><li class="gs-w box" widget ng-repeat="widget in widgets" data-col="{{ widget.col }}" data-row="{{ widget.row }}" data-sizex="{{ widget.sizex }}" data-sizey="{{ widget.sizey }}"></li></ul>',
    link: function (scope, $element, $attributes) {
      var options = angular.extend(gridsterConfig, scope.$eval($attributes.gridsterOptions));

      gridster = $element.find('ul').gridster(options).data('gridster');

      scope.removeWidget = function(widget, index) {
        gridster.remove_widget($element.find('li').eq(index), true, function() {
          scope.widgets.splice(index, 1);

          scope.$emit('ez-gridster.widget_removed', widget);
          scope.$digest();
        });
      };

      scope.$on('ez-gridster.add_widget', function(e, widget) {
        var size_x = widget.size_x || 1,
            size_y = widget.size_y || 1;

        widget = angular.extend(widget, gridster.next_position(size_x, size_y));

        scope.widgets.push(widget);
      });
    }
  };

}]);

