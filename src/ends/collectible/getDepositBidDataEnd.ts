import IEnd, {
  IEndConfigAccess,
  IEndHead,
  IEndInput,
  IEndMethod,
  IEndOutput
} from '../IEnd.js';
import { ObjectIDType } from '../../helpers/aliases.js';
import testDataSpec from '../../../test/testData.spec.js';
import { getDepositBidDataLogic } from '../../logic/collectible/getDepositBidDataLogic.js';
import { IBid } from '../../models/bid.js';
interface IGetDepositDataEndInput extends IEndInput {
  bidID: ObjectIDType<IBid>;
}
interface IGetDepositDataEndResponse {
  collectionAddress?: string;
  tokenId?: number;
  auctionNum?: number;
  owner?: string;
  floorPrice?: number;
  bidAmount?: number;
  signature?: string;
  err?: string;
}

const CollectibleGetDepositDataEnd: IEnd<
  IGetDepositDataEndInput,
  IGetDepositDataEndResponse
> = {
  configuration: { access: IEndConfigAccess.logins },
  method: IEndMethod.GET,
  url: '/collectible/bid/deposit/:bidID',
  schema: {},
  handler: async function (
    heads: IEndHead,
    input: IGetDepositDataEndInput
  ): Promise<IEndOutput<IGetDepositDataEndResponse>> {
    const response = await getDepositBidDataLogic(input.bidID);
    if (response.statusCode == 200)
      return { statusCode: response.statusCode, response: response.data! };
    else
      return {
        statusCode: response.statusCode,
        response: { err: response.err! }
      };
  },
  docs: {
    name: 'Bid Deposit Data',
    description: 'Get required data for depositing the bid.',
    sampleInput: {
      bidID: testDataSpec.bids[0]._id
    }
  }
};

export default CollectibleGetDepositDataEnd;
