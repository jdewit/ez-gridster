'use strict';

/**
 * ezGridster
 *
 * @author Joris de Wit
 */
angular.module('ez.gridster', [])

  .constant('EzGridsterConfig', {
    widget_template: 'ez-gridster-widget.html',
    resize: {
      enabled: true,
    }
  })

  /**
   * A factory that extends the gridster object
   */
  .factory('GridsterWrapper', ['$compile', '$timeout', '$templateCache', function($compile, $timeout, $templateCache) {

    /**
     * @params {object} gridster The gridster object
     * @params {object} scope    The scope of the grid
     * @params {object} options  Gridsters options
     */
    return function(gridster, scope, options) {

      scope.$on('$destroy', function() {
        gridster.destroy();
      });

      /**
       * This function returns a bound widget template
       *
       * @method getWidgetTemplate
       * @params {object} widget The widget object
       * @returns {string} The widgets html contents
       */
      gridster.getWidgetTemplate = function(widget) {
        if (!this.widgetTemplate) {
          this.widgetTemplate = $templateCache.get(options.widget_template);
        }

        var widgetScope = scope.$new();

        widgetScope.widget = widget;
        widgetScope.gridster = gridster;

        return $compile(angular.element(this.widgetTemplate).get(0))(widgetScope);
      };

      /**
       * This function sets an array of gridster widgets
       *
       * @params {Array} widgets Array of widgets
       * @params {object} mergeObject An optional object to extend into each widget
       */
      gridster.setWidgets = function(widgets, mergeObject) {
        this.remove_all_widgets();

        var self = this;
        angular.forEach(widgets, function(widget) {
          if (mergeObject) {
            angular.extend(widget, mergeObject);
          }

          self.addWidget(widget);
        });
      };

      /**
       * This function adds a widget to the grid
       *
       * @params {object} widget A widget object
       * @return {HTMLElement} Returns the jQuery wrapped HTMLElement representing.
       * the widget that was just created.
       */
      gridster.addWidget = function(widget) {
        return this.add_widget(this.getWidgetTemplate(widget), widget.size_x, widget.size_y, widget.col, widget.row);
      };

      return gridster;

    };
  }])

  /**
   * Instantiate gridster and bind it to the scope so it can be managed by a controller
   */
  .directive('ezGridster', ['EzGridsterConfig', 'GridsterWrapper', function(EzGridsterConfig, GridsterWrapper) {
    return {
      restrict: 'A',
      scope: {
        ezGridster: '=',
        ezGridsterConfig: '=?'
      },
      compile: function(element) {
        element.addClass('gridster').append('<ul></ul>');

        return function (scope, element) {
          var options = angular.extend({}, EzGridsterConfig, scope.ezGridsterConfig);

          scope.ezGridster = new GridsterWrapper(element.find('ul').gridster(options).data('gridster'), scope, options);
        };
      }
    };
  }])

;

