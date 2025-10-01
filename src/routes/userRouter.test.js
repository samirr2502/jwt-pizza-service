const request = require('supertest');
const app = require('../service');
const {expectValidJwt, dropDatabase} = require('./test_utilities.js')


const testUser = { name: 'testPizza', email: 'reg@test.com', password: 'a' };
let testUserAuthToken;
let testUserId;
beforeAll(async () => {
  testUser.email = Math.random().toString(36).substring(2, 12) + '@test.com';
  const registerRes = await request(app).post('/api/auth').send(testUser);
  testUserAuthToken = registerRes.body.token;
  expectValidJwt(testUserAuthToken);
  testUserId = registerRes.body.user.id
});
afterAll(async ()=>{
  await dropDatabase()
})
test('getUser', async()=>{
    const getUserRes = await request(app).get('/api/user/me').set('Authorization', `Bearer ${testUserAuthToken}`)
    expect(getUserRes.status).toBe(200);
    
    const expectedUser = { ...testUser, roles: [{ role: 'diner' }] };
    delete expectedUser.password;
    expect(getUserRes.body).toMatchObject(expectedUser);

})

test('updateUser', async()=>{
    const updateUseRes = await request(app).put(`/api/user/${testUserId}`).set('Authorization', `Bearer ${testUserAuthToken}`).send(testUser)
    expect(updateUseRes.status).toBe(200);
    
    const expectedUser = { ...testUser, roles: [{ role: 'diner' }] };
    delete expectedUser.password;
    expect(updateUseRes.body.user).toMatchObject(expectedUser);

})
