var fs = require("fs");
var _ = require("lodash");

module.exports = {

    initialize: function(server, fn){
        this.server = server;
        this.records = {};
        this.forwarders = {};
        return fn();
    },

    get_configuration: function(fn){
        return fn(null, {
            records: this.records,
            forwarders: this.forwarders
        });
    },

    return_error: function(error, fn){
        if(this.server.options.cli)
            return fn(error);
        else
            return fn(new Error(error.body));
    },

    create_record: function(name, record, fn){
        if(_.has(this.records, name))
            return this.return_error({code: 400, body: "Record already exists!"}, fn);
        else{
            this.records[name] = record;
            return this.server.update_configuration(fn);
        }
    },

    update_record: function(name, record, fn){
        if(!_.has(this.records, name))
            return this.return_error({code: 404, body: "Record not found!"}, fn);
        else{
            this.records[name] = record;
            return this.server.update_configuration(fn);
        }
    },

    delete_record: function(name, fn){
        if(!_.has(this.records, name))
            return this.return_error({code: 404, body: "Record not found!"}, fn);
        else{
            delete this.records[name]
            return this.server.update_configuration(fn);
        }
    },

    create_forwarder: function(name, forwarder, fn){
        if(_.has(this.forwarders, name))
            return this.return_error({code: 400, body: "Forwarder already exists!"}, fn);
        else{
            this.forwarders[name] = forwarder;
            return this.server.update_configuration(fn);
            return fn();
        }
    },

    update_forwarder: function(name, forwarder, fn){
        if(!_.has(this.forwarders, name))
            return this.return_error({code: 404, body: "Forwarder not found!"}, fn)
        else{
            this.forwarders[name] = forwarder;
            return this.server.update_configuration(fn);
            return fn();
        }
    },

    delete_forwarder: function(name, fn){
        if(!_.has(this.forwarders, name))
            return this.return_error({code: 404, body: "Forwarder not found!"}, fn);
        else{
            delete this.forwarders[name];
            return this.server.update_configuration(fn);
            return fn();
        }
    }

}
