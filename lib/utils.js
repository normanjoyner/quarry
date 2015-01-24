var _ = require("lodash");
var dns = require("native-dns");

module.exports = {

    standardize: function(name, record){
        return types[record.type](name, record);
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
