const fs = require('fs');
const bcrypt = require('bcryptjs');
const users = require('./clubUsers2.json');
let nRounds = 12;
let hashedUsers = [];
let start = new Date(); // timing code
console.log(`Starting password hashing with nRounds = ${nRounds}, ${start}`);


users.forEach(function(user){
    let salt = bcrypt.genSaltSync(nRounds);
    let passHash = bcrypt.hashSync(user.password, salt);
    let fname = user.firstName;
    let lname = user.lastName;
    let email = user.email;
    let role = user.role;
    user = {fname,lname,email,passHash,role};
    hashedUsers.push(user);
})

// Your code here to process the passwords

let elapsed = new Date() - start; // timing code
console.log(`Finished password hashing, ${elapsed/1000} seconds.`);
fs.writeFileSync("clubUsersHash.json", JSON.stringify(hashedUsers, null, 2));
