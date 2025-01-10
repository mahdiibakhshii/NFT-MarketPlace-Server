import IEnd, {
  IEndConfigAccess,
  IEndHead,
  IEndInput,
  IEndMethod,
  IEndOutput
} from '../IEnd.js';
import TestDataSpec from '../../../test/testData.spec.js';
import { userLoginTextLogic } from '../../logic/user/userLoginTextLogic.js';

interface IUserLoginTextEndInput extends IEndInput {
  accountID: string;
}

interface IUserLoginTextEndResponse {
  loginText: string;
}

const UserLoginTextEnd: IEnd<
  IUserLoginTextEndInput,
  IUserLoginTextEndResponse
> = {
  configuration: {
    access: IEndConfigAccess.public
  },
  method: IEndMethod.POST,
  url: '/user/login/text',
  schema: {
    body: {
      type: 'object',
      properties: {
        accountID: { type: 'string' }
      },
      required: ['accountID']
    }
  },
  handler: async function (
    heads: IEndHead,
    input: IUserLoginTextEndInput
  ): Promise<IEndOutput<IUserLoginTextEndResponse>> {
    const response = await userLoginTextLogic(input.accountID);
    return {
      statusCode: 200,
      response: response
    };
  },
  docs: {
    name: 'User Login Metamask Text',
    description:
      'returns a text for Metamask signning and a boolean to indicate its a new user or not. This endpoint calls before login endpoint.',
    sampleInput: {
      accountID: TestDataSpec.users[0].accountID
    }
  }
};

export default UserLoginTextEnd;
