const request = require('supertest');
const app = require('../service');
const { Role, DB } = require('../database/database.js');
if (process.env.VSCODE_INSPECTOR_OPTIONS) {
    jest.setTimeout(60 * 1000 * 5); // 5 minutes
}

const testUser = { name: 'testPizza', email: 'reg@test.com', password: 'a' };
const testFranchiseRandomName = randomName();
const testFranchise = { name: testFranchiseRandomName, admins: [{ email: "f@jwt.com" }] };
const testStoreRandomName = randomName();
const testStore = { franchiseId: testFranchise.id, name: testStoreRandomName };

let testUserAuthToken;
let adminUserAuthToken;
let orderJWT;
let expectedRes;
let testMenuItem;
let testMenuItem2;
let franchiseId;
let storeId;
let orderId;
let adminUser;
let menuItemId;
let testOrder;

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

    testFranchise.admins[0].email = adminUser.email

    const createFranchiseRes = (await request(app).post(`/api/franchise`).
        set('Authorization', `Bearer ${adminUserAuthToken}`).send(testFranchise))
    expect(createFranchiseRes.status).toBe(200)
    franchiseId = createFranchiseRes.body.id

    const createStoreRes = (await request(app).post(`/api/franchise/${franchiseId}/store`).
        set('Authorization', `Bearer ${adminUserAuthToken}`).send(testStore));
    expect(createStoreRes.status).toBe(200);
    storeId = createStoreRes.body.id

    testMenuItem = { title: "Student2", description: "One Topping, no sauce, just carbs", image: "pizza9.png", price: 0.0001 }

    testMenuItem2 = { title: "Student3", description: "Two Topping, no sauce, just carbs", image: "pizza9.png", price: 0.0001 }
    testOrder = { franchiseId: franchiseId, storeId: storeId, items: [{ menuId: 1, description: "Two Topping, no sauce, just carbs", price: 0.0001 }] }

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
    expectedRes = { id: menuItemId, title: 'Student2', description: 'One Topping, no sauce, just carbs', image: 'pizza9.png', price: 0.0001 }
    expect(getMenuRes.body.at(-1)).toMatchObject(expectedRes)
})

test('createOrder', async () => {
    const getMenuRes = await request(app).put('/api/order/menu').send(testMenuItem2).
        set('Authorization', `Bearer ${adminUserAuthToken}`);
    expect(getMenuRes.status).toBe(200);
    const menuItem= getMenuRes.body.at(-1)
    testOrder.items[0].menuId = menuItem.id
    const createOrderRes = await request(app).post('/api/order').send(testOrder).
        set('Authorization', `Bearer ${testUserAuthToken}`)
    expect(createOrderRes.status).toBe(200);
    orderJWT = createOrderRes.body.jwt
    expectValidJwt(orderJWT);
    orderId = createOrderRes.body.order.id
    expectedRes = {order:{ franchiseId: franchiseId, storeId: storeId, items: [{ menuId: menuItem.id, description:menuItem.description, price: menuItem.price }], id: orderId }, jwt: orderJWT }
    expect(createOrderRes.body).toMatchObject(expectedRes)
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