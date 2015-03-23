# grunt-apiDoc2Swagger

> Convert [apidocjs](http://apidocjs.com) files to [Swagger](http://swagger.io)

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-apidoc2swagger --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-apidoc2swagger');
```

## The "apiDoc2Swagger" task

### Overview
In your project's Gruntfile, add a section named `apidoc2swagger` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  apidoc2swagger: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      // Target-specific file lists and/or options go here.
    },
  },
});
```

### Options.

#### options.apiProject
Type: `String`
Default value: `'api_project.json'`

A path to your generated api_project.json

#### options.apiData
Type: `String`
Default value: `'api_data.json'`

A path to your generated api_data.json

#### options.swagger
Type: `String`
Default value: `'swagger'`

Result target directory path

### options.basePath
Type: 'String'
Default value: 'http://localhost'

Your server URL if you want to test your API with [Swagger-ui](https://github.com/swagger-api/swagger-ui)

### Usage Examples

#### Default Options

```js
grunt.initConfig({
  apidoc2swagger: {
    testAPI : {
      options: {
        apiProject: 'test/api_project.json',
        apiData: 'test/api_data.json',
        swagger: 'output/',
        swaggerVersion: '1.2',
        basePath : 'http://localhost'
      }
    }
  }
});
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History

### 1.2.0
Swagger 2.0 support
### 1.1.10
Some bug fixes

### 1.1.1
First release