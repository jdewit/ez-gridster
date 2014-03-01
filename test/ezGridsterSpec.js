describe('ez-gridster', function() {
  var el, $scope, _rootScope, $timeout, widgets, GridsterService, EzGridsterConfig;

  beforeEach(module('ez.gridster'));

  beforeEach(inject(function($templateCache, _$rootScope_, _$timeout_, $compile, _GridsterService_, _EzGridsterConfig_) {

    template = '<li>{{ widget.name }}</li>';
    $templateCache.put('ez-gridster-widget.html', template);

    $timeout = _$timeout_;
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    GridsterService = _GridsterService_;
    EzGridsterConfig = _EzGridsterConfig_;

    el = angular.element('<div ez-gridster ez-gridster-config="options"></div>');

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

    $scope.options = {
      resize: {enabled: false}
    };

    $compile(el)($scope);
    $scope.$digest();

    GridsterService.setWidgets(widgets);

    $scope.$digest();
    $timeout.flush();
  }));

  it('should init gridster widgets', function() {
    assert.lengthOf(el.find('li'), 2);
    assert.isTrue(el.hasClass('gridster'));
  });

  it('should be able to override options', function() {
    assert.isUndefined(el.find('.gs-resize-handle').get(0));
  });

  it('should add widget', function() {
    var widget = {name: 'Test new widget', size_x: 1, size_y: 1};

    GridsterService.addWidget(widget);
    $scope.$digest();

    assert.lengthOf(el.find('li'), 3);
  });

  it('should remove widget', function(done) {
      GridsterService.removeWidget(el.find('.gs-w').eq(0), function() {
        assert.lengthOf(el.find('li'), 1);
        done();
      });
  });

  it('should clear gridster', function(done) {
    GridsterService.clear();
    $scope.$digest();

    setTimeout(function() {
      assert.lengthOf(el.find('li'), 0);
      done();
    }, 500);
  });

  it('should get next position', function() {
    var pos = GridsterService.nextPosition(1, 1);
    $scope.$digest();

    assert.equal(pos.row, 3);
    assert.equal(pos.col, 1);
  });

  it('should bind widget scope', function() {
    assert.equal(el.find('li:first-child').text(), 'FOO');
  });
});
