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
import { getSignCollectibleLogic } from '../../logic/collectible/getSignCollectibleLogic.js';
interface IGetSignSellOrderEndInput extends IEndInput {
  collectibleID: ObjectIDType<ICollectible>;
  amount: number;
}
interface IGetSignSellOrderEndResponse {
  collectionAddress?: string;
  collectibleId?: number;
  err?: string;
}

const CollectibleGetSignSellOrderEnd: IEnd<
  IGetSignSellOrderEndInput,
  IGetSignSellOrderEndResponse
> = {
  configuration: { access: IEndConfigAccess.logins },
  method: IEndMethod.GET,
  url: '/collectible/sign/:collectibleID',
  schema: {},
  handler: async function (
    heads: IEndHead,
    input: IGetSignSellOrderEndInput
  ): Promise<IEndOutput<IGetSignSellOrderEndResponse>> {
    if (!input.amount)
      return {
        statusCode: 409,
        response: { err: 'api needs amount as query param!' }
      };
    const response = await getSignCollectibleLogic(
      heads!.loginObj!.user,
      input.collectibleID,
      input.amount
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
    name: 'sign Collectible',
    description: 'get sign collectible data with given id in the params',
    sampleInput: { collectibleID: testDataSpec.collectibles[2]._id, amount: 1 }
  }
};

export default CollectibleGetSignSellOrderEnd;
