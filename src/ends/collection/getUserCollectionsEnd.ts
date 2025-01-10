import IEnd, {
  IEndConfigAccess,
  IEndHead,
  IEndInput,
  IEndMethod,
  IEndOutput
} from '../IEnd.js';
import { ICollection } from '../../models/collection.js';
import { getUserCollectionsLogic } from '../../logic/collection/getUserCollectionsLogic.js';

type IGetUserCollectionsEndInput = IEndInput;

interface IGetUserCollectionsEndResponse {
  collections: Partial<ICollection>[];
}

const GetUserCollectionsEnd: IEnd<
  IGetUserCollectionsEndInput,
  IGetUserCollectionsEndResponse
> = {
  configuration: {
    access: IEndConfigAccess.logins
  },
  method: IEndMethod.GET,
  url: '/collection/user',
  schema: {},
  handler: async function (
    heads: IEndHead
  ): Promise<IEndOutput<IGetUserCollectionsEndResponse>> {
    const response = await getUserCollectionsLogic(heads.loginObj!.user!);
    return {
      statusCode: 200,
      response: { collections: response.collections }
    };
  },
  docs: {
    name: 'get user Collections',
    description: 'Get user collections by request token',
    sampleInput: {}
  }
};

export default GetUserCollectionsEnd;
