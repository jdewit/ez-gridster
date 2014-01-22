'use strict';

angular.module('ez.gridster', [])

.constant('ezGridsterConfig', {
  widget_base_dimensions: [400, 300],
  widget_margins: [5, 5],
  widget_selector: 'li',
  helper: 'clone',
  draggable: {},
  remove: {
    silent: false
  },
  resize: {
    enabled: true
  }
})

.directive('ezGridsterWidget', ['$timeout', 'GridsterService', function($timeout, GridsterService) {
  return {
    restrict: 'AE',
    templateUrl: 'ez-gridster-tpl.html',
    link: function(scope, $element) {
      GridsterService.gridster.add_widget($element, scope.widget.size_x, scope.widget.size_y, scope.widget.col, scope.widget.row);
    }
  };
}])


.service('GridsterService', [function() {
  var self = this;

  this.widgets = [];

  this.gridster = null;

  this.init = function(gridster) {
    self.gridster = gridster;
  };

  this.clear = function() {
    self.gridster.remove_all_widgets();
  };

  this.getNextPosition = function(x, y) {
    return self.gridster.next_position(x, y);
  };

  this.getWidgets = function() {
    return self.widgets;
  };

  this.setWidgets = function(widgets) {
    self.widgets = widgets;
  };

  this.addWidget = function(widget) {
    self.widgets.push(widget);
  };

  this.removeWidget = function($widget, index, callback) {
    self.gridster.remove_widget($widget, true, function() {
      self.widgets.splice(index, 1);

      if (callback) {
        callback();
      }
    });
  };

  this.serialize = function() {
    return self.gridster.serialize();
  };

}])


.directive('ezGridster', ['ezGridsterConfig', 'GridsterService', function (ezGridsterConfig, GridsterService) {
  return {
    restrict: 'AE',
    replace: true,
    template: '<div><ul><li class="gs-w box" ez-gridster-widget ng-repeat="widget in widgets" data-col="{{ widget.col }}" data-row="{{ widget.row }}" data-sizex="{{ widget.size_x }}" data-sizey="{{ widget.size_y }}"></li></ul></div>',
    link: function (scope, $element, attrs) {
      scope.options = angular.extend(ezGridsterConfig, scope.$eval(attrs.config));

      scope.updateWidgets = function(e) { //  update each widgets new position info
        var data = GridsterService.serialize();

        angular.forEach(data, function(v, i) {
          scope.widgets[i] = angular.extend(scope.widgets[i], v);
        });

        scope.$emit('ez_gridster.widgets_updated', data);
        scope.$digest();
      };

      scope.options.draggable.stop = function(e) {
        scope.updateWidgets(e);

        scope.$emit('ez_gridster.widget_dragged');
      };

      scope.options.resize.stop = function(e, ui) {
        scope.updateWidgets(e);

        scope.$emit('ez_gridster.widget_resized');
      };

      GridsterService.init($element.addClass('gridster').find('ul').gridster(scope.options).data('gridster'));

      scope.widgets = [];

      scope.$watch(GridsterService.getWidgets, function(widgets) {
        GridsterService.clear();
        scope.widgets = widgets;
      });
    }
  };

}]);

