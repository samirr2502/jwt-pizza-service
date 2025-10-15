const request = require('supertest');
const app = require('../service');
const {expectValidJwt, randomName, createAdminUser} = require('./test_utilities.js')
if (process.env.VSCODE_INSPECTOR_OPTIONS) {
    jest.setTimeout(60 * 1000 * 5); // 5 minutes
}
let adminUser;
let adminUserAuthToken;
const testUser = {name: 'testPizza', email: 'reg@test.com', password: 'a' };
let testUserAuthToken;
let testUserId;
beforeAll(async () => {
    testUser.email = Math.random().toString(36).substring(2, 12) + '@test.com';
    const registerRes = await request(app).post('/api/auth').send(testUser);
    testUserAuthToken = registerRes.body.token;
    expectValidJwt(testUserAuthToken);
    testUserId = registerRes.body.user.id
});

test('getUser', async () => {
    const getUserRes = await request(app).get('/api/user/me').set('Authorization', `Bearer ${testUserAuthToken}`)
    expect(getUserRes.status).toBe(200);

    const expectedUser = { ...testUser, roles: [{ role: 'diner' }] };
    delete expectedUser.password;
    expect(getUserRes.body).toMatchObject(expectedUser);

})

test('updateUser', async () => {
    testUser.name = "name2"
    const updateUseRes = await request(app).put(`/api/user/${testUserId}`).set('Authorization', `Bearer ${testUserAuthToken}`).send(testUser)
    expect(updateUseRes.status).toBe(200);

    const expectedUser = { ...testUser, roles: [{ role: 'diner' }] };
    delete expectedUser.password;
    expect(updateUseRes.body.user).toMatchObject(expectedUser);

})
test('list users', async () => {
    adminUser = await createAdminUser()
    const loginRes = await request(app).put('/api/auth').send(adminUser);
    expect(loginRes.status).toBe(200);
    adminUserAuthToken = loginRes.body.token
    expectValidJwt(adminUserAuthToken);
    userId = loginRes.body.user.id;

    const listUsersRes = await request(app).get('/api/user').set('Authorization', `Bearer ${adminUserAuthToken}`)
                    .query({ page: 0, limit: 10, name: adminUser.name })
                    .send(adminUser);
    delete adminUser.password
    const expectedUsersRes = {users:[{...adminUser, id:userId, roles:[{role:'admin'}] }],more:false}
    expect(listUsersRes.status).toBe(200);
    expect(listUsersRes.body).toMatchObject(expectedUsersRes)
});