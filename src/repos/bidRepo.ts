import { ObjectIDType } from '@helpers/aliases.js';
import { ICollectible } from '@models/collectible.js';
import { IUser } from '@models/user.js';
import { IListOnSale, listOnSaleStateEnum } from '../models/listOnSale.js';
import { bidModel, bidStateEnum, IBid } from '../models/bid.js';

async function createBid(bidObj: Partial<IBid>): Promise<Partial<IBid> | null> {
  return await bidModel.findOneAndUpdate(
    {
      collectible: bidObj.collectible,
      auction: bidObj.auction,
      state: bidObj.state,
      bidder: bidObj.bidder
    },
    bidObj,
    { upsert: true, new: true }
  );
}

async function getBidById(
  bidID: ObjectIDType<IBid>
): Promise<Partial<IBid> | null> {
  return await bidModel.findById(bidID);
}

async function getDepositBidDataByID(
  bidID: ObjectIDType<IBid>
): Promise<any | null> {
  return await bidModel
    .findById(bidID)
    .populate({
      path: 'auction',
      populate: { path: 'seller', select: { accountID: 1 } },
      select: { auctionNum: 1, price: 1, signature: 1 }
    })
    .populate({
      path: 'collectible',
      populate: { path: 'collectionID', select: { contractAddress: 1 } },
      select: { tokenID: 1 }
    });
}

async function getSignBidSignatureDataByID(
  bidID: ObjectIDType<IBid>
): Promise<any | null> {
  return await bidModel
    .findById(bidID)
    .populate({
      path: 'auction',
      populate: { path: 'seller', select: { accountID: 1 } },
      select: { auctionNum: 1, price: 1 }
    })
    .populate({
      path: 'collectible',
      populate: { path: 'collectionID', select: { contractAddress: 1 } },
      select: { tokenID: 1 }
    });
}

async function acceptManyBidsByCollectibleIDAndAuctionID(
  collectibleID: ObjectIDType<ICollectible>,
  auctionId: ObjectIDType<IListOnSale>
): Promise<{
  acknowledged: boolean;
  modifiedCount: number;
  upsertedCount: number;
  matchedCount: number;
}> {
  const res = await bidModel.updateMany(
    {
      collectible: collectibleID,
      auction: auctionId,
      state: bidStateEnum.approved
    },
    { $set: { state: bidStateEnum.accepted } }
  );
  return res;
}

async function getActiveBidsBycollectibleID(
  collectibleID: ObjectIDType<ICollectible>
): Promise<Partial<IBid>[]> {
  return await bidModel
    .find({
      collectible: collectibleID,
      state: bidStateEnum.approved
    })
    .populate({
      path: 'bidder',
      select: { name: 1, accountID: 1, 'medias.profilePic.hash': 1 }
    })
    .populate({
      path: 'auction',
      select: { seller: 1 },
      populate: {
        path: 'seller',
        select: { name: 1, accountID: 1, 'medias.profilePic.hash': 1 }
      }
    })
    .sort({ updatedAt: -1 })
    .limit(10);
}

async function getHighestActiveBidByCollectibleId(
  collectibleID: ObjectIDType<ICollectible>
): Promise<Partial<IBid>[]> {
  return await bidModel
    .find({
      collectible: collectibleID,
      state: bidStateEnum.approved
    })
    .sort({ price: -1 })
    .limit(1)
    .populate({
      path: 'bidder',
      select: { name: 1, 'medias.profilePic.hash': 1, accountID: 1 }
    })
    .populate({
      path: 'auction',
      select: { seller: 1, price: 1 },
      populate: {
        path: 'seller',
        select: { name: 1, 'medias.profilePic.hash': 1, accountID: 1 }
      }
    });
}

async function getHighestActiveBidsByCollectibleIdAndAuctionId(
  collectibleID: ObjectIDType<ICollectible>,
  auctionID: ObjectIDType<IListOnSale>
): Promise<Partial<IBid>[] | null> {
  return await bidModel
    .find({
      collectible: collectibleID,
      auction: auctionID,
      state: bidStateEnum.approved
    })
    .sort({ price: -1 });
}

async function getHighestActiveBids() {
  try {
    const res = await bidModel.aggregate([
      { $match: { state: bidStateEnum.approved } },
      {
        $group: {
          _id: '$auction',
          collectible: { $first: '$collectible' },
          highestBid: { $max: '$price' },
          bids: { $push: '$$ROOT' }
        }
      },
      {
        $project: {
          _id: 1,
          collectible: 1,
          highestBid: 1,
          bids: {
            $filter: {
              input: '$bids',
              as: 'bid',
              cond: { $eq: ['$$bid.price', '$highestBid'] }
            }
          }
        }
      },
      { $unwind: '$bids' },
      {
        $group: {
          _id: '$collectible',
          highestBid: { $first: '$highestBid' },
          bid: { $first: '$bids' },
          auction: { $first: '$bids.auction' }
        }
      },
      {
        $lookup: {
          from: 'listonsales',
          localField: 'auction',
          foreignField: '_id',
          as: 'auction'
        }
      },
      { $unwind: '$auction' },
      {
        $lookup: {
          from: 'collectibles',
          localField: '_id',
          foreignField: '_id',
          as: 'collectible'
        }
      },
      {
        $unwind: '$collectible'
      },
      {
        $lookup: {
          from: 'users',
          localField: 'collectible.creator',
          foreignField: '_id',
          as: 'creator'
        }
      },
      { $unwind: '$creator' },
      {
        $lookup: {
          from: 'listonsales',
          localField: 'collectible._id',
          foreignField: 'collectible',
          as: 'listOnSales'
        }
      },
      {
        $project: {
          collectible: { name: 1, imageHash: 1 },
          creator: {
            _id: 1,
            accountID: 1,
            name: 1,
            medias: { profilePic: { hash: 1 } }
          },
          highestBid: 1,
          auction: {
            price: 1,
            expireAt: 1
          },
          listOnSales: {
            $filter: {
              input: '$listOnSales',
              as: 'list',
              cond: {
                $or: [
                  { $eq: ['$$list.state', listOnSaleStateEnum.active] },
                  { $eq: ['$$list.state', listOnSaleStateEnum.initialized] }
                ]
              }
            }
          }
        }
      },
      { $unwind: '$listOnSales' },
      { $sort: { highestBid: -1 } },
      {
        $group: {
          _id: '$_id',
          inStock: { $sum: '$listOnSales.amount' },
          collectible: { $first: '$collectible' },
          creator: { $first: '$creator' },
          highestBid: { $first: '$highestBid' },
          auction: { $first: '$auction' }
        }
      }
    ]);
    return res;
  } catch (e) {
    return e;
  }
}

async function getCreatedBidByUserIDandCollectibleID(
  userID: ObjectIDType<IUser>,
  collectibleID: ObjectIDType<ICollectible>,
  auciotnID: ObjectIDType<IListOnSale>
): Promise<Partial<IBid> | null> {
  return await bidModel.findOne({
    bidder: userID,
    collectible: collectibleID,
    state: bidStateEnum.created,
    auction: auciotnID
  });
}

async function getApprovedBidByUserIDandCollectibleID(
  userID: ObjectIDType<IUser>,
  collectibleID: ObjectIDType<ICollectible>,
  auciotnID: ObjectIDType<IListOnSale>
): Promise<Partial<IBid> | null> {
  return await bidModel.findOne({
    bidder: userID,
    collectible: collectibleID,
    state: bidStateEnum.approved,
    auction: auciotnID
  });
}

async function setSignedBidSignature(
  bidID: ObjectIDType<IBid>,
  signature: string
): Promise<Partial<ICollectible> | null> {
  return await bidModel.findOneAndUpdate(
    { _id: bidID },
    { $set: { signature: signature } }
  );
}

async function approveBidByBidID(
  bidID: ObjectIDType<IBid>
): Promise<Partial<ICollectible> | null> {
  return await bidModel.findOneAndUpdate(
    { _id: bidID },
    { $set: { state: bidStateEnum.approved } }
  );
}

async function withdrawBidByUserIDandCollectibleID(
  userID: ObjectIDType<IUser>,
  collectibleID: ObjectIDType<ICollectible>,
  auctionID: ObjectIDType<IListOnSale>
): Promise<Partial<IBid> | null> {
  return await bidModel.findOneAndUpdate(
    {
      bidder: userID,
      collectible: collectibleID,
      auction: auctionID,
      state: bidStateEnum.approved
    },
    { $set: { state: bidStateEnum.failed } }
  );
}

const BidRepo = {
  createBid,
  getBidById,
  getDepositBidDataByID,
  getHighestActiveBids,
  getHighestActiveBidByCollectibleId,
  getActiveBidsBycollectibleID,
  getCreatedBidByUserIDandCollectibleID,
  getSignBidSignatureDataByID,
  setSignedBidSignature,
  approveBidByBidID,
  withdrawBidByUserIDandCollectibleID,
  acceptManyBidsByCollectibleIDAndAuctionID,
  getHighestActiveBidsByCollectibleIdAndAuctionId,
  getApprovedBidByUserIDandCollectibleID
};

export default BidRepo;
