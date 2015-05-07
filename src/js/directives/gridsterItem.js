/**
 * @name gridsterItemDirective
 *
 * @param {object} $timeout
 * @param {object} $parse
 */
app.directive('ezGridsterItem', ['$timeout', '$parse', function($timeout, $parse) {
  return {
    restrict: 'A',
    require: '^ezGridster',
    replace: true,
    scope: {
      item: '=ezGridsterItem'
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
        onLoad = getFn('on-load'),
        onChange = getFn('on-change'),
        dragInteract = null,
        action = 'drag',
        hasChanged,
        padding,
        row,
        col,
        sizeX,
        sizeY,
        top,
        left,
        width,
        height,
        minWidth,
        maxWidth,
        minHeight,
        maxHeight,
        columns;

      // Set interact on the item
      dragInteract = interact(element).draggable({
        manualStart: interact.supportsTouch(),
        dynamicDrop: true,
        onstart: function(e) {
          gridster.addClass('gridster-moving');

          $element.addClass('gridster-item-moving');

          scope.item._moving = true;
          hasChanged = false;

          gridster.updateGridHeight(scope.item);

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

            hasChanged = gridster.hasItemPositionChanged(scope.item, row, col);

            if (!hasChanged) {
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

            hasChanged = gridster.hasItemWidthChanged(scope.item, sizeX) || gridster.hasItemHeightChanged(scope.item, sizeY);

            if (!hasChanged) {
              return;
            }

            scope.item = gridster.setSizeX(scope.item, sizeX);
            scope.item = gridster.setSizeY(scope.item, sizeY);

            gridster.setElement(null, scope.item);

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
            gridster.setElement(element, scope.item);

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

          // reset action back to drag
          action = 'drag';

          gridster.floatItemsUp();

          gridster.updateGridHeight();

          if (!hasChanged) {
            onChange({
              event: e,
              item: scope.item,
              element: $element
            });

            scope.$emit('ez-gridster.changed');
          }
        }
      }).on('hold', function(e) {
        // require tablets to use tab hold to begin interaction
        if (interact.supportsTouch()) {

          var interaction = e.interaction;

          if (!interaction.interacting()) {
            interaction.start({
              name: 'drag'
            }, e.interactable, e.currentTarget);
          }
        }
      });

      scope.$on('$destroy', function() {
        gridster.removeItemElement(scope.item[gridster.getOption('trackByProperty')]);

        if (dragInteract !== null) {
          dragInteract.unset();
          dragInteract = null;
        }

        gridster.floatItemsUp();

        gridster.updateGridHeight();
      });

      // bind click handler to resize elements to set action to resize
      if (gridster.getOption('resizableEnabled')) {
        var eventName = interact.supportsTouch() ? 'touchstart' : 'mousedown';

        $element.find('.resize-handle').bind(eventName, function() {
          action = 'resize';
        });
      }

      // initialize this item
      function load() {
        gridster.setElementWidth(element, width);
        gridster.setElementHeight(element, height);

        $element.addClass('gridster-item-loaded');

        onLoad({
          item: scope.item,
          element: $element,
          size: {
            width: width,
            height: height,
          },
          position: {
            left: left,
            top: top
          }
        });
      }

      // load item
      gridster.fixItem(scope.item);

      left = gridster.colToPixels(gridster.getCol(scope.item));
      top = gridster.rowToPixels(gridster.getRow(scope.item));
      width = gridster.colToPixels(gridster.getSizeX(scope.item));
      height = gridster.rowToPixels(gridster.getSizeY(scope.item));

      gridster.translateElementPosition(element, left, top);

      gridster.addItemElement(scope.item[gridster.getOption('trackByProperty')], element);

      if (!gridster.getOption('isLoaded')) {

        // load item on grid load
        scope.$on('ez-gridster.loaded', function() {
          load();
        });

        // load grid if this is the last item
        if (scope.$parent.$last) {
          var delay = gridster.getOption('renderDelay');

          gridster.updateGridHeight();

          // give the page some time to load so the transition in is smoother
          setTimeout(function() {
            gridster.setLoaded();
          }, delay);

          // resolve again in case of scrollbars
          $timeout(function() {
            gridster.resolveOptions();
          }, delay + 500);
        }
      } else {
        // item was pushed into the grid
        gridster.updateGridHeight();

        setTimeout(function() {
          load();
        }, 100);

        setTimeout(function() {
          gridster.resolveOptions();
        }, 500);
      }

    }
  };
}]);
