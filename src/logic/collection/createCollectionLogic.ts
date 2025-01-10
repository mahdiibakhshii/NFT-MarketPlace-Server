import { ICollection } from '../../models/collection.js';
import CollectionRepo from '../../repos/collectionRepo.js';
import { ObjectIDType } from '../../helpers/aliases.js';
import { IUser } from '../../models/user.js';

interface collectionObjLogicInput {
  title: string;
  symbol: string;
  description: string;
  color: string;
}

export async function createCollectionLogic(
  userID: ObjectIDType<IUser>,
  collectionObj: collectionObjLogicInput
): Promise<{
  statusCode: number;
  data: ObjectIDType<ICollection> | undefined;
  err: string | undefined;
}> {
  try {
    const collectionResult = await CollectionRepo.createCollection({
      creator: userID,
      isDeployed: false,
      ...collectionObj
    });
    return { statusCode: 200, data: collectionResult._id, err: undefined };
  } catch (e) {
    console.error(e);
    return {
      statusCode: 500,
      data: undefined,
      err: 'create collection failed!'
    };
  }
}
