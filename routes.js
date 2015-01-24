var fs = require("fs");
var _ = require("lodash");
var middleware = require([__dirname, "lib", "middleware"].join("/"));

// register handlers
exports.register = function(server, options){
    var handlers = {};
    var available_versions = fs.readdirSync([__dirname, "handlers"].join("/"));
    _.each(available_versions, function(api_version){
        handlers[api_version] = {};
        var available_handlers = fs.readdirSync([__dirname, "handlers", api_version].join("/"));
        _.each(available_handlers, function(handler){
            var handler_name = handler.split(".")[0];
            handlers[api_version][handler_name] = require([__dirname, "handlers", api_version, handler].join("/"));
            handlers[api_version][handler_name].initialize(options);
        });
    });

    // get records
    server.get("/v1/records", handlers.v1.records.get);

    // get record
    server.get("/v1/records/:record", handlers.v1.record.get);

    // create record
    server.post("/v1/records/:record", handlers.v1.record.create);

    // update record
    server.put("/v1/records/:record", handlers.v1.record.update);

    // delete record
    server.delete("/v1/records/:record", handlers.v1.record.delete);

    // get forwarders
    server.get("/v1/forwarders", handlers.v1.forwarders.get);

    // get forwarder
    server.get("/v1/forwarders/:forwarder", handlers.v1.forwarder.get);

    // create forwarder
    server.post("/v1/forwarders/:forwarder", handlers.v1.forwarder.create);

    // update forwarder
    server.put("/v1/forwarders/:forwarder", handlers.v1.forwarder.update);

    // delete forwarder
    server.delete("/v1/forwarders/:forwarder", handlers.v1.forwarder.delete);
}
