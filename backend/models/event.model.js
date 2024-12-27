// models/event.model.js
import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  ownerId: { type: String, required: true },
  poster: { type: String },
  time: { type: Date },
  guests: [{ type: mongoose.Schema.Types.ObjectId, ref: "Guest" }], // Reference to Guest model
});

const Event = mongoose.model("Event", EventSchema);

export default Event;
