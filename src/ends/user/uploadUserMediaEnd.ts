import IEnd, {
  IEndConfigAccess,
  IEndHead,
  IEndInput,
  IEndMethod,
  IEndOutput
} from '../IEnd.js';
import { ForeignType } from '../../models/media.js';
import { userUploadMediaLogic } from '../../logic/user/userUploadMediaLogic.js';
import { IUser } from '../../models/user.js';

interface IUserUploadMediaEndInput extends IEndInput {
  media: any;
  mediaForeignType: ForeignType;
}

interface IUserUploadMediaEndResponse {
  user: Partial<IUser>;
}

const UserUploadMediaEnd: IEnd<
  IUserUploadMediaEndInput,
  IUserUploadMediaEndResponse
> = {
  configuration: {
    access: IEndConfigAccess.logins
  },
  method: IEndMethod.POST,
  url: '/user/uploadMedia',
  schema: {
    body: {
      type: 'object',
      properties: {
        media: { type: 'object' },
        mediaForeignType: { type: 'number' }
      },
      required: ['media', 'mediaForeignType']
    }
  },
  handler: async function (
    heads: IEndHead,
    input: IUserUploadMediaEndInput
  ): Promise<IEndOutput<IUserUploadMediaEndResponse>> {
    const response = await userUploadMediaLogic(
      heads.loginObj!.user!,
      input.media,
      input.mediaForeignType
    );
    return {
      statusCode: 200,
      response: response
    };
  },
  docs: {
    name: 'User Upload Media',
    description: 'Upload profile picture and profile cover art',
    sampleInput: {
      media: '',
      mediaForeignType: 0
    }
  }
};

export default UserUploadMediaEnd;
