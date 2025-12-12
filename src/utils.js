const { ObjectId } = require("mongodb");

function toObjectId(id) {
  try {
    return new ObjectId(id);
  } catch {
    return null;
  }
}

function normalizeISODate(value) {
  if (!value) return undefined;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

function foodFromDoc(doc) {
  if (!doc) return null;
  return {
    id: String(doc._id),
    userId: doc.userId ?? "",
    name: doc.name ?? "",
    mealType: doc.mealType ?? "",
    calories: doc.calories ?? 0,
    quantity: doc.quantity ?? 0,
    unit: doc.unit ?? "",
    date: doc.date ?? "",
    notes: doc.notes ?? ""
  };
}

function activityFromDoc(doc) {
  if (!doc) return null;
  return {
    id: String(doc._id),
    userId: doc.userId ?? "",
    type: doc.type ?? "",
    durationMinutes: doc.durationMinutes ?? 0,
    caloriesBurned: doc.caloriesBurned ?? 0,
    date: doc.date ?? "",
    notes: doc.notes ?? ""
  };
}

module.exports = { toObjectId, normalizeISODate, foodFromDoc, activityFromDoc };
