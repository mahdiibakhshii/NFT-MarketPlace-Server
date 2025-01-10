import IEnd, {
  IEndConfigAccess,
  IEndHead,
  IEndInput,
  IEndMethod,
  IEndOutput
} from '../IEnd.js';
import { ObjectIDType } from '../../helpers/aliases.js';
import { ICollectible } from '../../models/collectible.js';
import { getCollectibleAvailCountToTransferLogic } from '../../logic/collectible/getCollectibleAvailCountToTransferLogic.js';
import testDataSpec from '../../../test/testData.spec.js';
interface IGetCollectibleAvailCountToTransferEndInput extends IEndInput {
  collectibleID: ObjectIDType<ICollectible>;
}
interface IGetCollectibleAvailCountToTransferEndEndResponse {
  availCount?: number;
  err?: string;
}

const CollectibleAvailCountToTransferEnd: IEnd<
  IGetCollectibleAvailCountToTransferEndInput,
  IGetCollectibleAvailCountToTransferEndEndResponse
> = {
  configuration: { access: IEndConfigAccess.logins },
  method: IEndMethod.GET,
  url: '/collectible/transfer/:collectibleID',
  schema: {},
  handler: async function (
    heads: IEndHead,
    input: IGetCollectibleAvailCountToTransferEndInput
  ): Promise<IEndOutput<IGetCollectibleAvailCountToTransferEndEndResponse>> {
    const response = await getCollectibleAvailCountToTransferLogic(
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
    name: 'Collecitble avail count',
    description:
      'get collecitble avail count to transfer. this api calls before sending transfer transaction to contract and ui limits its input by this response.',
    sampleInput: {
      collectibleID: testDataSpec.collectibles[0]._id
    }
  }
};

export default CollectibleAvailCountToTransferEnd;
