var fs = require("fs");
var _ = require("lodash");
var mongo = require("mongodb").MongoClient;
var async = require("async");

module.exports = {

    initialize: function(server, fn){
        var self = this;
        this.server = server;

        mongo.connect(["mongodb://", this.server.options["mongo-host"], ":", this.server.options["mongo-port"], "/", this.server.options["mongo-database"]].join(""), function(err, client){
            self.client = client;
            return fn();
        });
    },

    get_configuration: function(fn){
        var self = this;
        var configuration = {};

        async.parallel([
            function(cb){
                var collection = self.client.collection("quarry:records");
                collection.find({}).toArray(function(err, records){
                    configuration.records = {};
                    if(records){
                        _.each(records, function(record){
                            var name = record._id;
                            delete record._id;
                            configuration.records[name] = record;
                        });
                    }
                    return cb();
                });
            },
            function(cb){
                var collection = self.client.collection("quarry:forwarders");
                collection.find({}).toArray(function(err, forwarders){
                    configuration.forwarders = {};
                    if(forwarders){
                        _.each(forwarders, function(forwarder){
                            var name = forwarder._id;
                            delete forwarder._id;
                            configuration.forwarders[name] = forwarder;
                        });
                    }
                    return cb();
                });
            }
        ], function(err){
            return fn(err, configuration);
        });
    },

    return_error: function(error, fn){
        if(this.server.options.cli)
            return fn(error);
        else
            return fn(new Error(error.body));
    },

    create_record: function(name, record, fn){
        var collection = this.client.collection("quarry:records");
        collection.insert(_.merge(record, {_id: name}), function(err, result){
            if(err)
                return self.return_error({code: 400, body: "Record already exists!"}, fn);
            else
                return self.server.update_configuration(fn);
        });
    },

    update_record: function(name, record, fn){
        var collection = this.client.collection("quarry:records");
        collection.update({_id: name}, {$set: record}, function(err, result){
            if(err)
                return self.return_error({code: 400, body: err.message}, fn);
            else if(result == 0)
                return self.return_error({code: 404, body: "Record does not exist"}, fn);
            else
                return self.server.update_configuration(fn);
        });
    },

    delete_record: function(name, fn){
        var collection = this.client.collection("quarry:records");
        collection.remove({_id: name}, function(err, result){
            if(err)
                return self.return_error({code: 400, body: err.message}, fn);
            else if(result == 0)
                return self.return_error({code: 404, body: "Record does not exist"}, fn);
            else
                return self.server.update_configuration(fn);
        });
    },

    create_forwarder: function(name, forwarder, fn){
        var collection = this.client.collection("quarry:forwarders");
        collection.insert(_.merge(forwarder, {_id: name}), function(err, result){
            if(err)
                return self.return_error({code: 400, body: "Forwarder already exists!"}, fn);
            else
                return self.server.update_configuration(fn);
        });
    },

    update_forwarder: function(name, forwarder, fn){
        var collection = this.client.collection("quarry:forwarders");
        collection.update({_id: name}, {$set: forwarder}, function(err, result){
            if(err)
                return self.return_error({code: 400, body: err.message}, fn);
            else if(result == 0)
                return self.return_error({code: 404, body: "Forwarder does not exist"}, fn);
            else
                return self.server.update_configuration(fn);
        });
    },

    delete_forwarder: function(name, fn){
        var collection = this.client.collection("quarry:forwarders");
        collection.remove({_id: name}, function(err, result){
            if(err)
                return self.return_error({code: 400, body: err.message}, fn);
            else if(result == 0)
                return self.return_error({code: 404, body: "Forwarder does not exist"}, fn);
            else
                return self.server.update_configuration(fn);
        });
    }

}

