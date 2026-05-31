import Notification from '../models/Notification.js';

export const createNotification = async (userId, message, type, link = '') => {
  try {
    await Notification.create({ user: userId, message, type, link });
  } catch (error) {
    console.error('Erreur création notification:', error.message);
  }
};