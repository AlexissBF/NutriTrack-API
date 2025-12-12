const { MongoClient } = require("mongodb");

let client;
let db;

async function connectMongo({ uri, dbName }) {
  if (db) return db;

  client = new MongoClient(uri, { ignoreUndefined: true });
  await client.connect();
  db = client.db(dbName);

  // Índices recomendados (opcionales)
  await Promise.allSettled([
    db.collection("foods").createIndex({ userId: 1, date: -1 }),
    db.collection("activities").createIndex({ userId: 1, date: -1 })
  ]);

  console.log(`[mongo] connected to ${dbName}`);
  return db;
}

async function closeMongo() {
  if (client) await client.close();
  client = undefined;
  db = undefined;
}

module.exports = { connectMongo, closeMongo };
