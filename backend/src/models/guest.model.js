// models/guest.model.js
import mongoose from "mongoose";

const GuestSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  age: { type: Number },
  attendance_status: { type: Boolean, default: false },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event" }, // Reference to Event model
});

const Guest = mongoose.model("Guest", GuestSchema);

export default Guest;
