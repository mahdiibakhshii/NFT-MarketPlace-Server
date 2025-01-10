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
import { IBid } from '../../models/bid.js';
import { checkIfBidIsCreated } from '../../logic/bid/checkIfBidIsCreatedLogic.js';
import { IListOnSale } from '@models/listOnSale.js';
interface ICheckCreatedBidEndInput extends IEndInput {
  collectibleID: ObjectIDType<ICollectible>;
  auctionID: ObjectIDType<IListOnSale>;
}
interface ICheckCreatedBidEndResponse {
  isCreated?: boolean;
  bid?: Partial<IBid>;
  err?: string;
}

const CollectibleCheckCreatedBidEnd: IEnd<
  ICheckCreatedBidEndInput,
  ICheckCreatedBidEndResponse
> = {
  configuration: { access: IEndConfigAccess.logins },
  method: IEndMethod.GET,
  url: '/collectible/checkBid/:collectibleID/:auctionID',
  schema: {},
  handler: async function (
    heads: IEndHead,
    input: ICheckCreatedBidEndInput
  ): Promise<IEndOutput<ICheckCreatedBidEndResponse>> {
    const response = await checkIfBidIsCreated(
      heads!.loginObj!.user,
      input.collectibleID,
      input.auctionID
    );
    if (response.statusCode == 200)
      return {
        statusCode: response.statusCode,
        response: { isCreated: response.isCreated, bid: response.bid! }
      };
    else
      return {
        statusCode: response.statusCode,
        response: { err: response.err! }
      };
  },
  docs: {
    name: 'Check Bid exists',
    description:
      'before submiting new bid, this api calls. if there is initialized but not actived bid for a user on a specific auction, api returns the bid data to be updated and active.',
    sampleInput: {
      collectibleID: testDataSpec.collectibles[0]._id,
      auctionID: testDataSpec.listonsales[1]._id
    }
  }
};

export default CollectibleCheckCreatedBidEnd;
