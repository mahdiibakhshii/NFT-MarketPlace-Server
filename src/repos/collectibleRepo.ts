import mongoose from 'mongoose';
import { IUser } from '../models/user.js';
import { ObjectIDType } from '../helpers/aliases.js';
import {
  collectibleModel,
  collectibleState,
  ICollectible
} from '../models/collectible.js';
import { bidStateEnum, IBid } from '../models/bid.js';
import { ICollection } from '@models/collection.js';

export interface INewestCollectibles extends ICollectible {
  highestBid?: Partial<IBid> | null;
}

async function createCollectible(
  collectibleObj: Partial<ICollectible>
): Promise<Partial<ICollectible>> {
  return await collectibleModel.create(collectibleObj);
}

async function getByCollectibleID(
  collectibleID: ObjectIDType<ICollectible>
): Promise<Partial<ICollectible> | null> {
  return await collectibleModel.findById(collectibleID);
}

async function getByCollectionIDandTokenID(
  collectionID: ObjectIDType<ICollection>,
  tokenID: number
): Promise<Partial<ICollectible> | null> {
  return await collectibleModel.findOne({
    collectionID: collectionID,
    tokenID: tokenID
  });
}

async function updateIpfsByCollectibleID(
  collectibleID: ObjectIDType<ICollectible>,
  imageURI: string
): Promise<Partial<ICollectible> | null> {
  return await collectibleModel.findOneAndUpdate(
    { _id: collectibleID },
    { $set: { ipfsURI: imageURI } }
  );
}

async function setTokenIDByCollectibleID(
  collectibleID: ObjectIDType<ICollectible>,
  tokenID: number
): Promise<Partial<ICollectible> | null> {
  return await collectibleModel.findOneAndUpdate(
    { _id: collectibleID },
    { $set: { tokenID: tokenID, state: 1 } }
  );
}

async function getOwnerCountByCollectibleID(
  collectibleID: ObjectIDType<ICollectible>,
  ownerID: ObjectIDType<IUser>
) {
  return await collectibleModel
    .findOne({
      _id: collectibleID,
      'owners.owner': ownerID
    })
    .select({ owners: 1 })
    .then((result) => {
      if (!result) return null;
      const x = result.owners?.find((elm) => {
        if (elm.owner.toString() == ownerID.toString()) return elm.count;
      });
      return x?.count;
    });
}

async function setOwnerByCollectibleID(
  collectibleID: ObjectIDType<ICollectible>,
  newOwner: ObjectIDType<IUser>,
  count: number
): Promise<Partial<ICollectible> | null> {
  return await collectibleModel.findOneAndUpdate(
    { _id: collectibleID },
    { $push: { owners: { owner: newOwner, count: count } } }
  );
}

async function updateOwnerCountByCollectibleID(
  collectibleID: ObjectIDType<ICollectible>,
  owner: ObjectIDType<IUser>,
  count: number
): Promise<Partial<ICollectible> | null> {
  const ownerCount = await getOwnerCountByCollectibleID(collectibleID, owner);
  console.log('owner count', ownerCount);
  if (ownerCount && ownerCount + count <= 0) {
    try {
      console.log('removing owner');
      return await collectibleModel.findOneAndUpdate(
        {
          _id: collectibleID,
          'owners.owner': owner
        },
        { $pull: { owners: { owner: owner } } }
      );
    } catch (e) {
      console.log({ e });
    }
  }

  return await collectibleModel.findOneAndUpdate(
    { _id: collectibleID, 'owners.owner': owner },
    { $inc: { 'owners.$.count': count } }
  );
}

async function getNewestOrderedCollectibles(
  page: number,
  countPerPage: number
): Promise<INewestCollectibles[]> {
  //TODO: here we sort collectibles by their updatedAt property. in future we should
  //      new property to save the time that collectible set sell order and sort by that property here.
  page = page || 1;
  countPerPage = countPerPage || 8;

  return await collectibleModel.aggregate([
    { $match: { state: collectibleState.sellOrderSigned } },
    { $sort: { createdAt: -1 } },
    { $skip: (page - 1) * countPerPage },
    { $limit: countPerPage },
    {
      $lookup: {
        from: 'users',
        localField: 'creator',
        foreignField: '_id',
        as: 'creator'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'owners.owner',
        foreignField: '_id',
        as: 'owner'
      }
    },
    {
      $lookup: {
        from: 'bids',
        as: 'highestBid',
        let: { collectibleID: '$_id' },
        pipeline: [
          {
            $match: {
              $and: [
                {
                  $expr: {
                    $eq: ['$$collectibleID', '$collectible']
                  }
                },
                {
                  $expr: {
                    $eq: [bidStateEnum.approved, '$state']
                  }
                }
              ]
            }
          }
        ]
      }
    },
    { $unwind: { path: '$highestBid', preserveNullAndEmptyArrays: true } },

    { $sort: { 'highestBid.price': -1 } },
    {
      $group: {
        _id: '$_id',
        creator: { $first: '$creator' },
        owners: { $first: '$owners' },
        name: { $first: '$name' },
        sellMethod: { $first: '$sellMethod' },
        sellPrice: { $first: '$sellPrice' },
        imageHash: { $first: '$imageHash' },
        volume: { $first: '$volume' },
        state: { $first: '$state' },
        tokenID: { $first: '$tokenID' },
        soldItem: { $first: '$soldItem' },
        highestBid: { $first: '$highestBid' },
        createdAt: { $first: '$createdAt' }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'highestBid.bidder',
        foreignField: '_id',
        as: 'highestBid.bidder'
      }
    },
    {
      $unwind: { path: '$highestBid.bidder', preserveNullAndEmptyArrays: true }
    },
    { $unwind: '$creator' },
    { $sort: { createdAt: -1 } },
    {
      $project: {
        _id: 1,
        creator: {
          _id: 1,
          accountID: 1,
          name: 1,
          medias: { profilePic: { hash: 1 } }
        },
        name: 1,
        sellMethod: 1,
        sellPrice: 1,
        imageHash: 1,
        volume: 1,
        soldItem: 1,
        state: 1,
        tokenID: 1,
        highestBid: {
          bidder: { _id: 1, name: 1, medias: { profilePic: { hash: 1 } } },
          price: 1
        }
      }
    }
  ]);
}

async function getCollectibleInfo(
  collectibleID: ObjectIDType<ICollectible>
): Promise<Partial<ICollectible> | null> {
  return await collectibleModel
    .findOne({ _id: collectibleID })
    .populate({
      path: 'creator',
      select: { name: 1, 'medias.profilePic.hash': 1, accountID: 1 }
    })
    .populate({
      path: 'owners.owner',
      select: { name: 1, 'medias.profilePic.hash': 1, accountID: 1 }
    })
    .populate({
      path: 'collectionID',
      select: { title: 1, color: 1, contractAddress: 1 }
    })
    .select({
      name: 1,
      description: 1,
      collectionID: 1,
      sellMethod: 1,
      sellPrice: 1,
      imageHash: 1,
      volume: 1,
      state: 1,
      tokenID: 1,
      soldItem: 1,
      ipfsURI: 1,
      owners: 1
    });
}

async function getTotalAvailableCollectibleCount(
  collectibleID: ObjectIDType<ICollectible>
): Promise<number> {
  return await collectibleModel
    .aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(collectibleID.toString()) }
      },
      { $unwind: '$owners' },
      { $group: { _id: '$_id', total: { $sum: '$owners.count' } } }
    ])
    .then(function (x) {
      if (x[0]) return x[0].total;
    });
}

async function checkCollectibleOwnershipByUserID(
  collectibleID: ObjectIDType<ICollectible>,
  userID: ObjectIDType<IUser>
): Promise<{ _id: ObjectIDType<ICollectible> } | null> {
  return await collectibleModel.exists({
    _id: collectibleID,
    'owners.owner': userID
  });
}

async function getCollectiblesForDashboardByUserID(
  userID: ObjectIDType<IUser>
): Promise<Partial<ICollectible>[]> {
  return await collectibleModel.aggregate([
    { $match: { 'owners.owner': userID } },
    {
      $lookup: {
        from: 'collections',
        localField: 'collectionID',
        foreignField: '_id',
        as: 'collection'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'creator',
        foreignField: '_id',
        as: 'creator'
      }
    },
    {
      $project: {
        owners: {
          $filter: {
            input: '$owners',
            as: 'owner',
            cond: { $eq: ['$$owner.owner', userID] }
          }
        },
        creator: { accountID: 1, name: 1, medias: { profilePic: { hash: 1 } } },
        collection: { title: 1 },
        name: 1,
        imageHash: 1,
        ipfsURI: 1,
        tokenID: 1,
        volume: 1,
        createdAt: 1
      }
    },
    { $unwind: '$owners' },
    { $unwind: '$collection' },
    { $sort: { createdAt: -1 } }
  ]);
}

const CollectibleRepo = {
  createCollectible,
  getByCollectibleID,
  getNewestOrderedCollectibles,
  setTokenIDByCollectibleID,
  setOwnerByCollectibleID,
  getCollectibleInfo,
  getOwnerCountByCollectibleID,
  updateOwnerCountByCollectibleID,
  checkCollectibleOwnershipByUserID,
  getTotalAvailableCollectibleCount,
  updateIpfsByCollectibleID,
  getByCollectionIDandTokenID,
  getCollectiblesForDashboardByUserID
};
export default CollectibleRepo;
