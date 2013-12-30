describe('ez-gridster', function() {
  var el, _scope, _timeout;

  beforeEach(module('ez.gridster'));

  beforeEach(inject(function($templateCache, $rootScope, $timeout, $compile) {

		template = $templateCache.get('src/ez-gridster-tpl.html');
		$templateCache.put('ez-gridster.html', template);
    _timeout = $timeout;

    _scope = $rootScope.$new();

    el = angular.element('<div class="gridster" ez-gridster="widgets"></div>');

    _scope.widgets = [
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

    $compile(el)(_scope);
    _scope.$digest();
  }));

  it('should init gridster widgets', function() {
    assert.lengthOf(el.find('li'), 2);
    assert.isTrue(el.hasClass('gridster'));
  });

  it('should add widget to scope & gridster via controller broadcast event', function() {
    _scope.$apply(function() {
      _scope.$broadcast('ez_gridster.add_widget', {name: 'Test new widget'});
    });

    assert.lengthOf(el.find('li'), 3);
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
    }, 1000);
  });
});
