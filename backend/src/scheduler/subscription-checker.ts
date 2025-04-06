import { UsersService } from '../domains/users/users.service';
import schedule from 'node-schedule';

const usersService = new UsersService();

export const startSubscriptionChecker = (): void => {
  schedule.scheduleJob('0 0 * * *', async () => {
    try {
      console.log('Запущена ежедневная проверка истекших подписок');
      const updatedCount = await usersService.checkAndUpdateExpiredSubscriptions();
      console.log(`Обработано ${updatedCount} истекших подписок`);
    } catch (error) {
      console.error('Ошибка при проверке истекших подписок:', error);
    }
  });
  
  setTimeout(async () => {
    try {
      console.log('Запущена первоначальная проверка истекших подписок');
      const updatedCount = await usersService.checkAndUpdateExpiredSubscriptions();
      console.log(`Обработано ${updatedCount} истекших подписок`);
    } catch (error) {
      console.error('Ошибка при первоначальной проверке истекших подписок:', error);
    }
  }, 5000);
}; 