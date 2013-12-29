describe('ez-gridster', function() {
  var el, _scope, _timeout;

  beforeEach(module('ez.gridster'));

  beforeEach(inject(function($templateCache, $rootScope, $timeout, $compile) {

		template = $templateCache.get('src/ez-gridster-tpl.html');
		$templateCache.put('ez-gridster.html', template);
    _timeout = $timeout;

    //gridster = {
      //add_widget: function() {
        //$(this).append('<li></li>');
      //}
    //};

    _scope = $rootScope.$new();

    el = angular.element('<div><div class="gridster" gridster widgets="widgets"></div></div>');

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
  });

  it('should add widget to scope & gridster via controller broadcast event', function() {
    _scope.$apply(function() {
      _scope.$broadcast('ez-gridster.add_widget', {name: 'Test new widget'});
    });

    assert.lengthOf(el.find('li'), 3);
  });

  it('should remove widget from scope & gridster via remove method', function(done) {
    el.find('a').first().click();
    _timeout.flush();
    _scope.$digest();

    setTimeout(function() { // need to wait for gridster to use callback
      done();
      assert.lengthOf(el.find('li'), 1);
    }, 1000);
  });
});
