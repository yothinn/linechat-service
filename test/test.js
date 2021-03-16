'use strict';

process.env.MONGODB_URI_TEST = 'mongodb://localhost/database-test';

var glob = require('glob'),
    path = require('path'),
    mongooseConfig = require('../src/config/mongoose');



describe('Mongodb connect', function () {

    it('connected..', function (done) {
        mongooseConfig.connection(function () {
            done();
        });
    });

});

glob.sync(path.join(__dirname, '../src/modules/**/test/*.js')).forEach(function (file) {
    require(path.resolve(file));
});


describe('Mongodb disconnect', function () {

    it('disconnected..', function (done) {
        mongooseConfig.dropDatabase(function () {
            process.exit(0);
            mongooseConfig.disconnect(done);
        });
    });

});