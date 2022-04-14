const {Client} = require('pg');


const getConection = async () => {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'admin',
    database: 'my_store'
  })
  await client.connect();
  return client;
}

module.exports = getConection;
