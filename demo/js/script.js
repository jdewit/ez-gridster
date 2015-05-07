angular.module('app', ['ui.bootstrap', 'ez.gridster'])

.controller('DashboardCtrl', [
	'$scope', '$timeout',
	function($scope, $timeout) {

		$scope.$on('gridster.loaded', function() {
			console.log('gridster loaded');
		});

		$scope.$on('gridster.changed', function() {
			console.log('gridster changed');
		});

		$scope.gridsterOptions = {
			trackByProperty: 'name',
		};

		$scope.dashboards = DASHBOARDS;

		$scope.gridster = {};

		$scope.clear = function() {
			$scope.dashboard.widgets = [];
		};

		$scope.addWidget = function() {
			var minX = $scope.gridster.getOption('minX');
			var minY = $scope.gridster.getOption('minY');

			var nextPosition = $scope.gridster.getNextPosition(minX, minY);

			console.log('next position => ', nextPosition);

			var newItem = {
				name: "New Widget" + Math.floor(Math.random() * 100001),
				sizeX: nextPosition.sizeX,
				sizeY: nextPosition.sizeY,
				row: nextPosition.row,
				col: nextPosition.col
			};

			console.log('save item to server', newItem);

			$scope.dashboard.widgets.push(newItem);
		};

		$scope.$on('remove_widget', function(e, widget) {
			$scope.dashboard.widgets.splice($scope.dashboard.widgets.indexOf(widget), 1);
		});

		$scope.dashboard = $scope.dashboards[0];
	}
])

.controller('CustomWidgetCtrl', ['$scope', '$modal', '$timeout', '$sce',
	function($scope, $modal, $timeout, $sce) {

		$scope.remove = function() {
			$scope.$emit('remove_widget', $scope.item);
		};

		if ($scope.item.src) {
			$scope.style = {
				'background-image': 'url("' + $scope.item.src +'")'
			};

			$scope.src = $sce.trustAsResourceUrl($scope.item.src);
		}

		$scope.widgetSet = function(e) {
			var frames = e.element.find('iframe');
			if (frames.length) {
				frames[0].style.height = (e.element.height() - 2) + 'px';
			}

		};

		$scope.openSettings = function() {
			$modal.open({
				scope: $scope,
				templateUrl: 'demo/views/widget_settings.html',
				controller: 'WidgetSettingsCtrl',
				resolve: {
					widget: function() {
						return $scope.item;
					}
				}
			});
		};

	}
])

.controller('WidgetSettingsCtrl', ['$scope', '$timeout', '$rootScope', '$modalInstance', 'widget',
	function($scope, $timeout, $rootScope, $modalInstance, widget) {
		$scope.widget = widget;

		$scope.form = {
			name: widget.name,
			sizeX: widget.sizeX,
			sizeY: widget.sizeY,
			col: widget.col,
			row: widget.row
		};

		$scope.sizeOptions = [{
			id: '1',
			name: '1'
		}, {
			id: '2',
			name: '2'
		}, {
			id: '3',
			name: '3'
		}, {
			id: '4',
			name: '4'
		}];

		$scope.dismiss = function() {
			$modalInstance.dismiss();
		};

		$scope.remove = function() {
			$scope.dashboard.widgets.splice($scope.dashboard.widgets.indexOf(widget), 1);
			$modalInstance.close();
		};

		$scope.submit = function() {
			angular.extend(widget, $scope.form);

			$modalInstance.close(widget)
		};

	}
])

// helper code
.filter('object2Array', function() {
	return function(input) {
		var out = [];
		for (i in input) {
			out.push(input[i]);
		}
		return out;
	}
});
