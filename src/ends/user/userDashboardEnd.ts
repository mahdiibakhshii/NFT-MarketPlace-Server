import IEnd, {
  IEndConfigAccess,
  IEndHead,
  IEndInput,
  IEndMethod,
  IEndOutput
} from '../IEnd.js';
import { IUser } from '../../models/user.js';
import TestDataSpec from '../../../test/testData.spec.js';
import { userDashboardLogic } from '../../logic/pages/userDashboardLogic.js';
import { ICollectible } from '../../models/collectible.js';
import { IListOnSale } from '../../models/listOnSale.js';
import { ObjectIDType } from '@helpers/aliases.js';
import { IActivity } from '@models/activity.js';

export interface IUserDashboardEndInput extends IEndInput {
  userID: ObjectIDType<IUser>;
}

interface IUserDashboardEndResponse {
  isSelf?: boolean;
  userInfo?: Partial<IUser>;
  collectibles?: Partial<ICollectible>[] | null;
  onSales?: Partial<IListOnSale>[] | null;
  activity?: Partial<IActivity>[] | null;
  err?: string;
}

const UserDashboardEnd: IEnd<
  IUserDashboardEndInput,
  IUserDashboardEndResponse
> = {
  configuration: {
    access: IEndConfigAccess.public
  },
  method: IEndMethod.GET,
  url: '/user/dashboard/:userID',
  schema: {},
  handler: async function (
    heads: IEndHead,
    input: IUserDashboardEndInput
  ): Promise<IEndOutput<IUserDashboardEndResponse>> {
    const response = await userDashboardLogic(
      heads!.loginObj === undefined ? undefined : heads!.loginObj.user,
      input.userID
    );
    if (response.statusCode === 200)
      return {
        statusCode: 200,
        response: response.data!
      };
    else {
      return {
        statusCode: response.statusCode,
        response: { err: response.err }
      };
    }
  },
  docs: {
    name: 'User Dashboard',
    description: 'Get user dashboard api',
    sampleInput: {
      userID: TestDataSpec.users[0]._id
    }
  }
};

export default UserDashboardEnd;
