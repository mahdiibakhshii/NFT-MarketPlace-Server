import IEnd, {
  IEndConfigAccess,
  IEndHead,
  IEndInput,
  IEndMethod,
  IEndOutput
} from '../IEnd.js';
import { IUser } from '../../models/user.js';
import TestDataSpec from '../../../test/testData.spec.js';
import { userLoginLogic } from '../../logic/user/userLoginLogic.js';
import { ILogin } from '@models/login';

interface IUserLoginEndInput extends IEndInput {
  accountID: string;
  signature: string;
}

interface IUserLoginEndResponse {
  user: Partial<IUser> | null;
  login: Partial<ILogin> | null;
  err: string | undefined;
}

const UserLoginEnd: IEnd<IUserLoginEndInput, IUserLoginEndResponse> = {
  configuration: {
    access: IEndConfigAccess.public
  },
  method: IEndMethod.POST,
  url: '/user/login',
  schema: {
    body: {
      type: 'object',
      properties: {
        accountID: { type: 'string' },
        signature: { type: 'string' }
      },
      required: ['accountID', 'signature']
    }
  },
  handler: async function (
    heads: IEndHead,
    input: IUserLoginEndInput
  ): Promise<IEndOutput<IUserLoginEndResponse>> {
    const response = await userLoginLogic(input.accountID, input.signature);
    if (!response.err)
      return {
        statusCode: 200,
        response: response
      };
    return {
      statusCode: 409,
      response: response
    };
  },
  docs: {
    name: 'User Login',
    description:
      'Login or Register a user. The signature provided by Metamask signing required in input.',
    sampleInput: {
      accountID: TestDataSpec.users[0].accountID,
      signature: 'sample sig'
    }
  }
};

export default UserLoginEnd;
