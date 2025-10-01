const clearDatabaseStatement = 

`
delete from userRole where userRole.id != 1;
delete from user where user.id != 1;
delete from auth;

alter table user AUTO_INCREMENT = 1;
alter table userRole AUTO_INCREMENT = 1;
alter table auth AUTO_INCREMENT = 1;

delete from store;
delete from franchise;
delete from menu;

alter table franchise AUTO_INCREMENT = 1;
alter table store AUTO_INCREMENT = 1;
alter table menu AUTO_INCREMENT = 1;

delete from orderItem;
delete from dinerOrder;

alter table orderItem AUTO_INCREMENT = 1;
alter table dinerOrder AUTO_INCREMENT = 1;
`

module.exports = {clearDatabaseStatement}