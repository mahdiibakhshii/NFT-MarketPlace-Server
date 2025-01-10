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
import { mintCollectibleLogic } from '../../logic/collectible/mintCollectibleLogic.js';
interface IMintCollectibleEndInput extends IEndInput {
  collectibleID: ObjectIDType<ICollectible>;
}
interface IMintCollectibleEndResponse {
  ipfs?: string;
  tokenId?: number;
  err?: string;
}

const CollectibleGetMintDataEnd: IEnd<
  IMintCollectibleEndInput,
  IMintCollectibleEndResponse
> = {
  configuration: { access: IEndConfigAccess.logins },
  method: IEndMethod.GET,
  url: '/collectible/mint/:collectibleID',
  schema: {},
  handler: async function (
    heads: IEndHead,
    input: IMintCollectibleEndInput
  ): Promise<IEndOutput<IMintCollectibleEndResponse>> {
    const response = await mintCollectibleLogic(
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
    name: 'Collectible Mint Data',
    description: 'Get required data to mint the collectible.',
    sampleInput: { collectibleID: testDataSpec.collectibles[1]._id }
  }
};

export default CollectibleGetMintDataEnd;
