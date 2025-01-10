import { ObjectIDType } from '../helpers/aliases.js';
import { IUser } from '../models/user.js';
import { INotification, NotificationModel } from '../models/notification.js';

async function createNotification(
  notificationObj: Partial<INotification>
): Promise<Partial<INotification> | null> {
  return await NotificationModel.create(notificationObj);
}

async function getUserNotifications(
  userID: ObjectIDType<IUser>
): Promise<Partial<INotification>[] | null> {
  return await NotificationModel.find({ user: userID })
    .populate({
      path: 'collectible',
      select: { _id: 1, name: 1, collectionID: 1, imageHash: 1 },
      populate: { path: 'collectionID', select: { title: 1 } }
    })
    .populate({
      path: 'user',
      select: { _id: 1, accountID: 1, name: 1, 'medias.profilePic.hash': 1 }
    })
    .populate({
      path: 'secondUser',
      select: { _id: 1, accountID: 1, name: 1, 'medias.profilePic.hash': 1 }
    })
    .sort({ createdAt: -1 });
}

const NotificationRepo = {
  createNotification,
  getUserNotifications
};

export default NotificationRepo;
