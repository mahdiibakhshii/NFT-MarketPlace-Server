import { ObjectIDType } from '../../helpers/aliases.js';
import {
  collectibleState,
  ICollectible,
  ICollectibleProperty,
  sellMethodEnum
} from '../../models/collectible.js';
import { IUser } from '../../models/user.js';
import { ICollection } from '../../models/collection.js';
import CollectionRepo from '../../repos/collectionRepo.js';
import CollectibleRepo from '../../repos/collectibleRepo.js';
import { mediaUploadLogic } from '../../logic/media/mediaUploadLogic.js';
import { ForeignType, mediaTypes } from '../../models/media.js';

interface collectibleObjLogicInput {
  collectionID: ObjectIDType<ICollection>; //todo: should be ObjectIDType<ICollectible>
  name: string;
  description: string;
  media: any;
  royalty: number;
  property?: string;
  sellMethod: sellMethodEnum;
  sellPrice: number;
  isLock: boolean;
  volume: number;
}
export async function createCollectibleLogic(
  userID: ObjectIDType<IUser>,
  collectibleObj: collectibleObjLogicInput
): Promise<{
  statusCode: number;
  data: ObjectIDType<ICollectible> | undefined;
  err: string | undefined;
}> {
  try {
    //validate request
    const collectionObj = await CollectionRepo.getByCollectionID(
      collectibleObj.collectionID
    );
    if (collectionObj === null)
      return { statusCode: 404, data: undefined, err: 'collection not found!' };
    if (collectionObj?.creator!.toString() !== userID.toString())
      return {
        statusCode: 409,
        data: undefined,
        err: 'You have no access to mint collectible on this collection!'
      };

    //store collectible image locally
    const mediaResponse = await mediaUploadLogic(
      mediaTypes.image,
      collectibleObj.media,
      ForeignType.collectibleImage,
      userID
    );
    //create new collectible locally
    const decodedPropeties: ICollectibleProperty[] = JSON.parse(
      collectibleObj.property!
    );
    delete collectibleObj['property'];
    const collectibleData = await CollectibleRepo.createCollectible({
      creator: userID,
      imageLocal: process.env.DOCS_ENV ? undefined : mediaResponse.media._id,
      imageHash: mediaResponse.media.hash,
      ...collectibleObj,
      property: decodedPropeties,
      state: collectibleState.stored
    });
    return { statusCode: 201, data: collectibleData._id!, err: undefined };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, data: undefined, err: 'Unhandled error!' };
  }
}
