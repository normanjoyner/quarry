var _ = require("lodash");
var logger = require([__dirname, "logger"].join("/"));
var statsd = require([__dirname, "statsd"].join("/"));

module.exports = {
    // ensure client accepts json
    json_request: function(req, res, next){
        if(req.accepts("application/json"))
            return next();

        res.stash.code = 406;
        _.last(req.route.stack).handle(req, res, next);
    },

    // init response
    init_response: function(req, res, next){
        res.stash = {};
        res.response_start = new Date();
        return next();
    },

    // respond to client
    handle_response: function(req, res, next){
        res.setHeader("X-Quarry-Response-Time", new Date() - res.response_start);

        res.stash = _.defaults(res.stash, {
            code: 404
        });

        if(_.has(res.stash, "body"))
            res.status(res.stash.code).json(res.stash.body);
        else
            res.sendStatus(res.stash.code);

        statsd.response_code(res.stash.code);

        logger.log("debug", [req.ip, "-", ["HTTP", req.httpVersion].join("/"), req.method, req.url, "-", res.stash.code].join(" "));
    }
}
