
const { Role, DB } = require('../database/database.js');
const {clearDatabaseStatement} = require('./afterAllDatabaseDelete.js')

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
async function dropDatabase(){
    let connection;
    try{
        connection = await DB.getConnection()
        for (const stmt of clearDatabaseStatement.split(";")) {
        const trimmed = stmt.trim();
        if (trimmed) {
            await connection.query(trimmed);
  }
}    } finally {
        connection.end();
    }
}
module.exports = {expectValidJwt, randomName, createAdminUser, dropDatabase}