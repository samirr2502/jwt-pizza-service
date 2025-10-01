const request = require('supertest');
const app = require('../service');
const {expectValidJwt, randomName, createAdminUser} = require('./test_utilities.js')
if (process.env.VSCODE_INSPECTOR_OPTIONS) {
    jest.setTimeout(60 * 1000 * 5); // 5 minutes
}

let adminUser;
let adminUserAuthToken;
const testFranchiseRandomName = randomName();
const testFranchise = { name: testFranchiseRandomName, admins: [{ email: "f@jwt.com" }] };
const testStoreRandomName = randomName();
const testStore = { franchiseId: testFranchise.id, name: testStoreRandomName };
let userId;
let franchiseId;
let storeId;
beforeAll(async () => {

    //Login admin user
    adminUser = await createAdminUser()

    const loginRes = await request(app).put('/api/auth').send(adminUser);
    expect(loginRes.status).toBe(200);

    adminUserAuthToken = loginRes.body.token
    expectValidJwt(adminUserAuthToken);
    userId = loginRes.body.user.id;

    testFranchise.admins[0].email = adminUser.email

    const createFranchiseRes = (await request(app).post(`/api/franchise`).
        set('Authorization', `Bearer ${adminUserAuthToken}`).send(testFranchise))

    // testFranchise.admins[0].email = adminUser.email

    expect(createFranchiseRes.status).toBe(200)
    franchiseId = createFranchiseRes.body.id
    const expectedFranchiseRes = { admins: [{ email: adminUser.email, id: adminUser.id, name: adminUser.name }], id: franchiseId, name: testFranchise.name }
    expect(createFranchiseRes.body).toMatchObject(expectedFranchiseRes)
});

//getFranchises
test('getFranchises', async () => {
    //Header:None
    //Body: user, query.page, query.limit, query.name);
    const getFranchisesRes = (await request(app).get('/api/franchise').
        set('Authorization', `Bearer ${adminUserAuthToken}`).
        query({ page: 0, limit: 10, name: `${testFranchiseRandomName}` }).send(adminUser));
    expect(getFranchisesRes.status).toBe(200)

    const expectedRes = { franchises: [{ ...testFranchise.admins[0].id = userId, id: franchiseId, stores: [] }], more: false }
    expect(getFranchisesRes.body).toMatchObject(expectedRes)
    //Response: {[franchises, more]}
});

//getUserFranchises
test('getUserFranchises', async () => {
    // header: 'Authorization: Bearer tttttt'
    const getUserFranchisesRes = (await request(app).get(`/api/franchise/${userId}`).
        set('Authorization', `Bearer ${adminUserAuthToken}`))
    expect(getUserFranchisesRes.status).toBe(200);

    const expectedRes = { body: [{ ...testFranchise.admins[0].id = userId, id: franchiseId, stores: [] }] }
    expect(getUserFranchisesRes).toMatchObject(expectedRes)
});


//deleteFranchise
test('deleteFranchise', async () => {
    const deleteFranchiseRes = (await request(app).delete(`/api/franchise/${franchiseId}`).
        set('Authorization', `Bearer ${adminUserAuthToken}`))
    expect(deleteFranchiseRes.status).toBe(200)

    const expectedRes = { message: 'franchise deleted' }
    expect(deleteFranchiseRes.body).toMatchObject(expectedRes)

});
//createStore
test('createStore', async () => {
    const deleteFranchiseRes = (await request(app).delete(`/api/franchise/${franchiseId}`).
        set('Authorization', `Bearer ${adminUserAuthToken}`))
    expect(deleteFranchiseRes.status).toBe(200)

    testFranchise.admins[0].email = adminUser.email

    const createFranchiseRes = (await request(app).post(`/api/franchise`).
        set('Authorization', `Bearer ${adminUserAuthToken}`).send(testFranchise))

    expect(createFranchiseRes.status).toBe(200)
    franchiseId = createFranchiseRes.body.id
    const createStoreRes = (await request(app).post(`/api/franchise/${franchiseId}/store`).
        set('Authorization', `Bearer ${adminUserAuthToken}`).send(testStore));
    expect(createStoreRes.status).toBe(200);
    storeId = createStoreRes.body.id
    const expectedRes = { id: storeId, name: testStoreRandomName }
    expect(createStoreRes.body).toMatchObject(expectedRes)
});
//deleteStore
test('deleteStore', async () => {
    // //Setup
    const deleteFranchiseRes = (await request(app).delete(`/api/franchise/${franchiseId}`).
        set('Authorization', `Bearer ${adminUserAuthToken}`))
    expect(deleteFranchiseRes.status).toBe(200)

    testFranchise.admins[0].email = adminUser.email
    const createFranchiseRes = (await request(app).post(`/api/franchise`).
        set('Authorization', `Bearer ${adminUserAuthToken}`).send(testFranchise))
    expect(createFranchiseRes.status).toBe(200)
    franchiseId = createFranchiseRes.body.id
    const createStoreRes = (await request(app).post(`/api/franchise/${franchiseId}/store`).
        set('Authorization', `Bearer ${adminUserAuthToken}`).send(testStore));
    expect(createStoreRes.status).toBe(200);
    storeId = createStoreRes.body.id

    //Test deleteStore
    const deleteStoreRes = (await request(app).delete(`/api/franchise/${franchiseId}/store/${storeId}`).
        set('Authorization', `Bearer ${adminUserAuthToken}`));
        expect(deleteStoreRes.status).toBe(200)
});
