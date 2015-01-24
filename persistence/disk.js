var fs = require("fs");
var _ = require("lodash");

module.exports = {

    initialize: function(server, fn){
        var self = this;
        this.server = server;

        var resolve_path = function(fn){
            fs.realpath(self.server.options["file-location"], function(err, path){
                self.cache_path = path;
                return fn();
            });
        }

        resolve_path(function(){
            fs.readFile(self.server.options["file-location"], function(err, contents){
                try{
                    contents = JSON.parse(contents.toString());
                    if(!_.has(contents, "records"))
                        contents.records = {};
                    if(!_.has(contents, "forwarders"))
                        contents.forwarders = {};
                }
                catch(err){
                    contents = {
                        records: {},
                        forwarders: {}
                    }
                }
                fs.writeFile(self.server.options["file-location"], JSON.stringify(contents), function(err, contents){
                    resolve_path(function(){
                        return fn(err);
                    });
                });
            });
        });
    },

    get_configuration: function(fn){
        if(_.has(require.cache, this.cache_path))
            delete require.cache[this.cache_path];

        var configuration = require(this.cache_path);
        return fn(null, configuration);
    },

    return_error: function(error, fn){
        if(this.server.options.cli)
            return fn(error);
        else
            return fn(new Error(error.body));
    },

    create_record: function(name, record, fn){
        var self = this;

        fs.readFile(this.cache_path, function(err, contents){
            if(err)
                return self.return_error({code: 400, body: err.message}, fn);

            try{
                contents = JSON.parse(contents.toString());
                if(_.has(contents.records, name))
                    return self.return_error({code: 400, body: "Record already exists!"}, fn);
                else
                    contents.records[name] = record;
            }
            catch(err){
                return self.return_error({code: 400, body: err.message}, fn);
            }

            fs.writeFile(self.cache_path, JSON.stringify(contents), function(err){
                if(err)
                    return self.return_error({code: 400, body: err.message}, fn);
                else
                    return self.server.update_configuration(fn);
            });
        });
    },

    update_record: function(name, record, fn){
        var self = this;

        fs.readFile(this.cache_path, function(err, contents){
            if(err)
                return self.return_error({code: 400, body: err.message}, fn);

            try{
                contents = JSON.parse(contents.toString());
                if(_.has(contents.records, name))
                    contents.records[name] = record;
                else
                    return self.return_error({code: 404, body: "Record does not exist!"}, fn);
            }
            catch(err){
                return self.return_error({code: 400, body: err.message}, fn);
            }

            fs.writeFile(self.cache_path, JSON.stringify(contents), function(err, contents){
                if(err)
                    return self.return_error({code: 400, body: err.message}, fn);
                else
                    self.server.update_configuration(fn);
            });
        });
    },

    delete_record: function(name, fn){
        var self = this;

        fs.readFile(this.cache_path, function(err, contents){
            if(err)
                return self.return_error({code: 400, body: err.message}, fn);

            try{
                contents = JSON.parse(contents.toString());
                if(_.has(contents.records, name))
                    delete contents.records[name];
                else
                    return self.return_error({code: 404, body: "Record does not exist!"}, fn);
            }
            catch(err){
                return self.return_error({code: 400, body: err.message}, fn);
            }

            fs.writeFile(self.cache_path, JSON.stringify(contents), function(err){
                if(err)
                    return self.return_error({code: 400, body: err.message}, fn);
                else
                    self.server.update_configuration(fn);
            });
        });
    },

    create_forwarder: function(name, forwarder, fn){
        var self = this;

        fs.readFile(this.cache_path, function(err, contents){
            if(err)
                return self.return_error({code: 400, body: err.message}, fn);

            try{
                contents = JSON.parse(contents.toString());
                if(_.has(contents.forwarders, name))
                    return self.return_error({code: 400, body: "Forwarder already exists!"}, fn);
                else
                    contents.forwarders[name] = forwarder;
            }
            catch(err){
                return self.return_error({code: 400, body: err.message}, fn);
            }

            fs.writeFile(self.cache_path, JSON.stringify(contents), function(err){
                if(err)
                    return self.return_error({code: 400, body: err.message}, fn);
                else
                    self.server.update_configuration(fn);
            });
        });
    },

    update_forwarder: function(name, forwarder, fn){
        var self = this;

        fs.readFile(this.cache_path, function(err, contents){
            if(err)
                return self.return_error({code: 400, body: err.message}, fn);

            try{
                contents = JSON.parse(contents.toString());
                if(_.has(contents.forwarders, name))
                    contents.forwarders[name] = forwarder;
                else
                    return self.return_error({code: 404, body: "Forwarder does not exist!"}, fn);
            }
            catch(err){
                return self.return_error({code: 400, body: err.message}, fn);
            }

            fs.writeFile(self.cache_path, JSON.stringify(contents), function(err){
                if(err)
                    return self.return_error({code: 400, body: err.message}, fn);
                else
                    self.server.update_configuration(fn);
            });
        });
    },

    delete_forwarder: function(name, fn){
        var self = this;

        fs.readFile(this.cache_path, function(err, contents){
            if(err)
                return self.return_error({code: 400, body: err.message}, fn);

            try{
                contents = JSON.parse(contents.toString());
                if(_.has(contents.forwarders, name))
                    delete contents.forwarders[name];
                else
                    return self.return_error({code: 404, body: "Forwarder does not exist!"}, fn);
            }
            catch(err){
                return self.return_error({code: 400, body: err.message}, fn);
            }

            fs.writeFile(self.cache_path, JSON.stringify(contents), function(err){
                if(err)
                    return self.return_error({code: 400, body: err.message}, fn);
                else
                    self.server.update_configuration(fn);
            });
        });
    }

}
