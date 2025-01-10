import CollectibleRepo, {
  INewestCollectibles
} from '../../repos/collectibleRepo.js';

export async function getNewestOrderedCollectibleLogic(
  page: number,
  count: number
): Promise<INewestCollectibles[]> {
  try {
    return await CollectibleRepo.getNewestOrderedCollectibles(
      page,
      parseInt(count.toString())
    );
  } catch (e) {
    console.log(e);
    throw e;
  }
}
