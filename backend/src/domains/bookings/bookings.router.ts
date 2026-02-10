import { Router } from 'express';
import * as bookingController from './bookings.controller';
const router = Router();

// Get all bookings
router.get('/', bookingController.getAllBookings);

// Get bookings by client - this specific route must come before /:id route
router.get('/client/:clientId', bookingController.getBookingsByClient);

// Get booking by ID
router.get('/:id', bookingController.getBookingById);

// Create new booking
router.post('/', bookingController.createBooking);

// Update booking
router.put('/:id', bookingController.updateBooking);
router.patch('/:id', bookingController.updateBooking);

// Delete booking
router.delete('/:id', bookingController.deleteBooking);

export default router;
