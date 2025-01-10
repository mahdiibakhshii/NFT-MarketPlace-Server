import IEnd, {
  IEndConfigAccess,
  IEndHead,
  IEndInput,
  IEndMethod,
  IEndOutput
} from '../IEnd.js';
import { ObjectIDType } from '../../helpers/aliases.js';
import testDataSpec from '../../../test/testData.spec.js';
import { IBid } from '../../models/bid.js';
import { setSignedBidSignatureLogic } from '../../logic/collectible/setSignedBidSignatureLogic.js';
interface ISetSignedBidSignatureEndInput extends IEndInput {
  bidID: ObjectIDType<IBid>;
  signerAddress: string;
  signature: string;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ISetSignedSellOrderEndResponse {}

const SetSignedBidSignatureEnd: IEnd<
  ISetSignedBidSignatureEndInput,
  ISetSignedSellOrderEndResponse
> = {
  configuration: { access: IEndConfigAccess.logins },
  method: IEndMethod.POST,
  url: '/bid/sign',
  schema: {
    body: {
      type: 'object',
      properties: {
        bidID: { type: 'string' },
        signerAddress: { type: 'string' },
        signature: { type: 'string' }
      },
      required: ['bidID', 'signerAddress', 'signature']
    }
  },
  handler: async function (
    heads: IEndHead,
    input: ISetSignedBidSignatureEndInput
  ): Promise<IEndOutput<ISetSignedSellOrderEndResponse>> {
    const response = await setSignedBidSignatureLogic(
      heads!.loginObj!.user,
      input.bidID,
      input.signerAddress,
      input.signature
    );
    if (response.statusCode == 200)
      return { statusCode: response.statusCode, response: response.data! };
    else
      return {
        statusCode: response.statusCode,
        response: { err: response.err! }
      };
  },
  docs: {
    name: 'Set Bid Signrature',
    description: 'set signed bid signature',
    sampleInput: {
      bidID: testDataSpec.bids[1]._id,
      signerAddress: testDataSpec.users[0].accountID,
      signature:
        '0x0afba002bd5def653d4ebc024e6451d9f6bed220cdfdba1d6eead180bde18dc13bb983b90961deeb29ae86cdae9ba7c76a33482ef72c129ba79e0ed200a787331b'
    }
  }
};

export default SetSignedBidSignatureEnd;
