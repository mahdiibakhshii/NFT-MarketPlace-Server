import IEnd, {
  IEndConfigAccess,
  IEndHead,
  IEndInput,
  IEndMethod,
  IEndOutput
} from '../IEnd.js';
import { IUser } from '../../models/user.js';
import TestDataSpec from '../../../test/testData.spec.js';
import { userEditProfileLogic } from '../../logic/user/userEditProfileLogic.js';

export interface IUserEditProfileEndInput extends IEndInput {
  accountID: string;
  name: string;
  urls: {
    customUrl: string;
    websiteUrl: string;
  };
  bio: string;
  socialMedia: { type: number; url: string }[];
}

interface IUserEditProfileEndResponse {
  user: Partial<IUser> | null;
}

const UserEditProfileEnd: IEnd<
  IUserEditProfileEndInput,
  IUserEditProfileEndResponse
> = {
  configuration: {
    access: IEndConfigAccess.logins
  },
  method: IEndMethod.POST,
  url: '/user/editProfile',
  schema: {
    body: {
      type: 'object',
      properties: {
        accountID: { type: 'string' },
        name: { type: 'string' },
        customUrl: {
          type: 'object',
          properties: {
            customUrl: { type: 'string' },
            websiteUrl: { type: 'string' }
          }
        },
        bio: { type: 'string' },
        socialMedia: {
          type: 'array',
          items: {
            type: 'object',
            properties: { type: { type: 'integer' }, url: { type: 'string' } }
          }
        },
        urls: {
          type: 'object',
          properties: {
            customUrl: { type: 'string' },
            websiteUrl: { type: 'string' }
          }
        }
      },
      required: ['accountID'],
      additionalProperties: false
    }
  },
  handler: async function (
    heads: IEndHead,
    input: IUserEditProfileEndInput
  ): Promise<IEndOutput<IUserEditProfileEndResponse>> {
    const response = await userEditProfileLogic(input);
    return {
      statusCode: 200,
      response: response
    };
  },
  docs: {
    name: 'User Edit Profile',
    description: 'updates user infos',
    sampleInput: {
      accountID: TestDataSpec.users[0].accountID,
      name: 'updated sample name',
      urls: {
        customUrl: 'updatedCustomUrl.com',
        websiteUrl: 'updatedWebsiteUrl.com'
      },
      bio: 'updated sample Bio',
      socialMedia: [
        { type: 1, url: 'twitter.com/updated' },
        { type: 2, url: 'instagram.com/updated' },
        { type: 3, url: 'youtube.com/updated' }
      ]
    }
  }
};

export default UserEditProfileEnd;
