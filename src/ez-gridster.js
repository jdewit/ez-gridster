'use strict';

angular.module('ez.gridster', [])

  .constant('EzGridsterConfig', {
    widget_template: 'ez-gridster-widget.html',
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

  .service('GridsterService', ['$compile', '$timeout', '$templateCache', function($compile, $timeout, $templateCache) {
    var self = this;

    this.gridster = null;

    this.scope = null;

    this.options = {};

    this.getWidgetTemplate = function(widget) {
      if (!self.widgetTemplate) {
        self.widgetTemplate = $templateCache.get(self.options.widget_template);
      }

      var widgetScope = self.scope.$new();
      widgetScope.widget = widget;

      return $compile(angular.element(self.widgetTemplate).get(0))(widgetScope);
    };

    this.init = function(gridster, scope, options) {
      self.widgetTemplate = null;
      self.options = options;
      self.gridster = gridster;
      self.scope = scope;
    };

    this.clear = function() {
      console.log('clear');
      return self.gridster.remove_all_widgets();
    };

    this.setWidgets = function(widgets, resolve) {
      $timeout(function() {
        self.clear();
        angular.forEach(widgets, function(widget) {
          if (resolve) {
            angular.extend(widget, resolve);
          }

          self.gridster.add_widget(self.getWidgetTemplate(widget), widget.sizex, widget.sizey, widget.col, widget.row);
        });
      }, 100);
    };

    this.addWidget = function(widget) {
      return self.gridster.add_widget(self.getWidgetTemplate(widget), widget.sizex, widget.sizey, widget.col, widget.row);
    };

    this.removeWidget = function($widget, callback) {
      return self.gridster.remove_widget($widget, callback);
    };

    this.nextPosition = function(sizex, sizey) {
      return self.gridster.next_position(sizex, sizey);
    };

    this.generateStylesheet = function() {
      return self.gridster.generate_stylesheet();
    };
  }])

  .directive('ezGridster', ['EzGridsterConfig', 'GridsterService', function(EzGridsterConfig, GridsterService) {
    return {
      restrict: 'A',
      scope: {
        ezGridsterConfig: '=?'
      },
      compile: function(element) {
        element.addClass('gridster').append('<ul></ul>');

        return function (scope, element) {
          var options = angular.extend(EzGridsterConfig, scope.ezGridsterConfig);

          var gridster = element.find('ul').gridster(options).data('gridster');

          GridsterService.init(gridster, scope, options);
        };
      }
    };
  }])

;

