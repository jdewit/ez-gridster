ez-gridster
===========

A responsive grid/portlet directive that does all kinds of fancy stuff.

This is a fork of the excellent <a href="https://github.com/ManifestWebDesign/angular-gridster">Manifest Web Designs angular-gridster directive</a>. I needed some features that required breaking some backwards compatibility. 


##Demo

See <a href="https://rawgit.com/jdewit/ez-gridster/master/demo.html">Live Demo</a>

##Installation

```bash
  bower install ez-gridster
```

Then, import the following in your HTML alongside `jQuery` and `angular`:
```html
  <link rel="stylesheet" href="dist/ez-gridster.min.css" />
  <script src="dist/ez-gridster.min.js"></script>
  <script src="dist/ez-gridster-tpl.min.js"></script>
```

##Usage 

In your view
```html
<div ez-gridster="items">
  <img ng-src="{{ item.src }}"/>
  <div>{{ item.name }}</div>
</div>
```

In your controller:
```js
    $scope.items = [
		{
			name: 'Item 1',
      desktop: {
        col: 1,
        row: 1,
        sizeX: 3,
        sizeY: 4
      },
      tablet: {
        col: 1,
        row: 1,
        sizeX: 3,
        sizeY: 4
      }
      mobile: {
        col: 1,
        row: 1,
        sizeX: 3,
        sizeY: 4
      }
		}
    //... more items
	];
```

##Configuration

See <a href="src/js/constants/GridsterConfig.js">GridsterConfig</a> constant.

##Contributing

####Style Guide
Please respect the formatting specified in .editorconfig

####Grunt Tasks
```grunt default``` Runs jshint & compiles project

```grunt dev``` Opens demo page, starts karma test runner, runs unit tests on src & test folder changes

```grunt dev_e2e``` Watch src folder and run e2e tests on changes

```grunt test``` Runs the unit & e2e tests
