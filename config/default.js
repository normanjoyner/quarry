module.exports = {
    version: {
        flag: true,
        abbr: "v",
        help: "Print version and exit",
        callback: function(){
            return pkg.version;
        }
    },

    interface: {
        abbr: "i",
        help: "Interface to listen on for DNS queries",
        metavar: "INTERFACE",
        default: "0.0.0.0"
    },

    port: {
        abbr: "p",
        help: "Port to listen on for DNS queries",
        metavar: "PORT",
        default: 53
    },

    "api-interface": {
        help: "Interface to listen on for API requests",
        metavar: "INTERFACE",
        default: "0.0.0.0"
    },

    "api-port": {
        help: "Port to listen on for API requests",
        metavar: "PORT",
        default: 5353
    },

    "statsd-host": {
        help: "Address of statsd server",
        metavar: "HOST",
        required: false
    },

    "statsd-port": {
        help: "Port statsd server listens on",
        metavar: "PORT",
        default: 8125
    },

    "log-level": {
        abbr: "l",
        help: "Log level",
        metavar: "LEVEL",
        choices: ["silly", "debug", "verbose", "info", "warn", "error"],
        default: "info"
    },

    "redis-log-host": {
        help: "Address of redis log server",
        metavar: "HOST",
        required: false
    },

    "redis-log-port": {
        help: "Port of redis log server",
        metavar: "PORT",
        required: false
    }
}
