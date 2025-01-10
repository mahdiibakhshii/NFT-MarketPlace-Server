import { IBid } from '@models/bid.js';
import { homeTrendLogic } from '../../logic/pages/homeTrendLogic.js';
import IEnd, {
  IEndConfigAccess,
  IEndInput,
  IEndMethod,
  IEndOutput
} from '../IEnd.js';
type IHomeGetTrendCollectibleEndInput = IEndInput;
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IHomeGetTrendCollectibleEndResponse {
  sec1: any;
  // sec2: Partial<ICollectible>[];
  // sec3: Partial<ICollectible>[];
  // sec4: Partial<ICollectible>[];
}

const HomeGetTrendCollectibleEnd: IEnd<
  IHomeGetTrendCollectibleEndInput,
  IHomeGetTrendCollectibleEndResponse
> = {
  configuration: { access: IEndConfigAccess.public },
  method: IEndMethod.GET,
  url: '/home/trend',
  schema: {},
  handler: async function (): Promise<
    IEndOutput<IHomeGetTrendCollectibleEndResponse>
  > {
    const res = await homeTrendLogic();
    return { statusCode: 200, response: res };
  },
  docs: {
    name: 'Home page',
    description: 'Get home page data',
    sampleInput: {}
  }
};

export default HomeGetTrendCollectibleEnd;
