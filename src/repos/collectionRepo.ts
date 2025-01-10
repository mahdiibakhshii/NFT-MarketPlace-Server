import { CIDString } from 'nft.storage';
import { collectionModel, ICollection } from '../models/collection.js';
import { ObjectIDType } from '../helpers/aliases.js';
import { IUser } from '@models/user.js';

async function createCollection(
  collectionObj: Partial<ICollection>
): Promise<Partial<ICollection>> {
  return await collectionModel.create(collectionObj);
}

async function getByCollectionID(
  collectionID: ObjectIDType<ICollection>
): Promise<Partial<ICollection> | null> {
  return await collectionModel.findById(collectionID);
}
async function getByContractAddress(
  contractAddress: string
): Promise<Partial<ICollection> | null> {
  return await collectionModel.findOne({ contractAddress: contractAddress });
}
async function getUserCollections(
  userID: ObjectIDType<IUser>
): Promise<Partial<ICollection>[] | null> {
  return await collectionModel.find({ creator: userID });
}
async function getTokensCount(
  collectionID: ObjectIDType<ICollection>
): Promise<Partial<ICollection> | null> {
  return await collectionModel.findOne(
    { _id: collectionID },
    { tokensCount: 1, contractAddress: 1, contractIndex: 1 }
  );
}

async function updateIpfsCIDByCollectionID(
  collectionID: ObjectIDType<ICollection>,
  ipfsCID: CIDString
): Promise<Partial<ICollection> | null> {
  return await collectionModel.findOneAndUpdate(
    { _id: collectionID },
    { $set: { ipfsCID: ipfsCID } }
  );
}

async function setCollectionDeployedData(
  collectionID: ObjectIDType<ICollection>,
  collectionAddress: string,
  collectionIndex: number
): Promise<Partial<ICollection> | null> {
  return await collectionModel.findOneAndUpdate(
    { _id: collectionID },
    {
      $set: {
        contractAddress: collectionAddress,
        contractIndex: collectionIndex,
        isDeployed: true
      }
    }
  );
}

async function incrementTokensCountByContractAddress(
  contractAddress: string
): Promise<Partial<ICollection> | null> {
  return await collectionModel.findOneAndUpdate(
    { contractAddress: contractAddress },
    { $inc: { tokensCount: 1 } }
  );
}

const CollectionRepo = {
  createCollection,
  getByCollectionID,
  getTokensCount,
  getByContractAddress,
  getUserCollections,
  updateIpfsCIDByCollectionID,
  incrementTokensCountByContractAddress,
  setCollectionDeployedData
};
export default CollectionRepo;
