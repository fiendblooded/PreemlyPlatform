// models/event.model.js
import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  ownerId: { type: String, required: true },
  poster: { type: String },
  guests: [{ type: mongoose.Schema.Types.ObjectId, ref: "Guest" }],
  date: { type: Date, required: true },
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
  }, // Include _id explicitly
});
const Event = mongoose.model("Event", eventSchema);

export default Event;
