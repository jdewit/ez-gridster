describe('GridsterService', function() {

  var _GridsterService, gridster;

  beforeEach(module('ez.gridster'));

  beforeEach(inject(function(GridsterService) {//$templateCache, $rootScope, $timeout, $compile) {

    _GridsterService = GridsterService;

    gridster = {
      next_position_called: 0,
      next_position: function() {
        this.next_position_called++;
      },
      remove_all_widgets_called: 0,
      remove_all_widgets: function() {
        this.remove_all_widgets_called++;
      },
      remove_widget_vars: {},
      remove_widget_called: 0,
      remove_widget: function($widget, silent, callback) {
        this.remove_widget_vars.$widget = $widget;
        this.remove_widget_called++;
        callback();
      },
      serialize_called: 0,
      serialize: function() {
        this.serialize_called++;
      }
    };
  }));

  it('should init gridster', function() {
    assert.deepEqual(_GridsterService.widgets, []);
    assert.isNull(_GridsterService.gridster);
    _GridsterService.init(gridster);
    assert.deepEqual(_GridsterService.gridster, gridster);
  });

  it('should clear widgets', function() {
    _GridsterService.init(gridster);
    _GridsterService.clear();
    assert.equal(gridster.remove_all_widgets_called, 1);
  });

  it('should get next position', function() {
    _GridsterService.init(gridster);
    _GridsterService.getNextPosition(1, 1);
    assert.equal(gridster.next_position_called, 1);
  });

  it('should be able to get & widgets', function() {
    _GridsterService.setWidgets([1, 2]);
    assert.deepEqual(_GridsterService.getWidgets(), [1, 2]);
  });

  it('should be able to add & remove widgets', function() {
    _GridsterService.init(gridster);
    _GridsterService.addWidget(1);
    assert.lengthOf(_GridsterService.widgets, 1);
    assert.deepEqual(_GridsterService.getWidgets(), [1]);
    _GridsterService.removeWidget({dom: 'element'}, 0);
    assert.equal(gridster.remove_widget_called, 1);
    assert.lengthOf(_GridsterService.widgets, 0);
  });

  it('should get serialized widget positions', function() {
    _GridsterService.init(gridster);
    _GridsterService.serialize();
    assert.equal(gridster.serialize_called, 1);
  });

});

