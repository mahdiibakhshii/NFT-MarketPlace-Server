import IEnd, {
  IEndConfigAccess,
  IEndHead,
  IEndInput,
  IEndMethod,
  IEndOutput
} from '../IEnd.js';
import { ObjectIDType } from '../../helpers/aliases.js';

import { createCollectionLogic } from '../../logic/collection/createCollectionLogic.js';
import { ICollection } from '../../models/collection.js';

interface ICreateCollectionEndInput extends IEndInput {
  title: string;
  symbol: string;
  description: string;
  color: string;
}

interface ICreateCollectionEndResponse {
  collectionID?: ObjectIDType<ICollection>;
  err?: string;
}

const CollectionCreateEnd: IEnd<
  ICreateCollectionEndInput,
  ICreateCollectionEndResponse
> = {
  configuration: {
    access: IEndConfigAccess.logins
  },
  method: IEndMethod.POST,
  url: '/collection/create',
  schema: {
    body: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        symbol: { type: 'string' },
        description: { type: 'string' },
        color: { type: 'string' }
      },
      required: ['title', 'symbol', 'color']
    }
  },
  handler: async function (
    heads: IEndHead,
    input: ICreateCollectionEndInput
  ): Promise<IEndOutput<ICreateCollectionEndResponse>> {
    const response = await createCollectionLogic(heads.loginObj!.user!, input);
    if (response.statusCode === 200) {
      return {
        statusCode: 200,
        response: { collectionID: response.data }
      };
    } else {
      return {
        statusCode: response.statusCode,
        response: { err: response.err }
      };
    }
  },
  docs: {
    name: 'Create Collection',
    description: 'Create collection instance in local DB',
    sampleInput: {
      title: 'sample title',
      symbol: 'eth',
      description: 'sample description',
      color: 'blue'
    }
  }
};

export default CollectionCreateEnd;
