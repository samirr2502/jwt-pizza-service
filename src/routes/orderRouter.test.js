const request = require('supertest');
const app = require('../service');
const { Role, DB } = require('../database/database.js');
if (process.env.VSCODE_INSPECTOR_OPTIONS) {
    jest.setTimeout(60 * 1000 * 5); // 5 minutes
}

const testUser = { name: 'testPizza', email: 'reg@test.com', password: 'a' };
let testUserAuthToken;
let expectedRes;
beforeAll(async () => {
    testUser.email = randomName() + '@test.com';
    const registerRes = await request(app).post('/api/auth').send(testUser);
    testUserAuthToken = registerRes.body.token;
    expectValidJwt(testUserAuthToken);

    adminUser = await createAdminUser()

    const loginRes = await request(app).put('/api/auth').send(adminUser);
    expect(loginRes.status).toBe(200);

    adminUserAuthToken = loginRes.body.token
    expectValidJwt(adminUserAuthToken);
    amdinUserId = loginRes.body.user.id;

    testMenuItem = { title: "Student2", description: "One Topping, no sauce, just carbs", image: "pizza9.png", price: 0.0001 }


});

test('getMenu', async () => {
    const getMenuRes = await request(app).get('/api/order/menu');
    expect(getMenuRes.status).toBe(200);
    expectedRes = {}
    expect(getMenuRes.body).toMatchObject(expectedRes)
})

test('addMenuItem', async () => {
    const getMenuRes = await request(app).put('/api/order/menu').send(testMenuItem).
        set('Authorization', `Bearer ${adminUserAuthToken}`);
    expect(getMenuRes.status).toBe(200);
    menuItemId = getMenuRes.body.at(-1).id
    expectedRes =  {id: menuItemId, title: 'Student2', description: 'One Topping, no sauce, just carbs', image: 'pizza9.png', price: 0.0001 }
    expect(getMenuRes.body.at(-1)).toMatchObject(expectedRes)
})


function expectValidJwt(potentialJwt) {
    expect(potentialJwt).toMatch(/^[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*$/);
}
function randomName() {
    return Math.random().toString(36).substring(2, 12);
}
async function createAdminUser() {
    let user = { password: 'toomanysecrets', roles: [{ role: Role.Admin }] };
    user.name = randomName();
    user.email = user.name + '@admin.com';

    user = await DB.addUser(user);
    return { ...user, password: 'toomanysecrets' };
}