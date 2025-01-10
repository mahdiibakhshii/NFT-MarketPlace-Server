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
import { removeListFromSaleLogic } from '../../logic/listOnSale/removeListFromSaleLogic.js';
interface IRemoveListFromSaleEndInput extends IEndInput {
  collectibleID: ObjectIDType<ICollectible>;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IRemoveListFromSaleEndResponse {}

const RemoveListFromSaleEnd: IEnd<
  IRemoveListFromSaleEndInput,
  IRemoveListFromSaleEndResponse
> = {
  configuration: { access: IEndConfigAccess.logins },
  method: IEndMethod.POST,
  url: '/collectible/listing/remove',
  schema: {
    body: {
      type: 'object',
      properties: {
        collectibleID: { type: 'string' }
      },
      required: ['collectibleID']
    }
  },
  handler: async function (
    heads: IEndHead,
    input: IRemoveListFromSaleEndInput
  ): Promise<IEndOutput<IRemoveListFromSaleEndResponse>> {
    const response = await removeListFromSaleLogic(
      heads!.loginObj!.user,
      input.collectibleID
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
    name: 'remove list from sale',
    description:
      'remove list from sale. only instant listing could be removed. auction would be removed by the code.',
    sampleInput: {
      collectibleID: testDataSpec.collectibles[0]._id
    }
  }
};

export default RemoveListFromSaleEnd;
