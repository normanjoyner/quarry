var _ = require("lodash");
var winston = require("winston");
require("winston-redis").Redis;

module.exports = {

    // logging client
    logger: null,
    enabled: true,

    // initialize
    initialize: function(options){
        this.logger = new(winston.Logger);

        if(_.has(options, "redis-log-host") && _.has(options, "redis-log-port")){
            this.logger.add(winston.transports.Redis, {
                level: options["log-level"],
                host: options["redis-log-host"],
                port: options["redis-log-port"],
                container: "logs"
            });
        }
        else{
            this.logger.add(winston.transports.Console, {
                level: options["log-level"],
                colorize: true
            });
        }
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
