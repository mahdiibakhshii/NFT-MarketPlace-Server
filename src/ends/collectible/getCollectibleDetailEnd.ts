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
import { getCollectibleDetailLogic } from '../../logic/collectible/getCollectibleDetailLogic.js';
import { IBid } from '../../models/bid.js';
import { IActivity } from '@models/activity.js';
interface ICollectibleDetailEndInput extends IEndInput {
  collectibleID: ObjectIDType<ICollectible>;
}
interface ICollectibleDetailEndResponse {
  info?: Partial<ICollectible>;
  owners?: [];
  history?: Partial<IActivity>[];
  bids?: Partial<IBid>[];
  isOwner?: boolean;
  ownerHasActiveList?: boolean;
  err?: unknown;
}

const CollectibleGetDetailEnd: IEnd<
  ICollectibleDetailEndInput,
  ICollectibleDetailEndResponse
> = {
  configuration: { access: IEndConfigAccess.public },
  method: IEndMethod.GET,
  url: '/collectible/detail/:collectibleID',
  schema: {},
  handler: async function (
    heads: IEndHead,
    input: ICollectibleDetailEndInput
  ): Promise<IEndOutput<ICollectibleDetailEndResponse>> {
    try {
      const response = await getCollectibleDetailLogic(
        heads!.loginObj === undefined ? undefined : heads!.loginObj.user,
        input.collectibleID
      );
      if (response.statusCode == 200)
        return { statusCode: response.statusCode, response: response.data! };
      else
        return {
          statusCode: response.statusCode,
          response: { err: response.err! }
        };
    } catch (e) {
      return {
        statusCode: 500,
        response: { err: e }
      };
    }
  },
  docs: {
    name: 'Collectible Detail',
    description: 'Get collectible detail data for collectible single page.',
    sampleInput: { collectibleID: testDataSpec.collectibles[0]._id }
  }
};

export default CollectibleGetDetailEnd;
