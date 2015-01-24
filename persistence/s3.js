var fs = require("fs");
var _ = require("lodash");
var AWS_SDK= require("aws-sdk");
var async = require("async");

module.exports = {

    initialize: function(server, fn){
        var self = this;
        this.server = server;

        AWS_SDK.config.update({
            region: options.region,
            credentials: {
                accessKeyId: options["access-key-id"],
                secretAccessKey: options["secret-access-key"]
            }
        });

        this.s3 = new AWS_SDK.S3();

        async.parallel([
            function(cb){
                self.s3.getObject({Bucket: self.server.options.bucket, Key: "records"}, function(err, records){
                    if(err && err.code == "NoSuchKey"){
                        self.s3.putObject({
                            Bucket: self.server.options.bucket,
                            Key: "records",
                            Body: JSON.stringify({}),
                            ContentType: "application/json"
                        }, function(err){
                            return cb();
                        });
                    }
                });
            },
            function(cb){
                self.s3.getObject({Bucket: self.server.options.bucket, Key: "forwarders"}, function(err, forwarders){
                    if(err && err.code == "NoSuchKey"){
                        self.s3.putObject({
                            Bucket: self.server.options.bucket,
                            Key: "forwarders",
                            Body: JSON.stringify({}),
                            ContentType: "application/json"
                        }, function(err){
                            return cb();
                        });
                    }
                });
            }
        ], function(err){
            return fn();
        });
    },

    return_error: function(error, fn){
        if(this.server.options.cli)
            return fn(error);
        else
            return fn(new Error(error.body));
    },

    get_configuration: function(fn){
        var self = this;

        var configuration = {};
        async.parallel([
            function(cb){
                self.s3.getObject({Bucket: self.server.options.bucket, Key: "records"}, function(err, records){
                    if(err)
                        configuration.records = {};
                    else{
                        try{
                            configuration.records = JSON.parse(records.Body);
                        }
                        catch(err){
                            configuration.records = {};
                        }
                    }
                    return cb();
                });
            },
            function(cb){
                self.s3.getObject({Bucket: self.server.options.bucket, Key: "forwarders"}, function(err, forwarders){
                    if(err)
                        configuration.forwarders = {};
                    else{
                        try{
                            configuration.forwarders = JSON.parse(forwarders.Body);
                        }
                        catch(err){
                            configuration.forwarders = {};
                        }
                    }

                    return cb();
                });
            }
        ], function(err){
            return fn(err, configuration);
        });
    },

    create_record: function(name, record, fn){
        var self = this;

        this.s3.getObject({Bucket: this.server.options.bucket, Key: "records"}, function(err, records){
            if(err)
                return self.return_error({code: 400, body: err.message}, fn);
            else{
                try{
                    var records = JSON.parse(records.Body);
                    if(_.has(records, name))
                        return self.return_error({code: 400, body: "Record already exists!"}, fn);
                    else{
                        records[name] = record;
                        self.s3.putObject({
                            Bucket: self.server.options.bucket,
                            Key: "records",
                            Body: JSON.stringify(records),
                            ContentType: "application/json"
                        }, function(err){
                            return self.server.update_configuration(fn);
                        });
                    }
                }
                catch(err){
                    return self.return_error({code: 400, body: err.message}, fn);
                }
            }
        });
    },

    update_record: function(name, record, fn){
        var self = this;

        this.s3.getObject({Bucket: this.server.options.bucket, Key: "records"}, function(err, records){
            if(err)
                return return_error({code: 400, body: err.message}, fn);
            else{
                try{
                    var records = JSON.parse(records.Body);
                    if(_.has(records, name)){
                        records[name] = record;
                        self.s3.putObject({
                            Bucket: self.server.options.bucket,
                            Key: "records",
                            Body: JSON.stringify(records),
                            ContentType: "application/json"
                        }, function(err){
                            return self.server.update_configuration();
                        });
                    }
                    else
                        return self.return_error({code: 404, body: "Record does not exist!"}, fn);
                }
                catch(err){
                    return self.return_error({code: 400, body: err.message}, fn);
                }
            }
        });
    },

    delete_record: function(name, fn){
        var self = this;

        this.s3.getObject({Bucket: this.server.options.bucket, Key: "records"}, function(err, records){
            if(err)
                return self.return_error({code: 400, body: err.message}, fn);
            else{
                try{
                    var records = JSON.parse(records.Body);
                    if(_.has(records, name)){
                        delete records[name];
                        self.s3.putObject({
                            Bucket: self.server.options.bucket,
                            Key: "records",
                            Body: JSON.stringify(records),
                            ContentType: "application/json"
                        }, function(err){
                            return self.server.update_configuration(fn);
                        });
                    }
                    else
                        return self.return_error({code: 404, body: "Record does not exist!"}, fn);
                }
                catch(err){
                    return self.return_error({code: 400, body: err.message}, fn);
                }
            }
        });
    },

    create_forwarder: function(name, forwarder, fn){
        var self = this;

        this.s3.getObject({Bucket: this.server.options.bucket, Key: "forwarders"}, function(err, forwarders){
            if(err)
                return self.return_error({code: 400, body: err.message}, fn);
            else{
                try{
                    var forwarders = JSON.parse(forwarders.Body);
                    if(_.has(forwarders, name))
                        return self.return_error({code: 400, body: "Forwarder already exists!"}, fn);
                    else{
                        forwarders[name] = forwarder;
                        self.s3.putObject({
                            Bucket: self.server.options.bucket,
                            Key: "forwarders",
                            Body: JSON.stringify(forwarders),
                            ContentType: "application/json"
                        }, function(err){
                            return self.server.update_configuration(fn);
                        });
                    }
                }
                catch(err){
                    return self.return_error({code: 400, body: err.message}, fn);
                }
            }
        });
    },

    update_forwarder: function(name, forwarder, fn){
        var self = this;

        this.s3.getObject({Bucket: this.server.options.bucket, Key: "forwarders"}, function(err, forwarders){
            if(err)
                return self.return_error({code: 400, body: err.message}, fn);
            else{
                try{
                    var forwarders = JSON.parse(forwarders.Body);
                    if(_.has(forwarders, name)){
                        forwarders[name] = forwarder;
                        self.s3.putObject({
                            Bucket: self.server.options.bucket,
                            Key: "forwarders",
                            Body: JSON.stringify(forwarders),
                            ContentType: "application/json"
                        }, function(err){
                            return self.server.update_configuration(fn);
                        });
                    }
                    else
                        return self.return_error({code: 404, body: "Forwarder does not exist!"}, fn);
                }
                catch(err){
                    return self.return_error({code: 400, body: err.message}, fn);
                }
            }
        });
    },

    delete_forwarder: function(name, fn){
        var self = this;

        this.s3.getObject({Bucket: this.server.options.bucket, Key: "forwarders"}, function(err, forwarders){
            if(err)
                return self.return_error({code: 400, body: err.message}, fn);
            else{
                try{
                    var forwarders = JSON.parse(forwarders.Body);
                    if(_.has(forwarders, name)){
                        delete forwarders[name];
                        self.s3.putObject({
                            Bucket: self.server.options.bucket,
                            Key: "forwarders",
                            Body: JSON.stringify(forwarders),
                            ContentType: "application/json"
                        }, function(err){
                            return self.server.update_configuration(fn);
                        });
                    }
                    else
                        return self.return_error({code: 404, body: "Forwarder does not exist!"}, fn);
                }
                catch(err){
                    return self.return_error({code: 400, body: err.message}, fn);
                }
            }
        });
    }

}

