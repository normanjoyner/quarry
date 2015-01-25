quarry
====================

## About

### Description
A rock solid, dynamic DNS server with swappable backends and CRUD API. Start Quarry with one of the available persistence layers and manage records and forwarders through the API. Quarry can also be accessed programmatically by requiring it in your code!

### Author
* Norman Joyner - norman.joyner@gmail.com

## Getting Started

### Installing
Run ```npm install -g quarry-dns``` to install Quarry as an executable

Run ```npm install quarry-dns --save``` to install Quarry as a required module for your application

## Features

### Statsd Integration
Setting ```--statsd-host``` will enable Quarry statsd integration. Ship metrics such as:
* # errors
* # forwarder timeouts
* # records
* # forwarders
* HTTP Response Codes

### Various Persistence Layers
* Disk
* Memory
* MongoDB
* S3
* Redis

### CRUD API
When running Quarry as a standalone executable, records and forwarders are managed through a simple CRUD API.

### Module
When requiring Quarry as a module, records and forwarders are managed through exposed functions.

## Usage & Examples

### Executable
```quarry --help``` can be used for a comprehensive list of available commands and options. To run Quarry on a priviliged port such as 53, it must be start as root. Below are some usage examples:

#### Disk
```sudo quarry disk --file-location /path/to/quarry/config.json```

#### Memory
```sudo quarry memory```

#### MongoDB
```sudo quarry mongo --mongo-host ds028017.mongolab.com```

#### Redis
```sudo quarry redis --redis-host quarry.abcdef.0001.use1.cache.amazonaws.com```

#### S3
```sudo quarry s3 --access-key-id $AWS_ACCESS_KEY_ID --secret-access-key $AWS_SECRET_ACCESS_KEY --bucket quarry```

#### Get Records
```curl http://quary.server:5353/v1/records -X GET -H "Content-Type: application/json"```

#### Get Record
```curl http://quary.server:5353/v1/records/www.domain.com -X GET -H "Content-Type: application/json"```

#### Create Record
```curl http://quary.server:5353/v1/records/www.domain.com -X POST -d '{"address": "1.2.3.4", "type": "A", "ttl": 60}' -H "Content-Type: application/json"```

#### Update Record
```curl http://quary.server:5353/v1/records/www.domain.com -X PUT -d '{"address": ["1.2.3.4", "5.6.7.8"], "type": "A", "ttl": 60}' -H "Content-Type: application/json"```

#### Delete Record
```curl http://quary.server:5353/v1/records/www.domain.com -X DELETE```

#### Get Forwarders
```curl http://quary.server:5353/v1/forwarders -X GET -H "Content-Type: application/json"```

#### Get Forwarder
```curl http://quary.server:5353/v1/forwarders/8.8.8.8 -X GET -H "Content-Type: application/json"```

#### Create Forwarder
```curl http://quary.server:5353/v1/forwarders/8.8.8.8 -X POST -d '{"timeout": 500, "port": 53}' -H "Content-Type: application/json"```

#### Update Forwarder
```curl http://quary.server:5353/v1/forwarders/8.8.8.8 -X PUT -d '{"timeout": 1000, "port": 53}' -H "Content-Type: application/json"```

#### Delete Forwarder
```curl http://quary.server:5353/v1/forwarders/8.8.8.8 -X DELETE```

### Module
```javascript
var Quarry = require("quarry-dns");
var quarry = new Quarry({
    persistence: "memory"
});

if(quarry){
    quarry.listen(function(){
        console.log("quarry is now listening");
    });
}
```

#### Disk
```javascript
var quarry = new Quarry({
    persistence: "disk",
    "file-location": "/tmp/quarry.json"
});
```

#### Memory
```javascript
var quarry = new Quarry({
    persistence: "memory"
});
```

#### MongoDB
```javascript
var quarry = new Quarry({
    persistence: "mongo",
    "mongo-host": "ds028017.mongolab.com"
});
```

#### Redis
```javascript
var quarry = new Quarry({
    persistence: "redis",
    "redis-host": "quarry.abcdef.0001.use1.cache.amazonaws.com"
});
```

#### S3
```javascript
var quarry = new Quarry({
    persistence: "s3",
    "access-key-id": process.env["AWS_ACCESS_KEY_ID"],
    "secret-access-key": process.env["AWS_SECRET_ACCESS_KEY"],
    bucket: "quarry"
});
```

#### Get Records
```javascript
quarry.persistence.get_configuration(function(err, configuration){
    if(err)
        throw err;

    var records = configuration.records;
});
```

#### Get Record
```javascript
quarry.persistence.get_configuration(function(err, configuration){
    if(err)
        throw err;

    var record = configuration.records["www.domain.com"];
});
```

#### Create Record
```javascript
quarry.persistence.create_record("www.domain.com", { address: "1.2.3.4", type: "A", ttl: 60 }, function(err){
    if(err)
        throw err;
});
```

#### Update Record
```javascript
quarry.persistence.update_record("www.domain.com", { address: ["1.2.3.4", "5.6.7.8"], type: "A", ttl: 60 }, function(err){
    if(err)
        throw err;
});
```

#### Delete Record
```javascript
quarry.persistence.delete_record("www.domain.com", function(err){
    if(err)
        throw err;
});
```

#### Get Forwarders
```javascript
quarry.persistence.get_configuration(function(err, configuration){
    if(err)
        throw err;

    var forwarders = configuration.forwarders;
});
```

#### Get Forwarder
```javascript
quarry.persistence.get_configuration(function(err, configuration){
    if(err)
        throw err;

    var forwarder = configuration.forwarders["8.8.8.8"];
});
```

#### Create Forwarder
```javascript
quarry.persistence.create_forwarder("8.8.8.8", { timeout: 500, port: 53 }, function(err){
    if(err)
        throw err;
});
```

#### Update Forwarder
```javascript
quarry.persistence.update_forwarder("8.8.8.8", { timeout: 1000, port: 53 }, function(err){
    if(err)
        throw err;
});
```

#### Delete Forwarder
```javascript
quarry.persistence.delete_forwarder("8.8.8.8", function(err){
    if(err)
        throw err;
});
```

## Contributing
Please feel free to contribute by opening issues and creating pull requests!
