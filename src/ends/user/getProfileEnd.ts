import IEnd, {
  IEndConfigAccess,
  IEndHead,
  IEndInput,
  IEndMethod,
  IEndOutput
} from '../IEnd.js';
import { userGetProfileLogic } from '../../logic/user/userGetProfileLogic.js';
import { IUser } from '../../models/user.js';
type IUserGetProfileEndInput = IEndInput;

interface IGetProfileEndResponse {
  user: Partial<IUser>;
}

const UserGetProfileEnd: IEnd<IUserGetProfileEndInput, IGetProfileEndResponse> =
  {
    configuration: {
      access: IEndConfigAccess.logins
    },
    method: IEndMethod.GET,
    url: '/user/profile',
    schema: {},
    handler: async function (
      heads: IEndHead
    ): Promise<IEndOutput<IGetProfileEndResponse>> {
      const user = await userGetProfileLogic(heads.loginObj!.user!);
      return {
        statusCode: 200,
        response: user
      };
    },
    docs: {
      name: 'Get profile',
      description: 'Get user profile data',
      sampleInput: {}
    }
  };

export default UserGetProfileEnd;
