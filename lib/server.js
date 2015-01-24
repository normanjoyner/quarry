var dns = require("native-dns");
var _ = require("lodash");
var utils = require([__dirname, "utils"].join("/"));
var logger = require([__dirname, "logger"].join("/"));
var statsd = require([__dirname, "statsd"].join("/"));

// Server object
function Server(options){
    var self = this;

    // initialize server and options
    this.server = dns.createServer();
    this.options = options;

    // listen for requests
    this.server.on("request", function(req, res){
        var query = req.question[0].name;

        // check if record exists
        if(_.has(self.records, query)){
            res.answer = self.records[query];
            res.send();
        }

        // proxy to upstream server if one is configured
        else if(_.keys(self.forwarders).length > 0){
            var forwarder = self.get_forwarder(query);

            forwarder.on("timeout", function(){
                logger.log("verbose", "Timed out fetching from upstream DNS server");
                logger.log("debug", ["Record: ", query, ", Server: ", forwarder.server.address].join(""));
                statsd.timeout();
                res.send();
            });

            forwarder.on("message", function(err, answer){
                res.answer = answer.answer;
                res.send();
            });

            forwarder.send();
        }

        // respond with no answer
        else
            res.send();
    });

    // listen for errors
    this.server.on("error", function(err, buff, req, res){
        logger.log("error", err.message);
        statsd.error();
    });

}

// get an upstream DNS server
Server.prototype.get_forwarder = function(query){
    var forwarder_name = _.sample(_.keys(this.forwarders));
    var forwarder = this.forwarders[forwarder_name];

    var request = dns.Request({
        question: dns.Question({
            name: query,
            type: "A"
        }),

        server: {
            address: forwarder_name,
            port: forwarder.port,
            type: "udp"
        },

        timeout: forwarder.timeout
    });

    return request;
}

// update configuration from backend
Server.prototype.update_configuration = function(fn){
    var self = this;
    logger.log("verbose", "Updating configuration");

    this.persistence.get_configuration(function(err, configuration){
        if(err)
            logger.log("error", err.message);
        else{
            self.forwarders = configuration.forwarders;
            var records = {};
            _.each(configuration.records, function(record, name){
                var record = utils.standardize(name, record);
                records[name] = record;
            });
            self.records = records;

            statsd.forwarders(_.keys(self.forwarders).length);
            logger.log("verbose", [_.keys(self.forwarders).length, "known forwarders"].join(" "));
            logger.log("debug", ["Forwarders:", _.keys(self.forwarders).join(", ")].join(" "));

            statsd.records(_.keys(self.records).length);
            logger.log("verbose", [_.keys(self.records).length, "known records"].join(" "));
            logger.log("debug", ["Records:", _.keys(self.records).join(", ")].join(" "));
            return fn();
        }
    });
}

// start listening
Server.prototype.listen = function(fn){
    var self = this;

    // initialize persistence layer
    this.persistence = require([__dirname, "..", "persistence", _.first(this.options._)].join("/"));
    this.persistence.initialize(this, function(err){
        // update configuration on interval
        self.update_configuration(function(){
            self.server.serve(self.options.port);
            logger.log("info", ["DNS server listening on", [self.options.interface, self.options.port].join(":")].join(" "));
            return fn();
        });
    });
}

module.exports = Server;
