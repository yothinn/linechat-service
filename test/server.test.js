'use strict';

const request = require('supertest');
const app = require('../src/config/express');

describe('Server', function () {

    it('should be start server', function (done) {
        request(app)
            .get('/')
            .expect(200)
            .end(done);

    });

});