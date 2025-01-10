import IEnd, {
  IEndConfigAccess,
  IEndHead,
  IEndInput,
  IEndMethod,
  IEndOutput
} from '../IEnd.js';
import { ObjectIDType } from '../../helpers/aliases.js';
import { createCollectibleLogic } from '../../logic/collectible/createCollectibleLogic.js';
import { ICollectible, sellMethodEnum } from '../../models/collectible';
import { ICollection } from '@models/collection.js';
import testDataSpec from '../../../test/testData.spec.js';

interface ICreateCollectibleEndInput extends IEndInput {
  collectionID: ObjectIDType<ICollection>;
  name: string;
  description: string;
  media: any;
  royalty: number;
  property: string;
  sellMethod: sellMethodEnum;
  sellPrice: number;
  isLock: boolean;
  volume: number;
}

interface ICreateCollectibleEndResponse {
  collectibleID?: ObjectIDType<ICollectible>;
  err?: string;
}

const CollectibleCreateEnd: IEnd<
  ICreateCollectibleEndInput,
  ICreateCollectibleEndResponse
> = {
  configuration: {
    access: IEndConfigAccess.logins
  },
  method: IEndMethod.POST,
  url: '/collectible/metadata',
  schema: {
    body: {
      type: 'object',
      properties: {
        collectionID: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string' },
        media: { type: 'object' },
        royalty: { type: 'number' },
        property: {
          type: 'string'
        },
        sellMethod: { type: 'number' },
        sellPrice: { type: 'number' },
        isLock: { type: 'boolean' },
        volume: { type: 'number' }
      },
      required: ['collectionID', 'name', 'sellMethod', 'volume']
    }
  },
  handler: async function (
    heads: IEndHead,
    input: ICreateCollectibleEndInput
  ): Promise<IEndOutput<ICreateCollectibleEndResponse>> {
    const response = await createCollectibleLogic(heads.loginObj!.user!, input);
    if (response.statusCode === 201)
      return {
        statusCode: response.statusCode,
        response: { collectibleID: response.data }
      };
    else {
      return {
        statusCode: response.statusCode,
        response: { err: response.err }
      };
    }
  },
  docs: {
    name: 'Create Collectible',
    description: 'Create collectible metadata in local DB',
    sampleInput: {
      collectionID: testDataSpec.collections[0]._id,
      name: 'test Collectible',
      description: 'test description',
      media: '',
      royalty: 10,
      property: '{}',
      sellMethod: 1,
      sellPrice: 100,
      isLock: false,
      volume: 1
    }
  }
};

export default CollectibleCreateEnd;
