var _ = require("lodash");
var persistence;

module.exports = {

    initialize: function(options){
        persistence = require([__dirname, "..", "..", "persistence", _.first(options._)].join("/"));
    },

    get: function(req, res, next){
        persistence.get_configuration(function(err, configuration){
            res.stash.body = configuration.forwarders;
            return next();
        });
    }

}

