var _ = require("lodash");
var persistence;

module.exports = {

    initialize: function(options){
        persistence = require([__dirname, "..", "..", "persistence", _.first(options._)].join("/"));
    },

    get: function(req, res, next){
        persistence.get_configuration(function(err, configuration){
            if(_.has(configuration.forwarders, req.params.forwarder))
                res.stash.body = configuration.forwarders[req.params.forwarder];

            return next();
        });
    },

    create: function(req, res, next){
        _.defaults(req.body, {
            port: 53,
            timeout: 1000
        });
        persistence.create_forwarder(req.params.forwarder, _.pick(req.body, ["port", "timeout"]), function(err){
            if(err)
                res.stash = err;
            else
                res.stash.code = 201;

            return next();
        });
    },

    update: function(req, res, next){
        persistence.update_forwarder(req.params.forwarder, _.pick(req.body, ["port", "timeout"]), function(err){
            if(err)
                res.stash = err;
            else
                res.stash.code = 200;

            return next();
        });
    },

    delete: function(req, res, next){
        persistence.delete_forwarder(req.params.forwarder, function(err){
            if(err)
                res.stash = err;
            else
                res.stash.code = 204;

            return next();
        });
    }

}
