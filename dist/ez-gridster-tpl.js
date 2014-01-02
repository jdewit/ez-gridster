angular.module('ez.gridster').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('ez-gridster-tpl.html',
    "<div class=\"box-header\">\n" +
    "  <a class=\"pull-right\" title=\"Remove widget\" ng-click=\"removeWidget($index)\"><i class=\"icon-remove\"></i></a>\n" +
    "  <h3>{{ widget.name }}</h3>\n" +
    "</div>\n" +
    "<div class=\"box-content\">\n" +
    "  {{ widget.name }}\n" +
    "</div>\n"
  );

}]);
