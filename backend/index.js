import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import Event from "./models/event.model.js";
import Guest from "./models/guest.model.js";
import path from "path";
import verifyUser from "./utils/verify-user.js";
import bodyParser from "body-parser";
import sendEmail from "./services/mailgun.service.js";
import { uploadImage } from "./config/cloudinary.js";
import { v2 as cloudinary } from "cloudinary";
import extractPublicId from "./utils/helpers.js";
import axios from 'axios';

const __dirname = path.resolve();
const app = express();
app.use(cors());
dotenv.config();
const PORT = process.env.PORT || 3002;
app.use(bodyParser.json({ limit: "10mb" })); // Increase JSON payload limit
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" })); // For form data

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

app.post("/api/mail", async (req, res) => {
  const { recipient, subject, htmlContent } = req.body;

  if (!recipient || !subject || !htmlContent) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide all fields" });
  }

  try {
    await sendEmail(recipient, subject, htmlContent);
    res.status(204).send();
  } catch (error) {
    console.error("Error in Create Event:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

app.post("/api/events", verifyUser, async (req, res) => {
  const event = req.body;

  if (!event || !event?.title || !event?.poster) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide all fields, including poster" });
  }

  try {
    const uploadResponse = await cloudinary.uploader.upload(event.poster, {
      folder: "events_posters",
    });

    event.poster = uploadResponse.secure_url;

    const newEvent = new Event(event);
    await newEvent.save();

    res.json({
      success: true,
      message: { _id: newEvent._id },
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
      const events = await Event.find({ ownerId: req.user.sub });

      const eventsWithImages = await Promise.all(
        events.map(async (event) => {
          try {
            const imageResponse = await axios.get(event.poster, {
              responseType: "arraybuffer", 
            });
            const imageBase64 = Buffer.from(imageResponse.data, "binary").toString("base64");

            return {
              ...event._doc,
              posterImage: `data:image/jpeg;base64,${imageBase64}`,
            };
          } catch (err) {
            console.error(`Error fetching image for event ${event._id}:`, err.message);
            return {
              ...event._doc,
              posterImage: null,
            };
          }
        })
      );

      res.json({ success: true, data: eventsWithImages });
    } catch (error) {
      console.error("Error fetching events:", error.message);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  }
);

app.get("/api/events/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate("guests");
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    try {
      const imageResponse = await axios.get(event.poster, {
        responseType: "arraybuffer",
      });
      const imageBase64 = Buffer.from(imageResponse.data, "binary").toString("base64");

      res.json({
        success: true,
        data: {
          ...event._doc,
          posterImage: `data:image/jpeg;base64,${imageBase64}`,
        },
      });
    } catch (err) {
      console.error(`Error fetching image for event ${event._id}:`, err.message);
      res.json({
        success: true,
        data: {
          ...event._doc,
          posterImage: null,
        },
      });
    }
  } catch (error) {
    console.error("Error in Get Event:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

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

app.put("/api/events/:id/poster", async (req, res) => {
  const { poster } = req.body;

  if (!poster) {
    return res.status(400).json({
      success: false,
      message: "Poster is required",
    });
  }

  try {
    const existingEvent = await Event.findById(req.params.id);
    if (!existingEvent) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    if (existingEvent.poster) {
      try {
        const posterPublicId = extractPublicId(existingEvent.poster);
        const deleteResponse = await cloudinary.uploader.destroy("events_posters/" + posterPublicId);
        console.log("Image delete response:", deleteResponse);
      } catch (cloudinaryError) {
        console.error("Error deleting old image from Cloudinary:", cloudinaryError.message);
      }
    }

    const uploadResponse = await uploadImage(poster, "events_posters");

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { poster: uploadResponse.secure_url },
      { new: true }
    );

    res.json({ success: true, data: updatedEvent });
  } catch (error) {
    console.error("Error in Update Poster:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

app.delete("/api/events/:id", async (req, res) => {
  try {
    const eventToDelete = await Event.findById(req.params.id);
    if (!eventToDelete) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    if (eventToDelete.poster) {
      try {
        const posterPublicId = extractPublicId(eventToDelete.poster);
        const deleteResponse = await cloudinary.uploader.destroy("events_posters/" + posterPublicId);
        console.log("Image delete response:", deleteResponse);
      } catch (cloudinaryError) {
        console.error("Error deleting image from Cloudinary:", cloudinaryError.message);
      }
    }

    await Event.findByIdAndDelete(req.params.id);

    res.status(204).send();
  } catch (error) {
    console.error("Error in Delete Event:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

app.post("/api/events", verifyUser, async (req, res) => {
  const { title, description, poster } = req.body;

  if (!title || !poster) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }

  try {
    const uploadResult = await uploadImage(poster, "events");
    
    const newEvent = new Event({
      title,
      description,
      poster: uploadResult.secure_url,
      ownerId: req.user.sub,
    });

    await newEvent.save();
    res.json({ success: true, data: newEvent });
  } catch (error) {
    console.error("Error creating event:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

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
