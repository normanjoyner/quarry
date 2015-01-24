var _ = require("lodash");
var fs = require("fs");
var express = require("express");
var body_parser = require("body-parser");
var middleware = require([__dirname, "middleware"].join("/"));
var logger = require([__dirname, "logger"].join("/"));

function API(options){
    this.options = options;
    this.server = express();

    this.server.use(body_parser.json());
    this.server.disable("x-powered-by");

    // set required pre-operation middleware
    this.server.use(middleware.init_response);
    this.server.use(middleware.json_request);

    // register the routes
    var routes = require([__dirname, "..", "routes"].join("/"));
    routes.register(this.server, options);

    // set required post-operation middleware
    this.server.use(middleware.handle_response);
}

API.prototype.listen = function(){
    this.server.listen(this.options["api-port"], this.options["api-interface"]);
    logger.log("info", ["API server listening on", [this.options["api-interface"], this.options["api-port"]].join(":")].join(" "));
}

module.exports = API;
