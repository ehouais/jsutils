define(['jquery'], function($) {
    var newId = function() {
        //return Date.now();
        return Math.random().toString(36).substr(2, 9);
    };
    return {
        local: function(options) {
            var save = function(id, data) {
                var deferred = $.Deferred();
                localStorage.setItem(options.prefix+'-'+id, JSON.stringify(data));
                deferred.resolve(id);
                return deferred.promise();
            };
            return {
                create: function(data) {
                    return save(options.prefix+'-'+newId(), data);
                },
                load: function(id) {
                    var deferred = $.Deferred();
                    deferred.resolve(JSON.parse(localStorage.getItem(options.prefix+'-'+id)));
                    return deferred.promise();
                },
                save: save,
                delete: function(id) {
                    var deferred = $.Deferred();
                    localStorage.removeItem(options.prefix+'-'+id);
                    deferred.resolve();
                    return deferred.promise();
                }
            };
        },
        http: function(options) {
            var enrich = function(params) {
                if (options.auth) {
                    params.xhrFields = {withCredentials: true};
                }
                return params;
            };

            return {
                create: function(data) {
                    var deferred = $.Deferred();
                    $.ajax(enrich({url: options.collection, type: 'POST', data: JSON.stringify(data)})).done(function(data, status, request) {
                        deferred.resolve(request.getResponseHeader('Content-Location'));
                    });
                    return deferred;
                },
                load: function(id) {
                    return $.ajax(enrich({url: id, dataType: 'json'}));
                },
                save: function(id, data) {
                    return $.ajax(enrich({url: id, type: 'PUT', contentType: 'application/json', data: JSON.stringify(data)}));
                },
                delete: function(id) {
                    return $.ajax(enrich({url: id, type: 'DELETE'}));
                }
            };
        },
        github: function(options) {
            return {
                create: function(data) {},
                load: function(id) {
                    var deferred = $.Deferred();
                    $.ajax({url: 'https://api.github.com/repos/'+id, dataType: 'jsonp'}).done(function(result) {
                        deferred.resolve(JSON.parse(atob(result.data.content.replace(/(\r\n|\n|\r)/gm, ''))));
                    });
                    return deferred;
                },
                save: function(id, data) {},
                delete: function(id) {}
            };
        },
        gist: function(options) {
            return {
                create: function(data) {},
                load: function(id) {
                    var deferred = $.Deferred(),
                        parts = id.split('/');
                    $.ajax({url: 'https://api.github.com/gists/'+parts[0], dataType: 'jsonp'}).done(function(result) {
                        deferred.resolve(JSON.parse(result.files[parts[1]].content));
                    });
                    return deferred;
                },
                save: function(id, data) {},
                delete: function(id) {}
            };
        },
        gss: function(options) {
            return {
                load: function(id) {
                    var deferred = $.Deferred();
                    require(['tabletop'], function(Tabletop) {
                        Tabletop.init({
                            key: id, // public URL or public key
                            callback: function(result) {
                                deferred.resolve(result);
                            },
                            simpleSheet: options.simpleSheet
                        });
                    });
                    return deferred;
                }
            };
        },
        // OpenKeyval: 64KiB max. per key - site presently not working
        openkeyval: function(options) {
            return {
                create: function(data) {
                    var id = newId(),
                        deferred = $.Deferred();
                    $.ajax({url: 'http://api.openkeyval.org/store/', data: options.prefix+'-'+id+'='+JSON.stringify(data), dataType: 'jsonp'}).done(function() {
                        deferred.resolve(id);
                    });
                    return deferred;
                },
                load: function(id) {
                    var deferred = $.Deferred();
                    $.ajax({url: 'http://api.openkeyval.org/'+options.prefix+'-'+id, dataType: 'jsonp'}).done(function(result) {
                        deferred.resolve(JSON.parse(result));
                    });
                    return deferred;
                },
                save: function(id, data) {
                    return $.ajax({url: 'http://api.openkeyval.org/store/', data: options.prefix+'-'+id+'='+JSON.stringify(data), dataType: 'jsonp'});
                },
                delete: function(id) {}
            }
        }
    };
});
