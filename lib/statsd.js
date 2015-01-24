var os = require("os");
var _ = require("lodash");
var StatsD = require("node-statsd").StatsD;

module.exports = {

    initialize: function(options){
        var hostname = _.first(os.hostname().split("."));
        if(_.has(options, "statsd-host")){
            this.client = new StatsD({
                host: options["statsd-host"],
                port: options["statsd-port"],
                prefix: ["quarry", hostname, ""].join(".")
            });
        }
    },

    error: function(){
        if(_.has(this, "client"))
            this.client.increment("errors");
    },

    timeout: function(){
        if(_.has(this, "client"))
            this.client.increment("forwarder.timeout");
    },

    records: function(records){
        if(_.has(this, "client"))
            this.client.gauge("records", records);
    },

    forwarders: function(forwarders){
        if(_.has(this, "client"))
            this.client.gauge("forwarders", forwarders);
    },

    response_code: function(code){
        if(_.has(this, "client"))
            this.client.increment(["response_codes", code].join("."));
    }

}
