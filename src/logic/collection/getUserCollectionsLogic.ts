import { ICollection } from '../../models/collection.js';
import CollectionRepo from '../../repos/collectionRepo.js';
import { ObjectIDType } from '../../helpers/aliases.js';
import { IUser } from '../../models/user.js';

export async function getUserCollectionsLogic(
  userID: ObjectIDType<IUser>
): Promise<{ collections: Partial<ICollection>[] }> {
  const collections = await CollectionRepo.getUserCollections(userID);
  return {
    collections: collections!
  };
}
