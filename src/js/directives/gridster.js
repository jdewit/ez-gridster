/**
 * @name gridsterDirective
 */
app.directive('gridster', ['$window', '$timeout', function($window, $timeout) {
  return {
    restrict: 'EA',
    controller: 'GridsterCtrl',
    scope: {
      items: '=',
      config: '=?gridster',
      api: '=?'
    },
    templateUrl: 'ez-gridster-tpl.html',
    replace: true,
    transclude: true,
    link: function(scope, $element, attrs, controller) {
      var windowResizeThrottle = null;

      // expose gridster methods to parent scope
      scope.api = {
        redraw: function() {
          controller.redraw();
        },
        getNextPosition: function(sizeX, sizeY) {
          return controller.getNextPosition(sizeX, sizeY);
        },
        getOption: function(key) {
          return scope.options[key];
        },
        setOption: function(key, val) {
          scope.options[key] = val;
        }
      };

      var resizeCallback = function() {
        console.log('rezzz');
        controller.resolveOptions();
        windowResizeThrottle = null;
      };

      // resolve gridster options if the window is resized
      function onWindowResize(e) {
        if (e.target !== $window) {
          return;
        }

        if (!!windowResizeThrottle) {
          $timeout.cancel(windowResizeThrottle);
        }

        windowResizeThrottle = $timeout(resizeCallback, 200);
      }

      angular.element($window).bind('resize', onWindowResize);

      scope.$on('$destroy', function() {
        angular.element($window).unbind('resize', onWindowResize);
      });

      controller.init($element);
    }
  };
}]);
