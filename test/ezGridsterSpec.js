describe('ez-gridster', function() {
  var el, _scope, _timeout, widgets;

  beforeEach(module('ez.gridster'));

  beforeEach(inject(function($templateCache, $rootScope, $timeout, $compile) {

		template = $templateCache.get('src/ez-gridster-tpl.html');
		$templateCache.put('ez-gridster.html', template);
    _timeout = $timeout;

    _scope = $rootScope.$new();

    el = angular.element('<div class="gridster" ez-gridster="widgets" ez-gridster-options="{resize: {enabled: false}}"></div>');

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

    _scope.widgets = widgets;

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
    var eventCount = 0;
    _scope.$on('ez_gridster.widget_added', function() {
      eventCount++;
    });

    _scope.$apply(function() {
      _scope.$broadcast('ez_gridster.add_widget', {name: 'Test new widget'});
    });

    assert.lengthOf(el.find('li'), 3);
    assert.equal(eventCount, 1);
  });

  it('should remove widget from scope & gridster via remove method', function(done) {
    _timeout.flush();
    var eventCount = 0;

    _scope.$on('ez_gridster.widget_removed', function() {
      eventCount++;
    });

    setTimeout(function() { // need to wait for gridster to use callback
      el.isolateScope().removeWidget(_scope.widgets[0], 0);
      assert.lengthOf(el.find('li'), 1);
      assert.lengthOf(_scope.widgets, 1);
      assert.equal(eventCount, 1);
      done();
    }, 500);
  });

  it('should clear gridster on "ez_gridster.clear" event', function(done) {
    _timeout.flush();
    assert.lengthOf(el.find('li'), 2);
    assert.lengthOf(_scope.widgets, 2);
    _scope.$broadcast('ez_gridster.clear');

    setTimeout(function() { // need to wait for gridster to use callback
      _scope.$digest();
      assert.lengthOf(el.find('li'), 0);
      assert.lengthOf(_scope.widgets, 0);
      done();
    }, 500);
  });

  it('should set gridster widgets on "ez_gridster.set" event', function() {
    _scope.$broadcast('ez_gridster.clear');
    _scope.$digest();
    assert.lengthOf(el.find('li'), 0);

    _scope.$broadcast('ez_gridster.set', widgets);
    _scope.$digest();
    assert.lengthOf(el.find('li'), 2);
  });
});
