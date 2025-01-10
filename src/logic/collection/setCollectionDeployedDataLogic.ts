import fs from 'fs';
import { ICollection } from '../../models/collection.js';
import CollectionRepo from '../../repos/collectionRepo.js';
import { ObjectIDType } from '../../helpers/aliases.js';

interface collectionObjLogicInput {
  collectionID: ObjectIDType<ICollection>;
  collectionAddress: string;
  collectionIndex: number;
}

export async function setCollectionDeployedDataLogic(
  collectionObj: collectionObjLogicInput
): Promise<{
  statusCode: number;
  data: Partial<ICollection> | undefined;
  err: string | undefined;
}> {
  try {
    const isCollectionExist =
      (await CollectionRepo.getByCollectionID(collectionObj.collectionID)) ===
      null
        ? false
        : true;
    if (!isCollectionExist) {
      return {
        statusCode: 404,
        data: undefined,
        err: 'collection not found!'
      };
    }
    const isCollectionWithContractExist =
      (await CollectionRepo.getByContractAddress(
        collectionObj.collectionAddress
      )) === null
        ? false
        : true;
    if (isCollectionWithContractExist) {
      return {
        statusCode: 409,
        data: undefined,
        err: 'collection with this contract address exists!'
      };
    }
    //create collection directory to store its ollectibles ipfs json files there.
    const collectionDirUrl =
      process.env.COLLECTIONS_METADATA_PATH! + collectionObj.collectionAddress;
    try {
      await fs.promises.mkdir(collectionDirUrl);
    } catch (err) {
      return {
        statusCode: 500,
        data: undefined,
        err: 'error in creating collection ipfs directory!'
      };
    }
    const collectionResult = await CollectionRepo.setCollectionDeployedData(
      collectionObj.collectionID,
      collectionObj.collectionAddress,
      collectionObj.collectionIndex
    );

    return { statusCode: 200, data: collectionResult!, err: undefined };
  } catch (e) {
    console.error(e);
    return {
      statusCode: 500,
      data: undefined,
      err: 'create collection failed!'
    };
  }
}
