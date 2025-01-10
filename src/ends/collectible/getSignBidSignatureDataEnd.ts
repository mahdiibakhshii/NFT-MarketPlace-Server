import IEnd, {
  IEndConfigAccess,
  IEndHead,
  IEndInput,
  IEndMethod,
  IEndOutput
} from '../IEnd.js';
import { ObjectIDType } from '../../helpers/aliases.js';
import testDataSpec from '../../../test/testData.spec.js';
import { getSignBidSignatureDataLogic } from '../../logic/collectible/getSignBidSignatureDataLogic.js';
import { IBid } from '../../models/bid.js';
interface IGetSignBidSignatureEndInput extends IEndInput {
  bidID: ObjectIDType<IBid>;
}
interface IGetSignBidSignatureEndResponse {
  collectionAddress?: string;
  tokenId?: number;
  auctionNum?: number;
  owner?: string;
  floorPrice?: number;
  bidAmount?: number;
  err?: string;
}

const CollectibleGetSignBidSignatureEnd: IEnd<
  IGetSignBidSignatureEndInput,
  IGetSignBidSignatureEndResponse
> = {
  configuration: { access: IEndConfigAccess.logins },
  method: IEndMethod.GET,
  url: '/bid/sign/:bidID',
  schema: {},
  handler: async function (
    heads: IEndHead,
    input: IGetSignBidSignatureEndInput
  ): Promise<IEndOutput<IGetSignBidSignatureEndResponse>> {
    const response = await getSignBidSignatureDataLogic(
      heads!.loginObj!.user,
      input.bidID
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
    name: 'Bid Sign Data',
    description: 'get required data to sign a bid.',
    sampleInput: { bidID: testDataSpec.bids[1]._id }
  }
};

export default CollectibleGetSignBidSignatureEnd;
