const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');
const jwt = require('jsonwebtoken');
describe('Auth endpoints', function(){
  let db; 
  const { testUsers} = helpers.makeThingsFixtures();
  const testUser = testUsers[0];
  before('make knex instance', ()=>{
    db=knex({
      client: 'pg',
      connection:process.env.TEST_DB_URL,
    });
    app.set('db',db);
  });

  after('disconnect from db', ()=>db.destroy());
  before('cleanup', ()=>helpers.cleanTables(db));
  afterEach('clean up', ()=>helpers.cleanTables(db));

  describe('POST /api/auth/login', ()=>{
    this.beforeEach('insert users', ()=>{
      helpers.seedUsers(
        db,
        testUsers
      );
    });

    //test when there is no username or passwword in the post request
    const requiredFields = ['user_name', 'password'];
    requiredFields.forEach(field =>{
      const loginAttemptBody = {
        user_name: testUser.user_name,
        password: testUser.password
      };
      it(`responds with 400 required error when '${field}' is missing`, ()=>{
        delete loginAttemptBody[field];

        return supertest(app)
          .post('/api/auth/login')
          .send(loginAttemptBody)
          .expect(400, {error: `Missing '${field}' in request body`});
      });
      it(`responds 400 'invalid user_name or password when bad user_name`, ()=>{
        const userInvalidUser = { user_name: 'user-not', password:'existy'};

        return supertest(app)
          .post('/api/auth/login')
          .send(userInvalidUser)
          .expect(400,{error: `Incorrect user_name or password`});
      });
      //test for a valid username and invalid password
      it(`responds 400 'invalid user_name or password'`, ()=>{
        const userInvalidPass = {user_name: testUser.user_name, password: 'incorrect'}
        return supertest(app)
          .post('/api/auth/login')
          .send(userInvalidPass)
          .expect(400, {error: `Incorrect user_name or password`})
      });
      it(`responds 200 and JWT auth token using secret when valid credentials`, ()=>{
        const userValidCreds = {
          user_name: testUser.user_name,
          password: testUser.password
        };
        const expectedToken = jwt.sign(
          {user_id: testUser.id}, //payload
          process.env.JWT_SECRET,{
            subject:testUser.user_name,
            algorithm:'HS256',
          }
        );
        return supertest(app)
          .post('/api/auth/login')
          .send(userValidCreds)
          .expect(200, {authToken:expectedToken});
      });
    });
  });
    
});