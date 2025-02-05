// models/event.model.js
import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  ownerId: { type: String, required: true },
  poster: { type: String },
  guests: [{ type: mongoose.Schema.Types.ObjectId, ref: "Guest" }],
  date: { type: Date, required: true },
  endDate: { type: Date, required: true },
  location: {
    address: { type: String }, // Human-readable address
    latitude: { type: Number }, // Coordinates
    longitude: { type: Number },
    placeId: { type: String }, // Google Maps Place ID
  },
  tasks: [
    {
      title: { type: String },
      isCompleted: { type: Boolean },
      dueDate: { type: Date },
    },
  ],
  welcomeScreenParams: {
    backgroundColor: { type: String },
    textColor: { type: String },
    isManualCheckin: { type: Boolean },
    isGdpr: { type: Boolean },
    videoUrl: { type: String },
  },
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
  }, // Include _id explicitly
});
const Event = mongoose.model("Event", eventSchema);

export default Event;
