module.exports = {
    region: {
        help: "AWS Region",
        default: "us-east-1"
    },

    "access-key-id": {
        help: "AWS access key id",
        required: true
    },

    "secret-access-key": {
        help: "AWS secret access key",
        required: true
    },

    bucket: {
        help: "S3 bucket",
        required: true
    }
}
