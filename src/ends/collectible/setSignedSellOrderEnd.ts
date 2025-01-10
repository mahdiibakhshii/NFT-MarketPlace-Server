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
import { setSignSellOrderLogic } from '../../logic/collectible/setSignSellOrderResultLogic.js';
interface ISetSignedSellOrderEndInput extends IEndInput {
  collectibleID: ObjectIDType<ICollectible>;
  signerAddress: string;
  signature: string;
  price: number;
  amount: number;
  sellMethod: number;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ISetSignedSellOrderEndResponse {}

const SetSignedSellOrderEnd: IEnd<
  ISetSignedSellOrderEndInput,
  ISetSignedSellOrderEndResponse
> = {
  configuration: { access: IEndConfigAccess.logins },
  method: IEndMethod.POST,
  url: '/collectible/sign',
  schema: {
    body: {
      type: 'object',
      properties: {
        collectibleID: { type: 'string' },
        signerAddress: { type: 'string' },
        signature: { type: 'string' },
        price: { type: 'number' },
        amount: { type: 'number' },
        sellMethod: { type: 'number' }
      },
      required: [
        'collectibleID',
        'signerAddress',
        'signature',
        'price',
        'sellMethod'
      ]
    }
  },
  handler: async function (
    heads: IEndHead,
    input: ISetSignedSellOrderEndInput
  ): Promise<IEndOutput<ISetSignedSellOrderEndResponse>> {
    const response = await setSignSellOrderLogic(heads!.loginObj!.user, input);
    if (response.statusCode == 200)
      return { statusCode: response.statusCode, response: response.data! };
    else
      return {
        statusCode: response.statusCode,
        response: { err: response.err! }
      };
  },
  docs: {
    name: 'Set Sell Order Signature',
    description: 'set signed sell order signing result.',
    sampleInput: {
      collectibleID: testDataSpec.collectibles[2]._id,
      signerAddress: testDataSpec.users[0].accountID,
      signature:
        '0xa86b66870311a160ecb97ebb3cfbb168966b066ff4e8baa905ab829ec52e561510bdfbda83e74a6c962bfebc5e7998c5ab94b1c70ece230f8124a8d0b1f9ad301b',
      price: 0.01,
      amount: 1,
      sellMethod: 1
    }
  }
};

export default SetSignedSellOrderEnd;
