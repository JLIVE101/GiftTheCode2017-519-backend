var assert = require('assert');
var request = require('request');

describe('Member API tests', function() {
    describe('Sign up a new user', function() {            
        it('Should return 200 OK', function(done) {

            let member = {
                aptNumber: null,
                streetNumber: '123',
                streetAddress: 'Sesame Street',
                city: 'New York',
                province: 'NY',
                country: 'United States',
                postalcode: 'A1B 2C3',
                preferredPhone: '1234567890',
                firstName: 'Bert',
                lastName: 'Nernie',
                email: 'bert@sesamestreet.com',
                status: 'individual',
                birthdate: '1990-01-28',
                withinCatchmentArea: false,
                testimony: '',
                programs: []
            };

            let options = {
                method: 'post',
                body: member,
                json: true,
                url: 'http://localhost:8080/api/save'
            };

            request(options, function(err, res, body) {
                if (err) {
                    assert.fail('Request failed: ', err.message);
                }
                assert(res.statusCode === 200, 'Should return 200 OK status.');
                done();
            });
        });
    });
});
