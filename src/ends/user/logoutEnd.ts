import IEnd, {
  IEndConfigAccess,
  IEndHead,
  IEndInput,
  IEndMethod,
  IEndOutput
} from '../IEnd.js';
import TestDataSpec from '../../../test/testData.spec.js';
import { userLogoutLogic } from '../../logic/user/userLogoutLogic.js';

type IUserLogoutEndInput = IEndInput;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IUserLogoutEndResponse {}

const UserLogoutEnd: IEnd<IUserLogoutEndInput, IUserLogoutEndResponse> = {
  configuration: {
    access: IEndConfigAccess.logins
  },
  method: IEndMethod.POST,
  url: '/user/logout',
  schema: {
    body: {}
  },
  handler: async function (
    heads: IEndHead
  ): Promise<IEndOutput<IUserLogoutEndResponse>> {
    await userLogoutLogic(heads.loginObj!.user!);
    return {
      statusCode: 200,
      response: {}
    };
  },
  docs: {
    name: 'User Logout',
    description: 'Logout user (deactive token)',
    sampleInput: {
      token: TestDataSpec.logins[0].token
    }
  }
};

export default UserLogoutEnd;
