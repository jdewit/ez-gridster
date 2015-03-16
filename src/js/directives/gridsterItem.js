/**
 * @name gridsterItemDirective
 *
 * @param {object} $timeout
 */
app.directive('gridsterItem', ['$timeout', '$parse', function($timeout, $parse) {
	return {
		restrict: 'A',
		require: '^gridster',
		replace: true,
		scope: {
			item: '=gridsterItem'
		},
		link: function(scope, $element, attrs, gridster) {

			// helper function to set callbacks
			function getFn(name) {
				var attr = $itemEl.attr(name);

				if (!!attr) {
					var fn = $parse(itemScope[$itemEl.attr(name)]);

					if (typeof fn === 'function') {
						return fn;
					}
				}

			   	return angular.noop;
			}

			var element = $element[0],
				$itemEl = $element.children(0).children(0),
				itemScope = $itemEl.scope(),
				onDragStart = getFn('on-drag-start'),
				onDragMove = getFn('on-drag-move'),
				onDragEnd = getFn('on-drag-end'),
				onResizeStart = getFn('on-resize-start'),
				onResizeMove = getFn('on-resize-move'),
				onResizeEnd = getFn('on-resize-end'),
				onInit = getFn('on-init'),
				onUpdate = getFn('on-update'),
				dragInteract = null,
				action = 'drag',
				padding,
				row,
				col,
				sizeX,
				sizeY,
				top = 0,
				left = 0,
				width,
				height,
				minWidth,
				maxWidth,
				minHeight,
				maxHeight,
				columns;


			// Set interact on the item
			dragInteract = interact(element).draggable({
				manualStart: true,
				dynamicDrop: true,
				onstart: function(e) {
					gridster.addClass('gridster-moving');

					$element.addClass('gridster-item-moving');

					scope.item._moving = true;

					gridster.updateGridHeight(scope.item);

					gridster.resolveOptions();

					row = gridster.getRow(scope.item);
					col = gridster.getCol(scope.item);
					sizeX = gridster.getSizeX(scope.item);
					sizeY = gridster.getSizeY(scope.item);

					gridster.setElement(null, scope.item);

					if (action === 'drag') {

						if (!gridster.getOption('dragEnabled')) {
							return;
						}

						columns = gridster.getOption('columns');

						left = gridster.colToPixels(gridster.getCol(scope.item));
						top = gridster.rowToPixels(gridster.getRow(scope.item));


						onDragStart({
							event: e,
							item: scope.item,
							element: $element,
							position: {
								top: top,
								left: left
							}
						});

					} else {

						width = element.offsetWidth;
						height = element.offsetHeight;

						padding = gridster.getOption('padding');

						minWidth = (gridster.getOption('minSizeX') * gridster.getOption('curColWidth')) - (2 * padding[0]);
						maxWidth = (gridster.getOption('columns') - col) * gridster.getOption('curColWidth') - (2 * padding[0]);
						minHeight = (gridster.getOption('minSizeY') * gridster.getOption('curRowHeight')) - (2 * padding[1]);
						maxHeight = (gridster.getOption('maxRows') - row) * gridster.getOption('curColHeight') - (2 * padding[1]);

						onResizeStart({
							event: e,
							item: scope.item,
							element: $element,
							size: {
								width: width,
								height: height
							}
						});

					}
				},
				onmove: function(e) {
					if (action === 'drag') {

						left += e.dx;
						top += e.dy;

						if (!gridster.getOption('dragEnabled')) {
							return;
						}

						gridster.translateElementPosition(element, left, top);

						row = gridster.pixelsToRows(top);
						col = gridster.pixelsToColumns(left);

						if ((col + sizeX) >= columns) {
							col = columns - sizeX;
						}

						if (!gridster.hasItemPositionChanged(scope.item, row, col)) {
							return;
						}

						scope.item = gridster.setRow(scope.item, row);
						scope.item = gridster.setCol(scope.item, col);

						gridster.translateElementPosition(
							null,
							gridster.colToPixels(col),
							gridster.rowToPixels(row)
						);

						onDragMove({
							event: e,
							item: scope.item,
							element: $element,
							position: {
								top: top,
								left: left
							}
						});

					} else {

						width += e.dx;
						height += e.dy;

						if (width > maxWidth) {
							width = maxWidth;
						} else if (width < minWidth) {
							width = minWidth;
						}

						if (height > maxHeight) {
							height = maxHeight;
						} else if (height < minHeight) {
							height = minHeight;
						}

						element.style.width = width + 'px';
						element.style.height = height + 'px';

						sizeX = gridster.pixelsToColumns(width, true);
						sizeY = gridster.pixelsToRows(height, true);

						if (!gridster.hasItemWidthChanged(scope.item, sizeX) && !gridster.hasItemHeightChanged(scope.item, sizeY)) {
							return;
						}

						scope.item = gridster.setSizeX(scope.item, sizeX);
						scope.item = gridster.setSizeY(scope.item, sizeY);

						gridster.setElementWidth(null, sizeX);
						gridster.setElementHeight(null, sizeY);

						onResizeMove({
							event: e,
							item: scope.item,
							element: $element,
							size: {
								width: width,
								height: height
							}
						});
					}

					gridster.moveOverlappingItems(scope.item, true);
					gridster.updateGridHeight(scope.item);
				},
				onend: function(e) {
					delete scope.item._moving;

					gridster.removeClass('gridster-moving');
					$element.removeClass('gridster-item-moving');


					if (action === 'drag') {

						if (!gridster.getOption('dragEnabled')) {
							return;
						}

						gridster.translateElementPosition(element, gridster.colToPixels(col), gridster.rowToPixels(row));

						onDragEnd({
							event: e,
							item: scope.item,
							element: $element,
							position: {
								top: top,
								left: left
							}
						});

					} else {

						gridster.setElementWidth(element, gridster.getSizeX(scope.item));
						gridster.setElementHeight(element, gridster.getSizeY(scope.item));

						onResizeEnd({
							event: e,
							item: scope.item,
							element: $element,
							size: {
								width: width,
								height: height
							}
						});
					}

					action = 'drag';

					gridster.floatItemsUp();

					gridster.updateGridHeight();

					// need to wait for height transition
					setTimeout(function() {
						gridster.resolveOptions();
					}, 500);

					onUpdate({
						event: e,
						item: scope.item,
						element: $element
					});
				}

			}).on('hold', function (e) {
				var interaction = e.interaction;

				// ignore right clicks
				if (e.button !== 0) {
					return;
				}

				if (!interaction.interacting()) {
				  interaction.start({ name: 'drag' }, e.interactable, e.currentTarget);
				}
			});

			// bind click handler to resize elements to set action
			if (gridster.getOption('resizableEnabled')) {
				var eventName = interact.supportsTouch() ? 'touchstart' : 'mousedown';

				$element.find('.resize-handle').bind(eventName, function() {
					action = 'resize';
				});
			}

			// reset the element if gridster options have changed
			scope.$on('ez-gridster.updated', function() {
				gridster.setElement(element, scope.item);

				onUpdate({
					item: scope.item,
					element: $element
				});
			});

			scope.$on('$destroy', function() {
				gridster.removeItemElement(scope.item[gridster.getOption('trackByProperty')]);

				if (dragInteract !== null) {
					dragInteract.unset();
					dragInteract = null;
				}

				gridster.updateGridHeight();
			});

			function init() {
				gridster.setElementWidth(element, gridster.getSizeX(scope.item));
				gridster.setElementHeight(element, gridster.getSizeY(scope.item));

				$element.addClass('gridster-item-loaded');

				onInit({
					item: scope.item,
					element: $element
				});
			}

			// init item
			gridster.fixItem(scope.item);

			gridster.addItemElement(scope.item[gridster.getOption('trackByProperty')], element);

			gridster.setElement(element, scope.item, true);

			if (!gridster.getOption('isLoaded')) {

				scope.$on('ez-gridster.loaded', function() {
					init();
				});

				if (scope.$parent.$last) {
					gridster.updateGridHeight();

					var delay = gridster.getOption('renderDelay');

					// give the page some time to load so the transition in is smoother
					setTimeout(function() {
						gridster.setLoaded();
					}, delay);

					// resolve again in case of scrollbars
					$timeout(function() {
						gridster.resolveOptions();
						gridster.updateGridHeight();
					}, delay + 500);
				}
			} else {
				// item was pushed into the grid
				gridster.updateGridHeight();

				setTimeout(function() {
					init();
				}, 100);

				setTimeout(function() {
					gridster.resolveOptions();
				}, 500);
			}

		}
	};
}]);
