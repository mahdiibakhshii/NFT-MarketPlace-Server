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
import { setMintResultLogic } from '../../logic/collectible/setMintResultLogic.js';
interface ISetMintResultEndInput extends IEndInput {
  collectibleID: ObjectIDType<ICollectible>;
  tokenID: number;
  contractAddress: string;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ISetMintResultEndResponse {}

const SetMintResultEnd: IEnd<
  ISetMintResultEndInput,
  ISetMintResultEndResponse
> = {
  configuration: { access: IEndConfigAccess.logins },
  method: IEndMethod.POST,
  url: '/collectible/mint',
  schema: {
    body: {
      type: 'object',
      properties: {
        collectibleID: { type: 'string' },
        tokenID: { type: 'number' },
        contractAddress: { type: 'string' }
      },
      required: ['collectibleID', 'tokenID', 'contractAddress']
    }
  },
  handler: async function (
    heads: IEndHead,
    input: ISetMintResultEndInput
  ): Promise<IEndOutput<ISetMintResultEndResponse>> {
    const response = await setMintResultLogic(heads!.loginObj!.user, input);
    if (response.statusCode == 200)
      return { statusCode: response.statusCode, response: response.data! };
    else
      return {
        statusCode: response.statusCode,
        response: { err: response.err! }
      };
  },
  docs: {
    name: 'Set Mint Result',
    description: 'set mint collectible result into DataBase.',
    sampleInput: {
      collectibleID: testDataSpec.collectibles[3]._id,
      tokenID: testDataSpec.collectibles[3].tokenID,
      contractAddress: testDataSpec.collections[0].contractAddress
    }
  }
};

export default SetMintResultEnd;
