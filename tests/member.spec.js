process.env.NODE_ENV = 'test';

module.exports = () => {

    let chai = require('chai');
    let chaiHttp = require('chai-http');
    let server = require('../server');
    let assert = chai.assert;
    let uuid = require('uuid');

    let member = {
        aptNumber: '',
        streetNumber: '123',
        streetAddress: 'Sesame Street',
        city: 'New York',
        province: 'NY',
        country: 'United States',
        postalcode: 'A1B 2C3',
        preferredPhone: '1234567890',
        firstName: 'Bert',
        lastName: 'Nernie',
        email: `bert${uuid()}@sesamestreet.com`,
        status: 'individual',
        birthdate: '1990-01-28',
        withinCatchmentArea: false,
        testimony: '',
        programs: [
            {
                "id": 1,
                "name": "Newcome & Settlement Services"
            },
            {
                "id": 2,
                "name": "Queer and Trans Family Events"
            }
        ],
        password: uuid()
    };

    chai.use(chaiHttp);

    describe('Member API tests', () => {
        describe('Sign up a new user', () => {
            it('Should return 200 OK with valid data', (done) => {
                // let member = getMember();

                chai.request(server)
                    .post('/api/member')
                    .send(member)
                    .end((err, res) => {

                        if (err) {
                            assert.fail('Request failed: ', err.message);
                        }

                        assert(res.statusCode === 200, 'Should return 200 OK status.');
                        done();
                    });
            });
        });

        describe('Attempt to get member without a token', () => {
            it('should fail with a 401 status', (done) => {
                chai.request(server)
                    .get('/api/member')
                    .end((err, res) => {
                        assert(res.status == 401, 'should have a 401 status');
                        done();
                    });
            });
        });

        describe('Get member with token', () => {
            it('should return member information', (done) => {
                // this is a preexisting member. If we try and add a user 
                // then login, the test seems to run faster than the db, so 
                // no entry has been made to the Login table.
                // Ideally you should use a local db when running these tests to preven
                // this behaviour.
                let login = {
                    email: 'sampleuser@gmail.com',
                    password: 'thisisapassword'
                };

                // login to get token
                chai.request(server)
                    .post('/api/login')
                    .set('Application-Type', 'application/json')
                    .send(login)
                    .end((err, res) => {

                        if (err) {
                            assert.fail('Request failed: ', err.message);
                        }

                        var token = res.body.token;

                        // request member with token
                        chai.request(server)
                            .get('/api/member')
                            .set('x-access-token', token)
                            .send()
                            .end((err, res) => {
                                if (err) {
                                    assert.fail('Request failed: ', err.message);
                                }

                                res = res.body;

                                assert(res.success == true, 'Should indicate success');
                                assert(res.member != undefined, 'Response should include member data.');

                                done();
                            });
                    });

            });
        });
    });
};