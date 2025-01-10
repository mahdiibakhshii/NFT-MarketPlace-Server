import { getNewestOrderedCollectibleLogic } from '../../logic/collectible/getNewestOrderdCollectibleLogic.js';

import IEnd, {
  IEndConfigAccess,
  IEndHead,
  IEndInput,
  IEndMethod,
  IEndOutput
} from '../IEnd.js';
interface IHomeGetDiscoverCollectibleEndInput extends IEndInput {
  page: number;
  count: number;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IHomeGetDiscoverCollectibleEndResponse {
  // data: any;
  // sec2: Partial<ICollectible>[];
  // sec3: Partial<ICollectible>[];
  // sec4: Partial<ICollectible>[];
}

const HomeGetDiscoverCollectibleEnd: IEnd<
  IHomeGetDiscoverCollectibleEndInput,
  IHomeGetDiscoverCollectibleEndResponse
> = {
  configuration: { access: IEndConfigAccess.public },
  method: IEndMethod.GET,
  url: '/home/discover',
  schema: {},
  handler: async function (
    head: IEndHead,
    input: IHomeGetDiscoverCollectibleEndInput
  ): Promise<IEndOutput<IHomeGetDiscoverCollectibleEndResponse>> {
    const res = await getNewestOrderedCollectibleLogic(input.page, input.count);
    return { statusCode: 200, response: res };
  },
  docs: {
    name: 'Home discovery',
    description: 'Get discovery section data at Home page with pagination',
    sampleInput: { page: 1, count: 8 }
  }
};

export default HomeGetDiscoverCollectibleEnd;
