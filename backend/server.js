import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import Event from "./models/event.model.js";
import Guest from "./models/guest.model.js";
import path from "path";
import verifyUser from "./verifyUser.js";
import bodyParser from "body-parser";
import sendEmail from "./mailgunService.js";
import { v2 as cloudinary } from 'cloudinary';

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

app.post("/api/events", verifyUser, async (req, res) => {
  const event = req.body;

  if (!event || !event?.title || !event?.poster) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide all fields, including poster" });
  }

  try {
    // Загрузка постера на Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(event.poster, {
      folder: "events_posters", // Опционально: можно указать папку
    });

    // Сохранение ссылки на загруженный постер
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

import axios from 'axios'; // Для загрузки изображений из Cloudinary

// Получение списка событий
app.get(
  "/api/events",
  verifyUser,
  checkScopes(["read:events"]),
  async (req, res) => {
    try {
      const events = await Event.find({ ownerId: req.user.sub });

      // Загрузка изображений для каждого события
      const eventsWithImages = await Promise.all(
        events.map(async (event) => {
          try {
            const imageResponse = await axios.get(event.poster, {
              responseType: "arraybuffer", // Чтобы получить изображение в бинарном формате
            });
            const imageBase64 = Buffer.from(imageResponse.data, "binary").toString("base64");

            return {
              ...event._doc, // Данные события
              posterImage: `data:image/jpeg;base64,${imageBase64}`, // Предполагаем формат JPEG
            };
          } catch (err) {
            console.error(`Error fetching image for event ${event._id}:`, err.message);
            return {
              ...event._doc,
              posterImage: null, // Если не удалось загрузить изображение
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

// Получение одного события
app.get("/api/events/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate("guests");
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    // Загрузка изображения из Cloudinary
    try {
      const imageResponse = await axios.get(event.poster, {
        responseType: "arraybuffer",
      });
      const imageBase64 = Buffer.from(imageResponse.data, "binary").toString("base64");

      res.json({
        success: true,
        data: {
          ...event._doc,
          posterImage: `data:image/jpeg;base64,${imageBase64}`, // Добавляем изображение в формате Base64
        },
      });
    } catch (err) {
      console.error(`Error fetching image for event ${event._id}:`, err.message);
      res.json({
        success: true,
        data: {
          ...event._doc,
          posterImage: null, // Если не удалось загрузить изображение
        },
      });
    }
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
app.put("/api/events/:id/poster", async (req, res) => {
  const { poster } = req.body;

  if (!poster) {
    return res.status(400).json({
      success: false,
      message: "Poster is required",
    });
  }

  try {
    // Загрузка нового постера на Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(poster, {
      folder: "events_posters",
    });

    // Обновление ссылки в базе данных
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { poster: uploadResponse.secure_url },
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
