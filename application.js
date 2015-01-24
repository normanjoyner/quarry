var fs = require("fs");
var _ = require("lodash");
var pkg = require([__dirname, "package"].join("/"));
var logger = require([__dirname, "lib", "logger"].join("/"));
var statsd = require([__dirname, "lib", "statsd"].join("/"));
var Server = require([__dirname, "lib", "server"].join("/"));

module.exports = function(options){
    // get configuration options
    var configuration = {};
    var available_configs = fs.readdirSync([__dirname, "config"].join("/"));
    _.each(available_configs, function(config){
        var config_name = config.split(".")[0];
        configuration[config_name] = require([__dirname, "config", config].join("/"));
    });

    // set options
    var opts = {
        disk: _.defaults(_.clone(configuration.default), _.clone(configuration.disk)),
        memory: _.defaults(_.clone(configuration.default), _.clone(configuration.memory)),
        mongo: _.defaults(_.clone(configuration.default), _.clone(configuration.mongo)),
        redis: _.defaults(_.clone(configuration.default), _.clone(configuration.redis)),
        s3: _.defaults(_.clone(configuration.default), _.clone(configuration.s3))
    }

    if(!_.has(opts, options.persistence))
        return;

    var opts = opts[options.persistence];
    delete opts.version;
    delete opts["log-level"];
    delete opts["api-interface"];
    delete opts["api-port"];

    var meets_requirements = true;
    _.each(opts, function(schema, name){
        if(_.has(schema, "required") && schema.required == true && !_.has(options, name))
            meets_requirements = false;
    });

    if(!meets_requirements)
        return;

    var defaults = {};
    _.each(opts, function(schema, name){
        defaults[name] = schema.default;
    });

    _.defaults(options, defaults);
    options._ = [options.persistence];
    delete options.persistence;

    // disable logger
    logger.disable();

    // init statsd
    statsd.initialize(_.pick(options, ["statsd-host", "statsd-port"]));

    // return server
    var server = new Server(options);
    server.version = pkg.version;
    return server;
}
