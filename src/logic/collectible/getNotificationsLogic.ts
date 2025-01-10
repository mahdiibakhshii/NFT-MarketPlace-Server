import { ObjectIDType } from '../../helpers/aliases.js';
import { IUser } from '../../models/user.js';
import { INotification } from '../../models/notification.js';
import NotificationRepo from '../../repos/notificationRepo.js';

export async function getNotificationsLogic(
  userID: ObjectIDType<IUser>
): Promise<{
  statusCode: number;
  data: { notifications: Partial<INotification>[] | null } | undefined;
  err: string | undefined;
}> {
  //Fetch notofications
  const notifications = await NotificationRepo.getUserNotifications(userID);
  return {
    statusCode: 200,
    data: { notifications: notifications },
    err: undefined
  };
}
