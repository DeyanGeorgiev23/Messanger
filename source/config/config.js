const path = require('path');

module.exports = {
    development: {
        connectionString: `mongodb://localhost:27017/Messenger`,
        rootPath: path.normalize(
            path.join(__dirname, '/../../'))
    },
    production: {}
};