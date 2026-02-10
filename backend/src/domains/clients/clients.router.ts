import { Router } from 'express';
import * as clientController from './clients.controller';
const router = Router();

// Get clients by event - this specific route must come before /:id route
router.get('/event/:eventId', clientController.getClientsByEvent);

// Get all clients
router.get('/', clientController.getAllClients);

// Get client by ID
router.get('/:id', clientController.getClientById);

// Get client with bookings
router.get('/:id/bookings', clientController.getClientWithBookings);

// Create new client
router.post('/', clientController.createClient);

// Update client
router.put('/:id', clientController.updateClient);
router.patch('/:id', clientController.updateClient);

// Delete client
router.delete('/:id', clientController.deleteClient);

// Mark attendance
router.put('/:id/attendance', clientController.markAttendance);

// Mark email sent
router.put('/:id/emailstatus', clientController.markEmailSent);

// Update reminder email date
router.put('/:id/reminder-date', clientController.updateReminderEmailDate);

// Add booking to client
router.post('/:id/bookings', clientController.addBookingToClient);

// Remove booking from client
router.delete('/:id/bookings/:bookingId', clientController.removeBookingFromClient);

export default router;
