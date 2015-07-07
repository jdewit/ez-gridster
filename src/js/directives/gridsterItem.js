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
        itemScope = scope.$$nextSibling.$$childHead,
        dispatch = getFn('event-handler'),
        dragInteract = null,
        action = 'drag',
        hasChanged = false,
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
        onstart: function() {
          gridster.addClass('gridster-moving');

          scope.item._moving = true;
          hasChanged = false;

          gridster.updateGridHeight(scope.item);

          row = gridster.getRow(scope.item);
          col = gridster.getCol(scope.item);
          sizeX = gridster.getSizeX(scope.item);
          sizeY = gridster.getSizeY(scope.item);

          top = gridster.rowToPixels(gridster.getRow(scope.item));
          left = gridster.colToPixels(gridster.getCol(scope.item));
          width = element.offsetWidth;
          height = element.offsetHeight;

          gridster.setElement(null, scope.item);

          if (action === 'drag') {

            if (!gridster.getOption('dragEnabled')) {
              return;
            }

            columns = gridster.getOption('columns');

          } else {

            padding = gridster.getOption('padding');

            minWidth = (gridster.getOption('minSizeX') * gridster.getOption('curColWidth')) - (2 * padding[0]);
            maxWidth = (gridster.getOption('columns') - col) * gridster.getOption('curColWidth') - (2 * padding[0]);
            minHeight = (gridster.getOption('minSizeY') * gridster.getOption('curRowHeight')) - (2 * padding[1]);
            maxHeight = (gridster.getOption('maxRows') - row) * gridster.getOption('curColHeight') - (2 * padding[1]);

          }

          dispatch({
            hasChanged: hasChanged,
            event: {
              action: action,
              stage: 'start'
            },
            item: scope.item,
            element: $element,
            position: {
              top: top,
              left: left
            },
            size: {
              width: width,
              height: height
            }
          });

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

            if (gridster.hasItemPositionChanged(scope.item, row, col)) {
              hasChanged = true;
            } else {
              return;
            }

            scope.item = gridster.setRow(scope.item, row);
            scope.item = gridster.setCol(scope.item, col);

            gridster.translateElementPosition(
              null,
              gridster.colToPixels(col),
              gridster.rowToPixels(row)
            );

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


            if (gridster.hasItemWidthChanged(scope.item, sizeX) || gridster.hasItemHeightChanged(scope.item, sizeY)) {
              hasChanged = true;
            } else {
              return;
            }

            scope.item = gridster.setSizeX(scope.item, sizeX);
            scope.item = gridster.setSizeY(scope.item, sizeY);

            gridster.setElement(null, scope.item);
          }

          dispatch({
            hasChanged: hasChanged,
            event: {
              action: action,
              stage: 'move'
            },
            item: scope.item,
            element: $element,
            position: {
              top: top,
              left: left
            },
            size: {
              width: width,
              height: height
            }
          });

          gridster.moveOverlappingItems(scope.item, true);
          gridster.updateGridHeight(scope.item);
        },
        onend: function() {
          delete scope.item._moving;


          gridster.removeClass('gridster-moving');
          $element.removeClass('gridster-item-moving');

          if (action === 'drag') {

            if (!gridster.getOption('dragEnabled')) {
              return;
            }

            gridster.translateElementPosition(element, gridster.colToPixels(col), gridster.rowToPixels(row));

          } else {
            gridster.setElement(element, scope.item);
          }

          dispatch({
            hasChanged: hasChanged,
            event: {
              action: action,
              stage: 'end'
            },
            item: scope.item,
            element: $element,
            position: {
              top: top,
              left: left
            },
            size: {
              width: gridster.colToPixels(gridster.getSizeX(scope.item), true),
              height: gridster.rowToPixels(gridster.getSizeY(scope.item), true)
            }
          });

          if (hasChanged) {
            gridster.dispatchChangeEvent();
          }

          // reset action back to drag
          action = 'drag';

          gridster.floatItemsUp();

          gridster.updateGridHeight();
        }
      }).actionChecker(function(e, action) {
        // only left mouse button triggers draggable
        if (!e || (e.which !== 1 && !interact.supportsTouch())) {
          return false;
        }

        return action;
      }).on('mousedown', function() {
        $element.addClass('gridster-item-moving');
      }).on('mouseup', function() {
        $element.removeClass('gridster-item-moving');
      }).on('hold', function(e) {
        // require tablets to use tab hold to begin interaction
        if (interact.supportsTouch()) {

          var interaction = e.interaction;

          if (!interaction.interacting()) {

            $element.addClass('gridster-item-moving');

            interaction.start({
              name: 'drag'
            }, e.interactable, e.currentTarget);
          }
        }
      });

      scope.$on('$destroy', function() {
        // hide item right away otherwise transitions cause widget overlap
        $element.hide();
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
      function init() {
        left = gridster.colToPixels(gridster.getCol(scope.item));
        top = gridster.rowToPixels(gridster.getRow(scope.item));
        width = gridster.colToPixels(gridster.getSizeX(scope.item));
        height = gridster.rowToPixels(gridster.getSizeY(scope.item));

        gridster.translateElementPosition(element, left, top);

        $element.addClass('gridster-item-loaded');
        gridster.setElementHeight(element, height);
        gridster.setElementWidth(element, width);

        dispatch({
          hasChanged: false,
          event: {
            action: 'resize',
            stage: 'init'
          },
          item: scope.item,
          element: $element,
          size: {
            width: gridster.colToPixels(gridster.getSizeX(scope.item), true),
            height: gridster.rowToPixels(gridster.getSizeY(scope.item), true)
          },
          position: {
            left: left,
            top: top
          }
        });
      }

      scope.$on('ez-gridster.resized', function() {
        width = gridster.colToPixels(gridster.getSizeX(scope.item), true);
        height = gridster.rowToPixels(gridster.getSizeY(scope.item), true);

        dispatch({
          hasChanged: gridster.hasItemWidthChanged(scope.item, width) || gridster.hasItemHeightChanged(scope.item, height),
          event: {
            action: 'resize',
            stage: 'end'
          },
          item: scope.item,
          element: $element,
          size: {
            width: width,
            height: height
          },
          position: {
            left: gridster.colToPixels(gridster.getCol(scope.item)),
            top: gridster.rowToPixels(gridster.getRow(scope.item))
          }
        });
      });

      // initialize item when gridster is loaded
      scope.$on('ez-gridster.loaded', function() {
        init();
      });

      gridster.resolveItem(scope.item);

      gridster.addItemElement(scope.item[gridster.getOption('trackByProperty')], element);

      if (!gridster.getOption('isLoaded')) {
        // initialize the grid if this is the last item
        if (scope.$parent.$last) {
          gridster.resolveOptions(true);
        }
      } else {
        // item was pushed into the grid
        gridster.resolveOptions();

        $timeout(function() {
          init();

          gridster.updateGridHeight();
        }, 100);
      }
    }
  };
}]);
