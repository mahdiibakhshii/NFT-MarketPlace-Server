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
import { purchaseCollectibleLogic } from '../../logic/collectible/purchaseCollectibleLogic.js';
import { IListOnSale } from '../../models/listOnSale.js';
interface IPurchaseCollectibleEndInput extends IEndInput {
  collectibleID: ObjectIDType<ICollectible>;
  sellerAccountID: string;
}
interface IPurchaseCollectibleEndResponse {
  data?: Partial<IListOnSale>;
  err?: string;
}

const CollectibleGetPurchaseDataEnd: IEnd<
  IPurchaseCollectibleEndInput,
  IPurchaseCollectibleEndResponse
> = {
  configuration: { access: IEndConfigAccess.logins },
  method: IEndMethod.GET,
  url: '/collectible/purchase/:collectibleID/:sellerAccountID',
  schema: {},
  handler: async function (
    heads: IEndHead,
    input: IPurchaseCollectibleEndInput
  ): Promise<IEndOutput<IPurchaseCollectibleEndResponse>> {
    const response = await purchaseCollectibleLogic(
      input.collectibleID,
      input.sellerAccountID
    );
    if (response.statusCode == 200)
      return { statusCode: response.statusCode, response: response! };
    else
      return {
        statusCode: response.statusCode,
        response: { err: response.err! }
      };
  },
  docs: {
    name: 'Collectible Purchase Data',
    description: 'Get required data to purchase a collectible from a owner.',
    sampleInput: {
      collectibleID: testDataSpec.collectibles[0]._id,
      sellerAccountID: testDataSpec.users[0].accountID
    }
  }
};

export default CollectibleGetPurchaseDataEnd;
