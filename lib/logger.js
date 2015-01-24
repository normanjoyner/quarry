var _ = require("lodash");
var winston = require("winston");

module.exports = {

    // logging client
    logger: null,
    enabled: true,

    // initialize
    initialize: function(options){
        this.logger = new(winston.Logger);

        this.logger.add(winston.transports.Console, {
            level: options["log-level"],
            colorize: true
        });
    },

    // write a log
    log: function(level, message){
        if(this.enabled)
            this.logger.log(level, message);
    },

    // disable logging
    disable: function(){
        this.enabled = false
    }

}
