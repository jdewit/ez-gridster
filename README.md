ez-gridster
===========

This is a fork of the excellent <a href="https://github.com/ManifestWebDesign/angular-gridster">Manifest Web Designs angular-gridster directive</a>. I needed some features that required breaking some backwards compatibility. 


##Demo

See <a href="https://rawgit.com/jdewit/ez-gridster/master/demo.html">Live Demo</a>

##Usage

##Installation

```bash
  bower install ez-gridster
```

Then, import the following in your HTML alongside `jQuery` and `angular`:
```html
  <link rel="stylesheet" href="dist/angular-gridster.min.css" />
  <script src="src/angular-gridster.js"></script>
```

##usage 

In your view
```html
<div gridster="items"></div>
```

In your controller:
```js
    $scope.items = [
		{
			name: 'Item 1',
			col: 1,
			row: 1,
			sizeX: 3,
			sizeY: 4
		}
	];
```



##Configuration

See <a href="src/js/constants/gridsterConfig.js">gridsterConfig</a> constant.

##Contributing

####Install project dependencies
```bash
  npm install
  bower install
```

####Style Guide
Please respect the formatting specified in .editorconfig

####Grunt Tasks
```grunt default``` Runs jshint & compiles project

```grunt dev``` Opens demo page, starts karma test runner, runs unit tests on src & test folder changes

```grunt dev_e2e``` Watch src folder and run e2e tests on changes

```grunt test``` Runs the unit & e2e tests
