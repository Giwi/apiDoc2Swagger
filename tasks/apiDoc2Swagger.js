/*
 * grunt-apiDoc2Swagger
 * https://github.com/Giwi/apiDoc2Swagger
 *
 * Copyright (c) 2015 Xavier MARIN
 * Licensed under the MIT license.
 */
'use strict';
module.exports = function (grunt) {

    // Please see the Grunt documentation for more information regarding task
    // creation: http://gruntjs.com/creating-tasks

    grunt.registerMultiTask('apidoc2swagger', 'Convert apidocjs files to Swagger', function () {

        function normalize(obj, key, models) {
            grunt.log.verbose.ok(key +" -> "  +grunt.util.kindOf(obj));
            switch(grunt.util.kindOf(obj)) {
                case "number" :
                    return {type : "integer",format: "int64"};
                case "string" :
                    return {type : "string"};
                case "boolean" :
                    return {type : "boolean"};
                case "object" :
                    if(!models[key]) {
                        models[key]= {
                            id : key,
                            properties : {}
                        };
                        for(var k in obj) {
                            grunt.log.verbose.warn(">>> " + key + "->" +k);
                            models[key].properties[k] = normalize(obj[k], k, models);
                        }
                    }
                    return  {'$ref' : key};
            }
        }

        var done = this.async();

        // Merge task-specific and/or target-specific options with these defaults.
        var options = this.options({
            swagger: 'swagger',
            apiData: 'api_data.json',
            apiProject: 'api_project.json',
            swaggerVersion: '1.2',
            basePath: 'http://localhost'
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
            var swaggerMain = {swaggerVersion: options.swaggerVersion, info: {}, apis: []};
            swaggerMain.apiVersion = projectSrc.version;
            swaggerMain.info.title = projectSrc.name;
            swaggerMain.info.description = projectSrc.description.replace(/<\/?[^>]+(>|$)/g, "");

            var apiCollection = [];
            var apiNames = [];

            dataSrc.forEach(function (api) {
                if (!apiCollection[api.group]) {
                    grunt.log.verbose.ok("found : " + api.group);
                    apiNames.push(api.group);
                    apiCollection[api.group] = {
                        swaggerVersion: options.swaggerVersion,
                        apis: [{path : api.url, operations : []}],
                        apiVersion: api.version,
                        basePath: options.basePath,
                        resourcePath: '/',
                        path: '/',
                        models : {},
                        produces: ["application/json"]
                };
            }
                var ope = {
                    method: api.type,
                    summary: api.description.replace(/<\/?[^>]+(>|$)/g, ""),
                    notes: api.group, nickname: api.name,
                    parameters: []
                };
                if (api.error) {
                    ope.responseMessages = {code: 400, message: api.error.fields['Error 4xx'].field};
                }
                if (api.success) {
                    ope.type = api.success.fields['Success 200'].type;
                    ope.item = {'$ref': api.success.fields['Success 200'].field};
                }
                if (api.parameter) {
                    api.parameter.fields.Parameter.forEach(function (param) {
                        var myParam ={
                            name: param.field,
                            description: param.description.replace(/<\/?[^>]+(>|$)/g, ""),
                            required: param.optional,
                            type: param.type
                        };
                        if(api.url.indexOf("?" + myParam.name + "=") >0, api.url.indexOf("&" + myParam.name + "=") >0) {
                            myParam.paramType = "query";
                        } else if(api.url.indexOf(":" + myParam.name) >0) {
                            myParam.paramType = "path";
                        } else {
                            myParam.paramType  ="body";
                        }
                        if(api.parameter.examples) {
                            api.parameter.examples.forEach(function(example) {
                               if(example.title === myParam.name) {
                                   myParam.type = myParam.name;
                                   grunt.log.warn(myParam.type);
                                   if(!apiCollection[api.group].models[myParam.type]) {
                                       apiCollection[api.group].models[myParam.type] = {
                                           id : myParam.type,
                                           properties : {}
                                       };
                                       var content = JSON.parse(example.content);
                                       for(var k in content) {
                                           apiCollection[api.group].models[myParam.type].properties[k] = normalize(content[k], k, apiCollection[api.group].models);
                                       }
                                   }
                               }
                            });
                        }
                        ope.parameters.push(myParam);
                    });
                }
                if(api.header) {
                    api.header.fields.Header.forEach(function (param) {
                        ope.parameters.push({
                            name: param.field,
                            description: param.description.replace(/<\/?[^>]+(>|$)/g, ""),
                            required: param.optional,
                            type: param.type,
                            paramType : 'header'
                        });
                    });
                }


                grunt.log.verbose.ok("Pushing " + ope.nickname +" to " + api.group);
                apiCollection[api.group].apis.push({path : api.url, operations : [ope]});
            });
            apiNames.forEach(function (key) {
                var api = apiCollection[key];
                grunt.log.verbose.ok("Writing " + api.path);
                swaggerMain.apis.push({
                    path: '/../' +key + '.json',
                    description: key
                });
                grunt.file.write(options.swagger + '/' + key + '.json', JSON.stringify(api, null, 2));
            });

            grunt.file.write(options.swagger + '/index.json', JSON.stringify(swaggerMain, null, 2));
            done();
        }
    });
};
