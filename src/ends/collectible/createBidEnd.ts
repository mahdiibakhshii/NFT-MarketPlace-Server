import IEnd, {
  IEndConfigAccess,
  IEndHead,
  IEndInput,
  IEndMethod,
  IEndOutput
} from '../IEnd.js';
import { ObjectIDType } from '../../helpers/aliases.js';
import { ICollectible } from '../../models/collectible.js';
import testDataSpec from '../../../test/testData.spec.js';
import { createBidLogic } from '../../logic/bid/createBidLogic.js';

interface ICreateBidEndInput extends IEndInput {
  collectible: ObjectIDType<ICollectible>;
  seller: string;
  price: number;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ICreateBidEndResponse {}

const CreateBidEnd: IEnd<ICreateBidEndInput, ICreateBidEndResponse> = {
  configuration: { access: IEndConfigAccess.logins },
  method: IEndMethod.POST,
  url: '/collectible/bid',
  schema: {
    body: {
      type: 'object',
      properties: {
        collectibleID: { type: 'string' },
        seller: { type: 'string' },
        price: { type: 'number' }
      },
      required: ['collectible', 'seller', 'price']
    }
  },
  handler: async function (
    heads: IEndHead,
    input: ICreateBidEndInput
  ): Promise<IEndOutput<ICreateBidEndResponse>> {
    const response = await createBidLogic(heads.loginObj!.user!, input);
    if (response.statusCode == 200)
      return { statusCode: response.statusCode, response: response.data! };
    else
      return {
        statusCode: response.statusCode,
        response: { err: response.err! }
      };
  },
  docs: {
    name: 'create bid',
    description: 'create bid metadata in localDB',
    sampleInput: {
      collectible: testDataSpec.collectibles[0]._id,
      seller: testDataSpec.users[1].accountID,
      price: 0.02
    }
  }
};

export default CreateBidEnd;
