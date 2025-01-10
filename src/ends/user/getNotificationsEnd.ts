import IEnd, {
  IEndConfigAccess,
  IEndHead,
  IEndInput,
  IEndMethod,
  IEndOutput
} from '../IEnd.js';
import { INotification } from '../../models/notification.js';
import { getNotificationsLogic } from '../../logic/collectible/getNotificationsLogic.js';
type IUserGetNotificationsEndInput = IEndInput;

interface IGetNotificationsEndResponse {
  notifications: Partial<INotification>[] | null;
}

const UserGetNotificationsEnd: IEnd<
  IUserGetNotificationsEndInput,
  IGetNotificationsEndResponse
> = {
  configuration: {
    access: IEndConfigAccess.logins
  },
  method: IEndMethod.GET,
  url: '/user/notification',
  schema: {},
  handler: async function (
    heads: IEndHead
  ): Promise<IEndOutput<IGetNotificationsEndResponse>> {
    const response = await getNotificationsLogic(heads.loginObj!.user!);
    return {
      statusCode: 200,
      response: response.data!
    };
  },
  docs: {
    name: 'User Get Notification',
    description: 'Get user notifications array',
    sampleInput: {}
  }
};

export default UserGetNotificationsEnd;
