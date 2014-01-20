describe('ez-gridster', function() {
  var el, _scope, _rootScope, _timeout, widgets, _GridsterService;

  beforeEach(module('ez.gridster'));

  beforeEach(inject(function($templateCache, $rootScope, $timeout, $compile, GridsterService) {

    template = $templateCache.get('src/ez-gridster-tpl.html');
    $templateCache.put('ez-gridster.html', template);
    _timeout = $timeout;

    _scope = $rootScope.$new();
    _rootScope = $rootScope;
    _GridsterService = GridsterService;

    el = angular.element('<ez-gridster config="{resize: {enabled: false}}"></ez-gridster>');

    widgets = [
      {
        col : 1,
        row: 1,
        sizey: 1,
        sizex: 1,
        name: "FOO"
      },
      {
        col : 2,
        row: 1,
        sizey: 1,
        sizex: 1,
        name: "Bar"
      }
    ];

    _GridsterService.setWidgets(widgets);

    $compile(el)(_scope);
    _scope.$digest();
  }));

  it('should init gridster widgets', function() {
    assert.lengthOf(el.find('li'), 2);
    assert.isTrue(el.hasClass('gridster'));
  });

  it('should be able to override options', function() {
    assert.isFalse(el.isolateScope().options.resize.enabled);
  });

  it('should add widget to scope & gridster on "ez_gridster.add_widget" event', function() {
    var pos = _GridsterService.getNextPosition(1, 1);

    var widget = {name: 'Test new widget', size_x: 1, size_y: 1};

    widget = angular.extend(widget, pos);

    _GridsterService.addWidget(widget);
    _scope.$digest();

    assert.lengthOf(el.find('li'), 3);
  });

  it('should remove widget from scope & gridster via removeWidget method', function(done) {
      _GridsterService.removeWidget(el.find('.gs-w').eq(0), 0, function() {
        assert.lengthOf(el.find('li'), 1);
        assert.lengthOf(_GridsterService.widgets, 1);
        done();
      });
  });

  it('should clear gridster on "ez_gridster.clear" event', function(done) {
    _GridsterService.clear();
    _scope.$digest();

    setTimeout(function() { // why is this soooo slow??
      assert.lengthOf(el.find('li'), 0);
      done();
    }, 500);
  });

  it('should call updateWidgets method and emit "ez_gridster.widget_dragged" event draggable stop', function() {
    var updateWidgetsCount = 0,
        widgetDraggedCount = 0
    ;

    _scope.$on('ez_gridster.widget_dragged', function() {
      widgetDraggedCount++;
    });

    _scope.$on('ez_gridster.widgets_updated', function() {
      updateWidgetsCount++;
    });


    el.isolateScope().options.draggable.stop();
    assert.equal(updateWidgetsCount, 1);
    assert.equal(widgetDraggedCount, 1);
  });

  it('should call updateWidgets method and emit "ez_gridster.widget_resized" event resize stop', function() {
    var updateWidgetsCount = 0,
        widgetResizedCount = 0
    ;

    _scope.$on('ez_gridster.widget_resized', function() {
      widgetResizedCount++;
    });

    _scope.$on('ez_gridster.widgets_updated', function() {
      updateWidgetsCount++;
    });


    el.isolateScope().options.resize.stop();
    assert.equal(updateWidgetsCount, 1);
    assert.equal(widgetResizedCount, 1);
  });

  it('should update widgets and emit "ez_gridster.widgets_updated" event', function() {
    var widgetsUpdatedCount = 0;

    var serializeData = [
      {
        col : 3,
        row: 3,
        size_x: 2,
        size_y: 4
      },
      {
        col : 2,
        row: 1,
        size_x: 1,
        size_y: 1
      }
    ];

    _timeout.flush();
    assert.lengthOf(el.find('.gs-w'), 2);

    _rootScope.$on('ez_gridster.widgets_updated', function(e, data) {
      widgetsUpdatedCount++;
      assert.deepEqual(data, serializeData, 'event should provide serialized data');
    });

    var e = {
      target: el.find('li').eq(0).html()
    };

    _GridsterService.serialize = function() { // mock serialize response
      return serializeData;
    };

    el.isolateScope().updateWidgets(e);

    assert.equal(_GridsterService.widgets[0].row, 3);
    assert.equal(_GridsterService.widgets[0].col, 3);
    assert.equal(_GridsterService.widgets[0].size_x, 2);
    assert.equal(_GridsterService.widgets[0].size_y, 4);

    assert.equal(widgetsUpdatedCount, 1);
  });

});
