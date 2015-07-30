/**
 * @file ez-gridster - 
 * @module ez-gridster
 * 
 * @see 
 * @version 0.4.6
 * @license MIT
 */
(function(angular) {
'use strict';
/*jshint -W079 */
var app = angular.module('ez.gridster', []);

/**
 * @name gridsterConfig
 * @description  Provides angular-gridster with sensible defaults
 */
app.constant('EzGridsterConfig', {

  /**
   * The available view modes
   * These options will be set when the view mode is active
   *
   * @type {object}
   */
  modes: {
    desktop: {
      columns: 12,
      minThreshold: 1025,
      maxThreshold: 9999,
      defaultSizeX: 3,
      defaultSizeY: 3,
      minSizeX: 3,
      minSizeY: 2

    },
    tablet: {
      columns: 12,
      minThreshold: 768,
      maxThreshold: 1024,
      defaultSizeX: 4,
      defaultSizeY: 4,
      minSizeX: 4,
      minSizeY: 2
    },
    mobile: {
      itemPadding: [0, 10],
      columns: 6,
      minThreshold: 0,
      maxThreshold: 767,
      defaultSizeX: 6,
      defaultSizeY: 6,
      minSizeX: 6,
      minSizeY: 3
    }
  },

  /**
   * The width of the grid.
   * @type {string|number}
   */
  width: 'auto',

  /**
   * The width of the columns.
   * "auto" will divide the width of the grid evenly among the columns
   * @type {string|number}
   */
  colWidth: 'auto',

  /**
   * The height of the rows.
   * "match" will set the row height to be the same as the column width
   * @type {string|number}
   */
  rowHeight: 'match',

  /**
   * The padding between grid items
   * @type {array} [x, y]
   */
  padding: [10, 10],

  /**
   * The minimum width of an item
   * @type {number} Width in pixels
   */
  minItemWidth: 100,

  /**
   * The minimum height of an item
   * @type {number} Height in pixels
   */
  minItemHeight: 100,

  /**
   * The minimum amount of rows to show if the grid is empty
   * "auto" sets the height of the grid to fit the height of the grids container
   * @type {number}
   */
  minRows: 'auto',

  /**
   * The maximum amount of rows allowed in the grid
   * @type {number}
   */
  maxRows: 1000,

  /**
   * The time to wait for the items appear on initial load
   */
  renderDelay: 500,

  /**
   * The items track by property
   * @type {string}
   */
  trackByProperty: 'id',

  /**
   * The items row property name
   */
  rowProperty: 'row',

  /**
   * The items column property name
   */
  colProperty: 'col',

  /**
   * The items sizeX property name
   */
  sizeXProperty: 'sizeX',

  /**
   * The items sizeY property name
   */
  sizeYProperty: 'sizeY',

  /**
   * Float items up on changes if true
   * @type {boolean}
   */
  floatItemsUp: true,

  /**
   * Move overlapping items if true
   * @type {string}
   */
  moveOverlappingItems: true,

  /**
   * Allow items to be dragged if true
   * @type {boolean}
   */
  dragEnabled: true,

  /**
   * Allow items to be resized if true
   * @type {boolean}
   */
  resizableEnabled: true,

  /**
   * Apply overlays to grid items on drag/resize.
   * Useful for preventing mouse hijacking with iframes.
   */
  iframeFix: true,

  /**
   * Show preview holder during dragging/resizing
   * @type {boolean}
   */
  previewEnabled: true,

  /**
   * Scroll page if dragging or resizing near page limits
   */
  scrollEdgeEnabled: true,

  /**
   * The scroll element selector
   */
  scrollElSelector: 'html,body',

  /**
   * The grid container element to get the height from
   */
  gridContainerSelector: 'window'

});

/**
 * GridsterCtrl
 */
app.controller('EzGridsterCtrl', ['$scope', '$timeout', 'EzGridsterConfig', function($scope, $timeout, EzGridsterConfig) {

  var self = this;

  /**
   * The grid element
   */
  var $gridElement = null;

  /**
   * The previewElement DOM element
   */
  var previewElement = null;

  /**
   * Stores an indexed array of grid item DOM elements
   */
  $scope.itemElements = [];

  /**
   * Initialize the grid
   */
  this.init = function($element) {
    $gridElement = $element;
    previewElement = $element[0].querySelector('.gridster-preview-holder');

    // initialize options object with gridster config
    $scope.options = angular.extend({}, EzGridsterConfig);

    // merge user provided options
    $.extend(true, $scope.options, $scope.config);

    this.resolveOptions();

    if (this.getOption('scrollEdgeEnabled') && !$('.gridster-scroll-edge').length) {
      var $topEdgeEl = angular.element('<div class="gridster-scroll-edge top-edge"></div>');

      var $bottomEdgeEl = angular.element('<div class="gridster-scroll-edge bottom-edge"></div>');

      this.addScrollEdge($topEdgeEl[0], -200);
      this.addScrollEdge($bottomEdgeEl[0], 200);
    }
  };

  /**
   * Broadcast change event
   */
  this.dispatchChangeEvent = function() {
    $scope.$parent.$emit('ez-gridster.changed');
    $scope.$parent.$broadcast('ez-gridster.changed');
  };

  /**
   * Returns an option
   */
  this.getOption = function(key) {
    // use mode options if possible
    if ($scope.options.modes[$scope.options.mode].hasOwnProperty(key)) {
      return $scope.options.modes[$scope.options.mode][key];
    } else {
      return $scope.options[key];
    }
  };

  /**
   * Set an option
   */
  this.setOption = function(key, value) {
    if ($scope.options.modes[$scope.options.mode].hasOwnProperty(key)) {
      $scope.options.modes[$scope.options.mode][key] = value;
    } else {
      $scope.options[key] = value;
    }
  };

  /**
   * Redraw the grid
   */
  this.redraw = function() {
    this.moveAllOverlappingItems();
    this.floatItemsUp();
    this.updateGridHeight();
    this.setElements();
  };

  /**
   * Add item element to itemElements
   */
  this.addItemElement = function(id, element) {
    $scope.itemElements[id] = element;
  };

  /**
   * Get an items DOM element
   */
  this.getItemElement = function(id) {
    return $scope.itemElements[id];
  };

  /**
   * Remove an items DOM element from itemElements array
   */
  this.removeItemElement = function(id) {
    delete $scope.itemElements[id];
  };

  /**
   * Add class to gridster container
   */
  this.addClass = function(name) {
    $gridElement.addClass(name);
  };

  /**
   * Add class to gridster container
   */
  this.removeClass = function(name) {
    $gridElement.removeClass(name);
  };

  /**
   * Resolve options relating to screen size
   */
  this.resolveOptions = function(init, preventDoubleCheck) {
    var _mode = $scope.options.mode,
      self = this,
      modeOptions,
      widthChanged = false,
      _width;

    _width = $gridElement.width();

    for (var mode in $scope.options.modes) {
      modeOptions = $scope.options.modes[mode];

      if (
        _width >= modeOptions.minThreshold &&
        _width <= modeOptions.maxThreshold
      ) {
        if (mode !== _mode) {
          $scope.options.mode = mode;

          this.removeClass('gridster-' + _mode);
          this.addClass('gridster-' + mode);
        }

        break;
      }
    }

    if (this.getOption('previewEnabled')) {
      this.addClass('gridster-preview-enabled');
    } else {
      this.removeClass('gridster-preview-enabled');
    }

    if (this.getOption('width') !== 'auto') {
      $scope.options.curWidth = this.getOption('width');
    }

    _width = _width - (2 * this.getOption('padding')[0]);

    if (_width !== $scope.options.curWidth) {
      $scope.options.curWidth = _width;
      widthChanged = true;
    }

    if (this.getOption('colWidth') === 'auto') {
      $scope.options.curColWidth = Math.round($scope.options.curWidth / this.getOption('columns'));
    } else {
      $scope.options.curColWidth = this.getOption('colWidth');
    }

    if (this.getOption('rowHeight') === 'match') {
      $scope.options.curRowHeight = $scope.options.curColWidth;
    } else {
      $scope.options.curRowHeight = this.getOption('rowHeight');
    }

    if (!!$scope.options.isLoaded) {
      if (widthChanged) {
        this.updateGridHeight();

        this.setElements();

        $scope.$parent.$broadcast('ez-gridster.resized');
      }

      // need to resolve options again in case scroll-y bar has been added/removed
      // with change in grid height
      if (!preventDoubleCheck) {
        $timeout(function() {
          self.resolveOptions(false, true);
        }, 50);
      }
    } else if (!!init) {
      $scope.options.isLoaded = true;

      this.updateGridHeight();

      // need to resolve options again in case scroll-y bar has been added/removed
      // with change in grid height
      $timeout(function() {
        self.resolveOptions();
      }, 50);

      // need to wait to initialize the widgets until the grid width and height have been set
      // and adjusted if a scrollbar-y appears
      $timeout(function() {
        $scope.$parent.$broadcast('ez-gridster.loaded');

        // wait to apply the gridster-loaded class so the position transitions are not applied to the grid items
        // on initialization
        $timeout(function() {
          self.addClass('gridster-loaded');
        }, 50);
      }, 100);
    }
  };

  /**
   * Check if item can occupy a specified position in the grid
   */
  this.canItemOccupy = function(row, col, sizeX, sizeY, excludeItems) {
    if (
      row < 0 ||
      col < 0 ||
      (row + sizeY) > this.getOption('maxRows') ||
      (col + sizeX) > this.getOption('columns') ||
      this.getItemsInArea(row, col, sizeX, sizeY, excludeItems).length > 0
    ) {
      return false;
    }

    return true;
  };

  /**
   * Gets items within an area
   */
  this.getItemsInArea = function(row, col, sizeX, sizeY, excludeItems) {
    var items = [],
      item;

    if (!!excludeItems && !(excludeItems instanceof Array)) {
      excludeItems = [excludeItems];
    }

    for (var i = 0, itemCount = $scope.items.length; i < itemCount; i++) {
      item = $scope.items[i];

      if (!!excludeItems && excludeItems.indexOf(item) !== -1) {
        continue;
      }

      if (!this.isItemHidden(item) && this.isItemInArea(item, row, col, sizeX, sizeY)) {
        items.push(item);
      }
    }

    return items;
  };

  /**
   * Checks if item is inside a specified area
   */
  this.isItemInArea = function(item, row, col, sizeX, sizeY) {
    var itemRow, itemCol, itemSizeX, itemSizeY;

    itemRow = this.getRow(item);
    itemCol = this.getCol(item);
    itemSizeX = this.getSizeX(item);
    itemSizeY = this.getSizeY(item);

    if (
      (itemRow + itemSizeY) <= row || // outside top
      itemRow >= (row + sizeY) || // outside bottom
      (itemCol + itemSizeX) <= col || // outside left
      itemCol >= (col + sizeX) // outside right
    ) {
      return false;
    }

    return true;
  };

  /**
   * Resolves an items parameter
   */
  this.resolveParam = function(val, defaultVal1, defaultVal2) {
    val = parseInt(val, 10);

    if (val === null || isNaN(val) || typeof val !== 'number' || val < 0) {
      if (typeof defaultVal1 !== 'undefined') {
        return this.resolveParam(defaultVal1, defaultVal2);
      } else if (typeof defaultVal2 !== 'undefined') {
        return this.resolveParam(defaultVal2);
      } else {
        val = null;
      }
    }

    return val;
  };

  /**
   * Resolve an items position & size values for all view modes
   */
  this.resolveItem = function(item) {
    var _mode = $scope.options.mode,
      defaultSizeX = this.getOption('defaultSizeX'),
      defaultSizeY = this.getOption('defaultSizeY'),
      mode,
      sizeX,
      sizeY,
      row,
      col,
      position;

    for (mode in $scope.options.modes) {
      // temp change of mode
      $scope.options.mode = mode;

      // resolve sizeX
      sizeX = this.resolveParam(this.getSizeX(item), defaultSizeX);
      if (sizeX < this.getOption('minSizeX')) {
        sizeX = defaultSizeX;
      }
      item = this.setSizeX(item, sizeX);

      // resolve sizeY
      sizeY = this.resolveParam(this.getSizeY(item), defaultSizeY);
      if (sizeY < this.getOption('minSizeY')) {
        sizeY = defaultSizeY;
      }
      item = this.setSizeY(item, sizeY);

      // resolve row/col
      row = this.getRow(item);
      col = this.getCol(item);

      if (
        row === null ||
        col === null ||
        row > this.getOption('maxRows') ||
        col >= this.getOption('columns') ||
        this.getItemsInArea(row, col, sizeX, sizeY, item).length > 0
      ) {
        position = this.getNextPosition(sizeX, sizeY, item);

        // item must be too big for the grid, set to default size
        if (position === false) {
          item = this.setSizeX(item, defaultSizeX);
          item = this.setSizeY(item, defaultSizeY);

          position = this.getNextPosition(null, null, item);

          if (position === false) {
            throw new Error('No positions available');
          }
        }

        row = position.row;
        col = position.col;
      }

      item = this.setRow(item, row);
      item = this.setCol(item, col);
    }

    // revert back to the current mode
    $scope.options.mode = _mode;


    if (this.getOption('floatItemsUp')) {
      this.floatItemUp(item, true);
    }
  };

  /**
   * Get the next available position in the grid
   */
  this.getNextPosition = function(sizeX, sizeY, excludeItem) {
    sizeX = sizeX || this.getOption('defaultSizeX');
    sizeY = sizeY || this.getOption('defaultSizeY');

    for (var row = 0, rowCount = this.getOption('maxRows'); row <= rowCount; row++) {
      for (var col = 0, columnCount = this.getOption('columns'); col < columnCount; col++) {
        if (self.canItemOccupy(row, col, sizeX, sizeY, excludeItem)) {
          return {
            row: row,
            col: col
          };
        }
      }
    }

    return false;
  };

  /**
   * Move other items in the way up or down
   */
  this.moveOverlappingItems = function(item, allowMoveUp) {
    if (this.getOption('moveOverlappingItems') === false || this.isItemHidden(item)) {
      return;
    }

    var items, row, col, sizeX, sizeY, _row, _col, _sizeX, _sizeY;

    row = this.getRow(item);
    col = this.getCol(item);
    sizeX = this.getSizeX(item);
    sizeY = this.getSizeY(item);

    items = this.getItemsInArea(row, col, sizeX, sizeY, item);

    for (var i = 0, l = items.length; i < l; i++) {
      _row = this.getRow(items[i]);
      _col = this.getCol(items[i]);
      _sizeX = this.getSizeX(items[i]);
      _sizeY = this.getSizeY(items[i]);

      // try to move item up first
      if (
        allowMoveUp === true &&
        row > 0 &&
        this.canItemOccupy(
          _row - (sizeY + _sizeY - 1),
          _col,
          _sizeX,
          _sizeY,
          items[i]
        )
      ) {
        // move above
        items[i] = this.setRow(items[i], _row - (sizeY + _sizeY - 1));
      } else {
        // move below
        items[i] = this.setRow(items[i], row + sizeY);
      }

      this.translateElementPosition(
        this.getItemElement(items[i][this.getOption('trackByProperty')]),
        this.colToPixels(this.getCol(items[i])),
        this.rowToPixels(this.getRow(items[i]))
      );

      this.moveOverlappingItems(items[i], false, true);

    }
  };

  /**
   * Iterate entire grid and move any overlapping items
   */
  this.moveAllOverlappingItems = function() {
    if ($scope.items.length === 0) {
      return;
    }

    for (var i = 0, l = $scope.items.length; i < l; i++) {
      this.moveOverlappingItems($scope.items[i]);
    }
  };

  /**
   * Move any items up into empty space if they can fit
   */
  this.floatItemsUp = function() {
    if (this.getOption('floatItemsUp') === false || !$scope.items) {
      return;
    }

    var wasFloated = false;
    for (var i = 0; i < $scope.items.length; i++) {
      // start over again if item was floated up
      if (this.floatItemUp($scope.items[i])) {
        wasFloated = true;
      }
    }

    if (wasFloated) {
      // keep going until no more items are floated up
      this.floatItemsUp();
    }
  };

  /**
   * Float an item up to the most suitable row
   *
   * @returns {boolean} True if item was moved, False if not moved
   */
  this.floatItemUp = function(item, noMove) {
    var items, row, col, sizeX, sizeY, bestRow = null;

    row = this.getRow(item) - 1;
    col = this.getCol(item);
    sizeX = this.getSizeX(item);
    sizeY = this.getSizeY(item);

    while (row > -1) {
      items = this.getItemsInArea(row, col, sizeX, sizeY, item);

      if (items.length === 0) {
        bestRow = row;
      } else {
        break;
      }

      --row;
    }

    if (bestRow !== null) {
      item = this.setRow(item, bestRow);

      if (!noMove) {
        this.translateElementPosition(
          this.getItemElement(item[this.getOption('trackByProperty')]),
          this.colToPixels(col),
          this.rowToPixels(bestRow)
        );
      }

      return true;
    }

    return false;
  };

  /**
   * Update gridsters height if item is the lowest
   */
  this.updateGridHeight = function(movingItem) {
    var maxRows = 0,
      minRows = this.getOption('minRows'),
      itemMaxRow,
      height = 0;

    if (minRows === 'auto') {
      maxRows = this.getOption('defaultSizeY');
    } else {
      maxRows = minRows;
    }

    if ($scope.items) {
      for (var j = 0; j < $scope.items.length; j++) {
        itemMaxRow = this.getRow($scope.items[j]) + this.getSizeY($scope.items[j]);

        if (itemMaxRow > maxRows) {
          maxRows = itemMaxRow;
        }
      }
    }

    // add empty space for items to move to
    if (!!movingItem) {
      maxRows += this.getSizeY(movingItem);
    }

    if (maxRows > this.getOption('maxRows')) {
      maxRows = this.getOption('maxRows');
    }

    height = maxRows * this.getOption('curRowHeight') + (2 * this.getOption('padding')[1]);

    $gridElement.height(height);
  };

  /**
   * Returns the number of rows that will fit in given amount of pixels
   */
  this.pixelsToRows = function(pixels, ceilOrFloor) {
    var rows;

    if (!pixels || pixels < 0) {
      pixels = 0;
    }

    if (ceilOrFloor === true) {
      rows = Math.ceil(pixels / this.getOption('curRowHeight'));
    } else if (ceilOrFloor === false) {
      rows = Math.floor(pixels / this.getOption('curRowHeight'));
    } else {
      rows = Math.round(pixels / this.getOption('curRowHeight'));
    }

    return rows;
  };

  /**
   * Returns the number of columns that will fit in a given amount of pixels
   */
  this.pixelsToColumns = function(pixels, ceilOrFloor) {
    var columns;

    if (!pixels || pixels < 0) {
      pixels = 0;
    }

    if (ceilOrFloor === true) {
      columns = Math.ceil(pixels / $scope.options.curColWidth);
    } else if (ceilOrFloor === false) {
      columns = Math.floor(pixels / $scope.options.curColWidth);
    } else {
      columns = Math.round(pixels / $scope.options.curColWidth);
    }

    return columns;
  };

  /**
   * Returns the row in pixels
   */
  this.rowToPixels = function(row, noPadding) {
    if (!noPadding) {
      return row * $scope.options.curRowHeight + (2 * this.getOption('padding')[1]);
    } else {
      return row * $scope.options.curRowHeight - (2 * this.getOption('padding')[1]);
    }
  };

  /**
   * Returns the column in pixels
   */
  this.colToPixels = function(col, noPadding) {
    if (!noPadding) {
      return col * $scope.options.curColWidth + (2 * this.getOption('padding')[0]);
    } else {
      return col * $scope.options.curColWidth - (2 * this.getOption('padding')[0]);
    }
  };

  /**
   * Translate an elements position using translate3d if possible
   */
  this.translateElementPosition = function(el, x, y) {
    var transform;

    if (el === null) {
      if (!this.getOption('previewEnabled')) {
        return;
      }

      el = previewElement;
    }

    if (Modernizr.csstransforms3d) {
      transform = 'translate3d(' + x + 'px,' + y + 'px, 0)';
    } else {
      transform = 'translate(' + x + 'px,' + y + 'px)';
    }

    el.style.webkitTransform = transform;
    el.style.MozTransform = transform;
    el.style.OTransform = transform;
    el.style.msTransform = transform;
    el.style.transform = transform;
  };

  /**
   * Sets an elements height
   */
  this.setElementHeight = function(el, height) {
    if (el === null) {
      if (!this.getOption('previewEnabled')) {
        return;
      }

      el = previewElement;
    }

    height = height - (4 * this.getOption('padding')[1]) + 'px';

    el.style.height = height;
  };

  /**
   * Sets an elements width
   */
  this.setElementWidth = function(el, width) {
    if (el === null) {
      if (!this.getOption('previewEnabled')) {
        return;
      }

      el = previewElement;
    }

    width = width - (4 * this.getOption('padding')[0]) + 'px';

    el.style.width = width;
  };

  /**
   * Set an items DOM element in the grid
   */
  this.setElement = function(el, item, init) {
    if (el === null) {
      if (!this.getOption('previewEnabled')) {
        return;
      }

      el = previewElement;
    } else if (!!el) {
      if (this.isItemHidden(item)) {
        el.style.display = 'none';
        return;
      } else {
        el.style.display = 'block';
      }
    } else {
      return;
    }

    this.translateElementPosition(el, this.colToPixels(this.getCol(item)), this.rowToPixels(this.getRow(item)));

    if (!init) {
      this.setElementWidth(el, this.colToPixels(this.getSizeX(item)));
      this.setElementHeight(el, this.rowToPixels(this.getSizeY(item)));
    }
  };

  /**
   * Set all item elements in the grid
   */
  this.setElements = function() {
    for (var i = 0; i < $scope.items.length; i++) {
      this.setElement(this.getItemElement($scope.items[i][this.getOption('trackByProperty')]), $scope.items[i]);
    }
  };

  /**
   * Check if an items position has changed
   */
  this.hasItemPositionChanged = function(item, row, col) {
    if (this.getRow(item) !== row ||
      this.getCol(item) !== col) {
      return true;
    }

    return false;
  };

  /**
   * Check if an items width has changed
   */
  this.hasItemWidthChanged = function(item, sizeX) {
    if (this.getSizeX(item) !== sizeX) {
      return true;
    }

    return false;
  };

  /**
   * Check if an items height has changed
   */
  this.hasItemHeightChanged = function(item, sizeY) {
    if (this.getSizeY(item) !== sizeY) {
      return true;
    }

    return false;
  };

  /**
   * Get an items property
   */
  this.getItemProperty = function(item, property) {
    if (!item.hasOwnProperty($scope.options.mode)) {
      return null;
    }

    if (!item[$scope.options.mode].hasOwnProperty(property)) {
      item[$scope.options.mode][property] = null;
    }

    return item[$scope.options.mode][property];
  };

  /**
   * Set an items property
   */
  this.setItemProperty = function(item, property, val) {
    if (!item.hasOwnProperty($scope.options.mode)) {
      item[$scope.options.mode] = {};
    }

    item[$scope.options.mode][property] = val;

    return item;
  };

  /**
   * Get an items row property
   */
  this.getRow = function(item) {
    return this.getItemProperty(item, $scope.options.rowProperty);
  };

  /**
   * Set an items row property
   */
  this.setRow = function(item, val) {
    return this.setItemProperty(item, $scope.options.rowProperty, val);
  };

  /**
   * Get an items row property
   */
  this.getCol = function(item) {
    return this.getItemProperty(item, $scope.options.colProperty);
  };

  /**
   * Set an items col property
   */
  this.setCol = function(item, val) {
    var sizeX = this.getSizeX(item);

    // stay in the grid fool
    if ((val + sizeX) > this.getOption('columns')) {
      val = this.getOption('columns') - sizeX;
    }

    return this.setItemProperty(item, $scope.options.colProperty, val);
  };

  /**
   * Get an items sizeX property
   */
  this.getSizeX = function(item) {
    return this.getItemProperty(item, $scope.options.sizeXProperty);
  };

  /**
   * Set an items sizeX property
   */
  this.setSizeX = function(item, val) {
    var min = this.getOption('minSizeX');
    if (val < min) {
      val = min;
    }

    var max = this.getOption('columns') - item[this.getOption('colProperty')];
    if (val > max) {
      val = max;
    }

    return this.setItemProperty(item, $scope.options.sizeXProperty, val);
  };

  /**
   * Get an items sizeY property
   */
  this.getSizeY = function(item) {
    return this.getItemProperty(item, $scope.options.sizeYProperty);
  };

  /**
   * Set an items sizeY property
   */
  this.setSizeY = function(item, val) {
    var min = this.getOption('minSizeY');
    if (val < min) {
      val = min;
    }

    var max = this.getOption('maxRows') - item[this.getOption('rowProperty')];
    if (val > max) {
      val = max;
    }

    return this.setItemProperty(item, $scope.options.sizeYProperty, val);
  };

  /**
   * Is the item hidden?
   */
  this.isItemHidden = function(item) {
    return item.hasOwnProperty($scope.options.mode) ? item[$scope.options.mode].hidden : false;
  };

  /**
   * Returns the left, top position of the element
   */
  this.getPosition = function(element) {
    var values, top, left;
    var $element = $(element);

    var matrix = $element.css('-webkit-transform') ||
      $element.css('-moz-transform') ||
      $element.css('-ms-transform') ||
      $element.css('-o-transform') ||
      $element.css('transform');

    if (typeof matrix !== 'string' || matrix === 'none') {
      throw new Error('Your browser does not support css transforms');
    }

    values = matrix.split('(')[1].split(')')[0].split(',');

    if (values.length < 4) {
      left = parseInt(values[0].replace('px', ''), 10);
      top = parseInt(values[1].replace('px', ''), 10);
    } else {
      left = parseInt(values[4].replace('px', ''), 10);
      top = parseInt(values[5].replace('px', ''), 10);
    }

    return {
      left: left,
      top: top
    };
  };

  /**
   * add dropzones to the top and bottom of the page that cause the page to scroll
   * when they are dragged over with a grid item
   */
  this.addScrollEdge = function(edgeEl, diff) {
    var dropMoveThrottle = null;

    interact(edgeEl).dropzone({
      acceptClass: '.gridster-item-moving',
      overlap: 'center',
      ondropmove: function() {
        if (dropMoveThrottle === null) {

          var scrollTop = $('body').scrollTop();

          // we're already at the top
          if (diff < 0 && scrollTop <= 0) {
            return;
          }

          dropMoveThrottle = true;

          $(self.getOption('scrollElSelector')).animate({
            scrollTop: scrollTop + diff
          }, 400);

          if (diff > 0) {
            $gridElement.height($gridElement.height() + diff);
          }

          setTimeout(function() {
            dropMoveThrottle = null;
          }, 400);
        }
      }
    });

    $('body').append(edgeEl);
  };

}]);

/**
 * @name gridsterDirective
 */
app.directive('ezGridster', ['$window', '$timeout', function($window, $timeout) {
  return {
    restrict: 'EA',
    controller: 'EzGridsterCtrl',
    scope: {
      items: '=',
      config: '=?ezGridster',
      api: '=?'
    },
    templateUrl: 'ez-gridster-tpl.html',
    replace: true,
    transclude: true,
    link: function(scope, $element, attrs, controller) {
      var windowResizeThrottle = null;

      // expose gridster methods to parent scope
      $.extend(true, scope.api, {
        redraw: controller.redraw,
        getNextPosition: controller.getNextPosition,
        getOption: controller.getOption,
        setOption: controller.setOption
      });

      var resizeCallback = function() {
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
          scope.item._moving = true;
          hasChanged = false;

          gridster.updateGridHeight(scope.item);

          gridster.addClass('gridster-moving');
          $element.addClass('gridster-item-moving');

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
        // ignore right click
        if (!!e && e.which === 3 && !interact.supportsTouch()) {
          return false;
        }

        return action;
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

        if (width < 0 || height < 0) {
          return;
        }

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

/**
 * Bind scope to transcluded content
 *
 * Fix for breaking change in 1.20
 * see https://github.com/angular/angular.js/issues/7874
 */
app.directive('inject', function() {
  return {
    link: function($scope, $element, $attrs, controller, $transclude) {
      var innerScope = $scope.$new();

      $transclude(innerScope, function(clone) {
        $element.empty();
        $element.append(clone);
        $element.on('$destroy', function() {
          innerScope.$destroy();
        });
      });
    }
  };
});
}(angular));