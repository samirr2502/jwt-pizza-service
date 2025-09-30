const request = require('supertest');
const app = require('../service');

const testUser = { name: 'testPizza', email: 'reg@test.com', password: 'a' };
let testUserAuthToken;
let expectedRes;
beforeAll(async () => {
  testUser.email = randomName()+ '@test.com';
  const registerRes = await request(app).post('/api/auth').send(testUser);
  testUserAuthToken = registerRes.body.token;
  expectValidJwt(testUserAuthToken);
});

test('getMenu',async()=>{
    const getMenuRes = await request(app).get('/api/order/menu');
    expect(getMenuRes.status).toBe(200);
    expectedRes ={}
    expect(getMenuRes.body).toMatchObject(expectedRes)
})


function expectValidJwt(potentialJwt) {
  expect(potentialJwt).toMatch(/^[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*$/);
}
function randomName() {
    return Math.random().toString(36).substring(2, 12);
}