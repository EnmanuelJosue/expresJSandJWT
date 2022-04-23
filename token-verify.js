const jwt = require('jsonwebtoken');

const secret = 'myCat';
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInJvbGUiOiJjdXN0b21lciIsImlhdCI6MTY1MDcxODg1N30.d9TPOaXDgdedrzRZ2uOcLW21Lwv5avmAKoHK0Oj4XIg';

function verifyToken(token, secret){
  return jwt.verify(token, secret);
}

const payload = verifyToken(token,secret);
console.log(payload);

