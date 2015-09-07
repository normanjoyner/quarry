var _ = require("lodash");
var dns = require("native-dns");

module.exports = {

    standardize: function(name, record){
        return types[record.type](name, record);
    },

    parse_env_vars: function(){
        var argv = process.argv;
        _.each(process.env, function(value, name){
            if(name.indexOf("QUARRY_") == 0){
                name = name.substring(7, name.length).replace(/_/g, "-").toLowerCase();
                flag = ["--", name].join("");
                argv.push(flag);
                argv.push(value);
            }
        });

        return argv.slice(2);
    }

}

var types = {

    A: function(name, record){
        if(!_.isArray(record.address))
            record.address = [record.address]

        var standardized = _.map(record.address, function(addr){
            return dns[record.type]({
                name: name,
                address: addr,
                ttl: record.ttl || 60
            });
        });

        return standardized;
    },

    CNAME: function(name, record){
        var standardized = dns[record.type]({
            name: name,
            ttl: record.ttl || 60,
            data: record.address
        });

        return [standardized];
    }

}
