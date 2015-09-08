#!/usr/bin/env node
var fs = require("fs");
var _ = require("lodash");
var dns = require("native-dns");
var nomnom = require("nomnom");
var pkg = require([__dirname, "package"].join("/"));
var utils = require([__dirname, "lib", "utils"].join("/"));
var logger = require([__dirname, "lib", "logger"].join("/"));
var statsd = require([__dirname, "lib", "statsd"].join("/"));
var Server = require([__dirname, "lib", "server"].join("/"));
var API = require([__dirname, "lib", "api"].join("/"));

// get configuration options
var configuration = {};
var available_configs = fs.readdirSync([__dirname, "config"].join("/"));
_.each(available_configs, function(config){
    var config_name = config.split(".")[0];
    configuration[config_name] = require([__dirname, "config", config].join("/"));
});

// set options
var disk_options = _.defaults(_.clone(configuration.default), _.clone(configuration.disk));
var memory_options = _.defaults(_.clone(configuration.default), _.clone(configuration.memory));
var mongo_options = _.defaults(_.clone(configuration.default), _.clone(configuration.mongo));
var redis_options = _.defaults(_.clone(configuration.default), _.clone(configuration.redis));
var s3_options = _.defaults(_.clone(configuration.default), _.clone(configuration.s3));

// initialize commands
nomnom.command("disk").options(disk_options);
nomnom.command("memory").options(memory_options);
nomnom.command("mongo").options(mongo_options);
nomnom.command("redis").options(redis_options);
nomnom.command("s3").options(s3_options);

// set script name
nomnom.script("quarry");

// parse options
var options = nomnom.parse(utils.parse_env_vars());

// init logger
logger.initialize(_.pick(options, [
    "log-level",
    "redis-log-host",
    "redis-log-port",
]));

logger.log("info", ["Starting Quarry version", pkg.version].join(" "));

// init statsd
statsd.initialize(_.pick(options, ["statsd-host", "statsd-port"]));

options.cli = true;

// initialize and start server
var server = new Server(options);
server.listen(function(){
    // initialize and start API
    var api = new API(options);
    api.listen();
});
