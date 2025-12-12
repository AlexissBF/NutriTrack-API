require("dotenv").config();

const path = require("path");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const { connectMongo, closeMongo } = require("./mongo");
const { toObjectId, normalizeISODate, foodFromDoc, activityFromDoc } = require("./utils");

const PROTO_PATH = path.join(__dirname, "..", "proto", "nutritrack.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const proto = grpc.loadPackageDefinition(packageDefinition).nutritrack.v1;

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017";
const DB_NAME = process.env.DB_NAME || "nutritrack";
const GRPC_PORT = process.env.GRPC_PORT || "50051";

async function main() {
  const db = await connectMongo({ uri: MONGO_URI, dbName: DB_NAME });
  const foods = db.collection("foods");
  const activities = db.collection("activities");

  const serviceImpl = {
    // ---------- Food ----------
    CreateFood: async (call, callback) => {
      try {
        const f = call.request?.food || {};
        const doc = {
          userId: f.userId || "",
          name: f.name || "",
          mealType: f.mealType || "",
          calories: Number(f.calories || 0),
          quantity: Number(f.quantity || 0),
          unit: f.unit || "",
          date: normalizeISODate(f.date) || new Date().toISOString(),
          notes: f.notes || ""
        };

        const result = await foods.insertOne(doc);
        const saved = await foods.findOne({ _id: result.insertedId });
        callback(null, { food: foodFromDoc(saved) });
      } catch (err) {
        callback(err);
      }
    },

    GetFood: async (call, callback) => {
      try {
        const oid = toObjectId(call.request?.id);
        if (!oid) return callback({ code: grpc.status.INVALID_ARGUMENT, message: "Invalid id" });

        const doc = await foods.findOne({ _id: oid });
        if (!doc) return callback({ code: grpc.status.NOT_FOUND, message: "Food not found" });

        callback(null, { food: foodFromDoc(doc) });
      } catch (err) {
        callback(err);
      }
    },

    ListFoods: async (call, callback) => {
      try {
        const { userId = "", limit = 50, skip = 0 } = call.request || {};
        const query = userId ? { userId } : {};
        const cursor = foods.find(query).sort({ date: -1 }).skip(Number(skip)).limit(Math.min(Number(limit), 200));
        const docs = await cursor.toArray();
        callback(null, { foods: docs.map(foodFromDoc) });
      } catch (err) {
        callback(err);
      }
    },

    UpdateFood: async (call, callback) => {
      try {
        const oid = toObjectId(call.request?.id);
        if (!oid) return callback({ code: grpc.status.INVALID_ARGUMENT, message: "Invalid id" });

        const f = call.request?.food || {};
        const update = {
          $set: {
            userId: f.userId || "",
            name: f.name || "",
            mealType: f.mealType || "",
            calories: Number(f.calories || 0),
            quantity: Number(f.quantity || 0),
            unit: f.unit || "",
            date: normalizeISODate(f.date) || new Date().toISOString(),
            notes: f.notes || ""
          }
        };

        const result = await foods.findOneAndUpdate({ _id: oid }, update, { returnDocument: "after" });
        if (!result.value) return callback({ code: grpc.status.NOT_FOUND, message: "Food not found" });

        callback(null, { food: foodFromDoc(result.value) });
      } catch (err) {
        callback(err);
      }
    },

    DeleteFood: async (call, callback) => {
      try {
        const oid = toObjectId(call.request?.id);
        if (!oid) return callback({ code: grpc.status.INVALID_ARGUMENT, message: "Invalid id" });

        const result = await foods.deleteOne({ _id: oid });
        callback(null, { deleted: result.deletedCount === 1 });
      } catch (err) {
        callback(err);
      }
    },

    // ---------- Activity ----------
    CreateActivity: async (call, callback) => {
      try {
        const a = call.request?.activity || {};
        const doc = {
          userId: a.userId || "",
          type: a.type || "",
          durationMinutes: Number(a.durationMinutes || 0),
          caloriesBurned: Number(a.caloriesBurned || 0),
          date: normalizeISODate(a.date) || new Date().toISOString(),
          notes: a.notes || ""
        };

        const result = await activities.insertOne(doc);
        const saved = await activities.findOne({ _id: result.insertedId });
        callback(null, { activity: activityFromDoc(saved) });
      } catch (err) {
        callback(err);
      }
    },

    GetActivity: async (call, callback) => {
      try {
        const oid = toObjectId(call.request?.id);
        if (!oid) return callback({ code: grpc.status.INVALID_ARGUMENT, message: "Invalid id" });

        const doc = await activities.findOne({ _id: oid });
        if (!doc) return callback({ code: grpc.status.NOT_FOUND, message: "Activity not found" });

        callback(null, { activity: activityFromDoc(doc) });
      } catch (err) {
        callback(err);
      }
    },

    ListActivities: async (call, callback) => {
      try {
        const { userId = "", limit = 50, skip = 0 } = call.request || {};
        const query = userId ? { userId } : {};
        const cursor = activities.find(query).sort({ date: -1 }).skip(Number(skip)).limit(Math.min(Number(limit), 200));
        const docs = await cursor.toArray();
        callback(null, { activities: docs.map(activityFromDoc) });
      } catch (err) {
        callback(err);
      }
    },

    UpdateActivity: async (call, callback) => {
      try {
        const oid = toObjectId(call.request?.id);
        if (!oid) return callback({ code: grpc.status.INVALID_ARGUMENT, message: "Invalid id" });

        const a = call.request?.activity || {};
        const update = {
          $set: {
            userId: a.userId || "",
            type: a.type || "",
            durationMinutes: Number(a.durationMinutes || 0),
            caloriesBurned: Number(a.caloriesBurned || 0),
            date: normalizeISODate(a.date) || new Date().toISOString(),
            notes: a.notes || ""
          }
        };

        const result = await activities.findOneAndUpdate({ _id: oid }, update, { returnDocument: "after" });
        if (!result.value) return callback({ code: grpc.status.NOT_FOUND, message: "Activity not found" });

        callback(null, { activity: activityFromDoc(result.value) });
      } catch (err) {
        callback(err);
      }
    },

    DeleteActivity: async (call, callback) => {
      try {
        const oid = toObjectId(call.request?.id);
        if (!oid) return callback({ code: grpc.status.INVALID_ARGUMENT, message: "Invalid id" });

        const result = await activities.deleteOne({ _id: oid });
        callback(null, { deleted: result.deletedCount === 1 });
      } catch (err) {
        callback(err);
      }
    }
  };

  const server = new grpc.Server();
  server.addService(proto.NutriTrackService.service, serviceImpl);

  const addr = `0.0.0.0:${GRPC_PORT}`;
  server.bindAsync(addr, grpc.ServerCredentials.createInsecure(), (err) => {
    if (err) throw err;
    server.start();
    console.log(`[grpc] server listening on ${addr}`);
    console.log(`[grpc] proto: ${PROTO_PATH}`);
  });

  const shutdown = async () => {
    console.log("\nShutting down...");
    server.tryShutdown(async () => {
      await closeMongo();
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
