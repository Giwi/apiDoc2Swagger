(function() {
    'use strict';
    /*
     * grunt-apiDoc2Swagger https://github.com/Giwi/apiDoc2Swagger
     *
     * Copyright (c) 2015 Xavier MARIN Licensed under the MIT license.
     */
    var htmlToText = require('html-to-text');
    module.exports = function(grunt) {
        grunt.registerMultiTask('apidoc2swagger', 'Convert apidocjs files to Swagger', function() {

            function normalize(obj, key, models) {
                grunt.log.verbose.debug(key + " -> " + grunt.util.kindOf(obj));
                switch (grunt.util.kindOf(obj)) {
                    case "number":
                        return {
                            type : "integer",
                            format : "int64"
                        };
                    case "string":
                        return {
                            type : "string"
                        };
                    case "boolean":
                        return {
                            type : "boolean"
                        };
                    case "object":
                        if (!models[key]) {
                            models[key] = {
                                properties : {}
                            };
                            for ( var k in obj) {
                                grunt.log.verbose.debug(">>> " + key + "->" + k);
                                models[key].properties[k] = normalize(obj[k], k, models);
                            }
                        }
                        return {
                            '$ref' : '#/definitions/' + key
                        };
                }
            }

            var done = this.async();

            // Merge task-specific and/or target-specific options with these
            // defaults.
            var options = this.options({
                swagger : 'swagger',
                apiData : 'api_data.json',
                apiProject : 'api_project.json',
                swaggerVersion : '2.0',
                basePath : 'http://localhost'
            });

            var apiProject = options.apiProject;
            var apiData = options.apiData;

            // Warn on and remove invalid source files (if nonull was set).
            if (!grunt.file.exists(apiProject)) {
                grunt.log.error('Project file "' + apiProject + '" not found.');
                return false;
            } else if (!grunt.file.exists(apiData)) {
                grunt.log.error('Data file "' + apiData + '" not found.');
                return false;
            } else {
                grunt.log.ok('Project file : ' + apiProject);
                grunt.log.ok('Data file : ' + apiData);
                var projectSrc = grunt.file.readJSON(apiProject);
                var dataSrc = grunt.file.readJSON(apiData);
                var tags = {};
                var swaggerMain = {
                    swagger : options.swaggerVersion,
                    info : {},
                    paths : {},
                    definitions : {},
                    tags : []
                };
                var models = [];
                swaggerMain.apiVersion = projectSrc.version;
                swaggerMain.info.title = projectSrc.name;
                swaggerMain.info.description = projectSrc.header.content;
                dataSrc.forEach(function(api) {
                    grunt.log.ok(api.url);
                    if (!swaggerMain.paths[api.url]) {
                        swaggerMain.paths[api.url] = {};
                    }
                    if(!tags[api.group]) {
                        grunt.log.verbose.debug('not found : ' + api.group)
                        tags[api.group] = {name : api.group};
                    }
                    var method = api.type.toLowerCase();
                    swaggerMain.paths[api.url][method] = {
                        description : htmlToText.fromString(api.description),
                        summary : htmlToText.fromString(api.title),
                        operationId : htmlToText.fromString(api.name),
                        consumes : [ 'application/json' ],
                        produces : [ 'application/json' ],
                        parameters : [],
                        responses : {},
                        tags : []

                    };
                    swaggerMain.paths[api.url][method].tags.push(api.group);
                    if (api.error) {
                        swaggerMain.paths[api.url][method].responses['xxx'] = {
                            description: htmlToText.fromString(api.error.fields['Error 4xx'][0].description),
                            schema : {
                                '$ref' : '#/definitions/' +api.error.fields['Error 4xx'][0].field
                            }
                        };

                        if (api.error.examples) {
                            api.error.examples.forEach(function(example) {
                                swaggerMain.definitions[example.title] ={
                                    properties : {}
                                };
                                var content = JSON.parse(example.content);
                                for ( var k in content) {
                                    grunt.log.verbose.debug(k + " -> " + JSON.stringify(content[k]));
                                    swaggerMain.definitions[example.title].properties[k] = normalize(content[k], k, swaggerMain.definitions);
                                }
                            });
                        }
                    }
                    if (api.success) {
                        swaggerMain.paths[api.url][method].responses['200']= {
                            description : htmlToText.fromString(api.success.fields['Success 200'][0].description),
                            schema : {}
                        };
                        if('Object' === api.success.fields['Success 200'][0].type) {
                            swaggerMain.paths[api.url][method].responses['200'].schema['$ref'] = '#/definitions/' + api.success.fields['Success 200'][0].field;
                        } else {
                            swaggerMain.paths[api.url][method].responses['200'].schema.type =  api.success.fields['Success 200'][0].type;
                        }
                        if (api.success.examples) {
                            api.success.examples.forEach(function(example) {
                                swaggerMain.definitions[example.title] ={
                                    properties : {}
                                };
                                var content = JSON.parse(example.content);
                                for ( var k in content) {
                                    grunt.log.verbose.debug(k + " -> " + JSON.stringify(content[k]));
                                    swaggerMain.definitions[example.title].properties[k] = normalize(content[k], k, swaggerMain.definitions);
                                }
                            });
                        }
                    }
                    if (api.header) {
                        api.header.fields.Header.forEach(function(param) {
                            swaggerMain.paths[api.url][method].parameters.push({
                                name : param.field,
                                description : htmlToText.fromString(param.description),
                                required : param.optional,
                                type : param.type,
                                paramType : 'header'
                            });
                        });
                    }
                    if (api.parameter) {
                        api.parameter.fields.Parameter.forEach(function(param) {
                            var myParam = {
                                name : param.field,
                                description : htmlToText.fromString(param.description),
                                required : param.optional,
                                type : param.type
                            };
                            if (api.url.indexOf("?" + myParam.name + "=") > 0, api.url.indexOf("&" + myParam.name + "=") > 0) {
                                myParam.paramType = "query";
                            } else if (api.url.indexOf(":" + myParam.name) > 0) {
                                myParam.in = "path";
                            } else {
                                myParam.in= "body";
                            }
                            if (api.parameter.examples) {
                                grunt.log.verbose.debug(JSON.stringify(api.parameter.examples));

                                api.parameter.examples.forEach(function(example) {
                                    myParam.type = example.title;
                                    swaggerMain.definitions[example.title] ={
                                        properties : {}
                                    };
                                    var content = JSON.parse(example.content);
                                    for ( var k in content) {
                                        grunt.log.verbose.debug(k + " -> " + JSON.stringify(content[k]));
                                        swaggerMain.definitions[example.title].properties[k] = normalize(content[k], k, swaggerMain.definitions);
                                    }
                                });
                                myParam.schema = {'$ref' : '#/definitions/' + myParam.type};
                            }
                            swaggerMain.paths[api.url][method].parameters.push(myParam);
                        });
                    }
                });
                grunt.log.verbose.debug(JSON.stringify(tags));
                Object.keys(tags).forEach(function(t) {swaggerMain.tags.push(tags[t])});
                grunt.file.write(options.swagger + '/index.json', JSON.stringify(swaggerMain, null, 2));
                done();
            }
        });
    };
}());