import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import Event from "./models/event.model.js";
import Guest from "./models/guest.model.js";
import path from "path";
import verifyUser from "./verifyUser.js";
const __dirname = path.resolve();
const app = express();
app.use(cors());
dotenv.config();
const PORT = process.env.PORT || 3002;

const checkScopes = (requiredScopes) => (req, res, next) => {
  const tokenScopes = req.user.scope?.split(" ") || [];
  const hasRequiredScopes = requiredScopes.every((scope) =>
    tokenScopes.includes(scope)
  );

  if (!hasRequiredScopes) {
    return res
      .status(403)
      .json({ success: false, message: "Forbidden: Insufficient permissions" });
  }

  next();
};

// Middleware
app.use(express.json()); // Parse JSON data in the request body
// Connect to database
app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on http://localhost:${PORT}`);
});
app.post("/api/events", verifyUser, async (req, res) => {
  const event = req.body;

  if (!event || !event?.title) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide all fields" });
  }

  const newEvent = new Event(event);
  try {
    await newEvent.save(); // MongoDB assigns `_id` here

    // Include the MongoDB `_id` in the response
    res.json({
      success: true,
      message: { _id: newEvent._id }, // Explicitly return the `_id`
    });
  } catch (error) {
    console.error("Error in Create Event:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

app.get(
  "/api/events",
  verifyUser,
  checkScopes(["read:events"]),
  async (req, res) => {
    try {
      const events = await Event.find({ ownerId: req.user.sub }); // Example query
      res.json({ success: true, data: events });
    } catch (error) {
      console.error("Error fetching events:", error.message);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  }
);

// Get Single Event
app.get("/api/events/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate("guests");
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }
    res.json({ success: true, data: event });
  } catch (error) {
    console.error("Error in Get Event:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// Update Event
app.put("/api/events/:id", async (req, res) => {
  try {
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );
    if (!updatedEvent) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }
    res.json({ success: true, data: updatedEvent });
  } catch (error) {
    console.error("Error in Update Event:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});
// Update Poster of an Event
app.put("/api/events/:id/poster", async (req, res) => {
  const { poster } = req.body; // Poster URL or path
  if (!poster) {
    return res.status(400).json({
      success: false,
      message: "Poster URL is required",
    });
  }

  try {
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { poster },
      { new: true }
    );
    if (!updatedEvent) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }
    res.json({ success: true, data: updatedEvent });
  } catch (error) {
    console.error("Error in Update Poster:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// Delete Event
app.delete("/api/events/:id", async (req, res) => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.id);
    if (!deletedEvent) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }
    res.status(204).send();
  } catch (error) {
    console.error("Error in Delete Event:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// Add Guests to Event
app.post("/api/events/:id/guests", async (req, res) => {
  const guests = req.body.guests;
  if (!Array.isArray(guests) || guests.length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "Guests must be a non-empty array" });
  }
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    const guestDocs = guests.map((guest) => ({ ...guest, eventId: event._id }));
    const createdGuests = await Guest.insertMany(guestDocs);

    event.guests.push(...createdGuests.map((guest) => guest._id));
    await event.save();

    res.status(201).json({ success: true, data: createdGuests });
  } catch (error) {
    console.error("Error in Add Guests:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// Update Guest
app.put("/api/guests/:id", async (req, res) => {
  try {
    const updatedGuest = await Guest.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );
    if (!updatedGuest) {
      return res
        .status(404)
        .json({ success: false, message: "Guest not found" });
    }
    res.json({ success: true, data: updatedGuest });
  } catch (error) {
    console.error("Error in Update Guest:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// Delete Guest
app.delete("/api/guests/:id", async (req, res) => {
  try {
    const deletedGuest = await Guest.findByIdAndDelete(req.params.id);
    if (!deletedGuest) {
      return res
        .status(404)
        .json({ success: false, message: "Guest not found" });
    }
    res.status(204).send();
  } catch (error) {
    console.error("Error in Delete Guest:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// Mark Guest Attendance
app.put("/api/guests/:id/attendance", async (req, res) => {
  try {
    const guest = await Guest.findById(req.params.id);
    if (!guest) {
      return res
        .status(404)
        .json({ success: false, message: "Guest not found" });
    }

    guest.attendance_status = true;
    await guest.save();

    res.json({ success: true, data: guest });
  } catch (error) {
    console.error("Error in Mark Attendance:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  });
}
