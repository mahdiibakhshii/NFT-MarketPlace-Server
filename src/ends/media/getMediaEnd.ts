import IEnd, {
  IEndConfigAccess,
  IEndHead,
  IEndInput,
  IEndMethod,
  IEndOutput
} from '../IEnd.js';
import { mediaGetLogic } from '../../logic/media/mediaGetLogic.js';
export interface IGetMediaEndInput extends IEndInput {
  hh: string;
  pt: string | undefined;
}

interface IGetMediaEndResponse {
  media: Buffer | undefined;
  mimeType: string | undefined;
}

const MediaGetEnd: IEnd<IGetMediaEndInput, IGetMediaEndResponse> = {
  configuration: {
    access: IEndConfigAccess.public
  },
  method: IEndMethod.GET,
  url: '/media/:hh',
  schema: {},
  handler: async function (
    heads: IEndHead,
    input
  ): Promise<IEndOutput<IGetMediaEndResponse>> {
    const res = await mediaGetLogic(input.hh, input.pt);

    if (res.found) {
      return {
        statusCode: 206,
        response: res
      };
    } else {
      return {
        statusCode: 404,
        response: res
      };
    }
  },
  docs: {
    name: 'Get media',
    description:
      'get uploaded media by its hash. client fetch the hash by other apis like GET User and then request to this api to get the stored media content. pt parameter describes the requested media size.',
    sampleInput: {
      hh: '253566f4d9fd70e8729246908b8b35faaab6d6970d291b21',
      pt: undefined
    }
  }
};

export default MediaGetEnd;
