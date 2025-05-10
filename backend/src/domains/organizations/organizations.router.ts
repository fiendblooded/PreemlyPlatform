import { Router } from 'express';
import * as organizationsController from './organizations.controller';
import { verifyUser } from '../../middleware/auth';

const router = Router();

router.get('/', organizationsController.getAllOrganizations);
router.get('/:id', organizationsController.getOrganizationById);
router.post('/:id/bookings', organizationsController.createBooking);
router.post('/:id/ratings', organizationsController.addRating);
router.get('/:id/ratings/average', organizationsController.getAverageRating);

router.get('/user/mine', verifyUser, organizationsController.getMyOrganizations);
router.post('/', verifyUser, organizationsController.createOrganization);
router.put('/:id', verifyUser, organizationsController.updateOrganization);
router.delete('/:id', verifyUser, organizationsController.deleteOrganization);

router.post('/:id/categories', verifyUser, organizationsController.addProductCategory);
router.put(
  '/:organizationId/categories/:categoryId',
  verifyUser,
  organizationsController.updateProductCategory,
);
router.delete(
  '/:organizationId/categories/:categoryId',
  verifyUser,
  organizationsController.deleteProductCategory,
);

router.post('/:id/providers', verifyUser, organizationsController.addServiceProvider);
router.put(
  '/:organizationId/providers/:providerId',
  verifyUser,
  organizationsController.updateServiceProvider,
);

router.post('/:id/dates', verifyUser, organizationsController.addServiceDate);

export default router;
