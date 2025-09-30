// const request = require('supertest');
// const app = require('../service');

/* Things I need to test franchiseRouter:
 *  getFranchises:
 *      query: page=0&limit=10&name=*
 *      testUser and authtoken
 *  getUserFranchises:
 *      query: :userId
 *      testUser and authtoken
 *  createFranchise:
 *      the franchise to be sent (not added to db yet)
 *      {"name": "pizzaPocketTest", "admins": [{"email": "f@jwt.com"}]}' 'Authorization: Bearer tttttt' 
 *  createStore:
 *      a franchise in the database
 *      query: :franchiseId/store
 *      {"franchiseId": 1, "name":"SLC"}' -H 'Authorization: Bearer tttttt'`,
 *  deleteFranchise:
 *      a franchise in the db
 *      query: franchiseId
 *      'Authorization: Bearer tttttt'
 *  deleteStore:
 *      a franchise and a store
 *      query: franchiseId/store/:storeId
 *      'Authorization: Bearer tttttt'`
 *      
*/

// const testUser = { name: 'testPizza_franchise', email: 'reg@test.com', password: 'a' };
// let testUserAuthToken;
// let testFranchise;
// beforeAll(async () => {
//     // testUser.email = Math.random().toString(36).substring(2, 12) + '@test.com';
//     // const registerRes = await request(app).post('/api/auth').send(testUser);
//     // testUserAuthToken = registerRes.body.token;
//     // expectValidJwt(testUserAuthToken);

// });

//getFranchises
// test('getFranchises', async () => {
//     //Header:None
//     //Body: user, query.page, query.limit, query.name);
//     const getFranchisesRes = (await request(app).get('/api/franchise').
//         set('Authorization', `Bearer ${testUserAuthToken}`).
//         query({ page: 0, limit: 10, name: 'pizzaPocket' }));
//     expect(getFranchisesRes.status).toBe(200)
//     const expectedRes = {
//         franchises:[1,"pizzaPocket"], more:false}
//     expect(getFranchisesRes.body).toMatchObject(expectedRes)
//     //Response: {[franchises, more]}
// });

//getUserFranchises
// test('getUserFranchises', async () => {
// header: 'Authorization: Bearer tttttt'
// });

//createFranchise
// test('createFranchise', async () => {

// });
//deleteFranchise
// test('deleteFranchise', async () => {

// });
//createStore
// test('createStore', async () => {

// });
//deleteStore
// test('deleteStore', async () => {

// });
// function expectValidJwt(potentialJwt) {
//     expect(potentialJwt).toMatch(/^[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*$/);
// }
