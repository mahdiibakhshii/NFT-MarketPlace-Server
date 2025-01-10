import moment from 'moment';
import mongoose from 'mongoose';
import { ICollectible } from '../models/collectible.js';
import { IUser } from '../models/user.js';
import { bidStateEnum, IBid } from '../models/bid.js';
import { ObjectIDType } from '../helpers/aliases.js';
import {
  listOnSaleModel,
  listOnSaleStateEnum,
  IListOnSale,
  listOnSaleTypeEnum
} from '../models/listOnSale.js';

export interface INewestListOnSales extends IListOnSale {
  highestBid?: Partial<IBid> | null;
}

async function createListOnSale(
  listOnSaleObj: Partial<IListOnSale>
): Promise<Partial<IListOnSale>> {
  return await listOnSaleModel.create(listOnSaleObj);
}

async function getListOnSaleByID(
  listOnSaleID: ObjectIDType<IListOnSale>
): Promise<Partial<IListOnSale | null>> {
  return await listOnSaleModel.findById(listOnSaleID);
}

async function getAuctionsCountByCollectibleID(
  collectibleID: ObjectIDType<ICollectible>
) {
  return listOnSaleModel
    .find({ collectible: collectibleID, type: listOnSaleTypeEnum.isAuction })
    .count();
}

async function checkActiveListOnSaleByCollectibleIDAndSeller(
  collectibleID: ObjectIDType<ICollectible>,
  seller: ObjectIDType<IUser>
): Promise<Partial<IListOnSale> | null> {
  return listOnSaleModel.exists({
    collectible: collectibleID,
    seller: seller,
    state: {
      $in: [listOnSaleStateEnum.initialized, listOnSaleStateEnum.active]
    }
  });
}

async function getActiveListOnSaleByCollectibleIDAndSeller(
  collectibleID: ObjectIDType<ICollectible>,
  seller: ObjectIDType<IUser>
): Promise<Partial<IListOnSale> | null> {
  return listOnSaleModel.findOne({
    collectible: collectibleID,
    seller: seller,
    state: {
      $in: [listOnSaleStateEnum.initialized, listOnSaleStateEnum.active]
    }
  });
}

async function getActiveAuctionByCollectibleIDAndSeller(
  collectibleID: ObjectIDType<ICollectible>,
  seller: ObjectIDType<IUser>
): Promise<Partial<IListOnSale> | null> {
  return listOnSaleModel.findOne({
    collectible: collectibleID,
    seller: seller,
    type: listOnSaleTypeEnum.isAuction,
    state: {
      $in: [listOnSaleStateEnum.initialized, listOnSaleStateEnum.active]
    }
  });
}

async function getInitializedAuctionByCollectibleIDAndSeller(
  collectibleID: ObjectIDType<ICollectible>,
  seller: ObjectIDType<IUser>
): Promise<Partial<IListOnSale> | null> {
  return listOnSaleModel.findOne({
    collectible: collectibleID,
    seller: seller,
    type: listOnSaleTypeEnum.isAuction,
    state: listOnSaleStateEnum.initialized
  });
}

async function getActiveInstantByCollectibleIDAndSeller(
  collectibleID: ObjectIDType<ICollectible>,
  seller: ObjectIDType<IUser>
): Promise<Partial<IListOnSale> | null> {
  return listOnSaleModel.findOne({
    collectible: collectibleID,
    seller: seller,
    type: listOnSaleTypeEnum.isInstant,
    state: listOnSaleStateEnum.active
  });
}

async function getActiveInstantsByCollectibleID(
  collectibleID: ObjectIDType<ICollectible>
): Promise<Partial<IListOnSale>[] | null> {
  return listOnSaleModel
    .find({
      collectible: collectibleID,
      type: listOnSaleTypeEnum.isInstant,
      state: listOnSaleStateEnum.active
    })
    .populate({
      path: 'seller',
      select: { name: 1, 'medias.profilePic.hash': 1, accountID: 1 }
    })
    .sort({ price: 1 })
    .select({
      collectible: 1,
      state: 1,
      seller: 1,
      type: 1,
      price: 1,
      amount: 1
    });
}

async function getActiveAuctionsByCollectibleID(
  collectibleID: ObjectIDType<ICollectible>
): Promise<Partial<IListOnSale>[] | null> {
  return listOnSaleModel
    .find({
      collectible: collectibleID,
      type: listOnSaleTypeEnum.isAuction,
      state: {
        $in: [listOnSaleStateEnum.initialized, listOnSaleStateEnum.active]
      }
    })
    .populate({
      path: 'seller',
      select: { name: 1, 'medias.profilePic.hash': 1, accountID: 1 }
    })
    .sort({ price: 1 })
    .select({
      collectible: 1,
      state: 1,
      seller: 1,
      type: 1,
      price: 1,
      amount: 1,
      expireAt: 1
    });
}

async function getActiveAuctionByCollectibleID(
  collectibleID: ObjectIDType<ICollectible>
): Promise<Partial<IListOnSale> | null> {
  return listOnSaleModel.findOne({
    collectible: collectibleID,
    type: listOnSaleTypeEnum.isAuction,
    state: {
      $in: [listOnSaleStateEnum.initialized, listOnSaleStateEnum.active]
    }
  });
}

async function updateActiveInstanAmountByCollectibleIDAndSeller(
  collectibleID: ObjectIDType<ICollectible>,
  seller: ObjectIDType<IUser>,
  count: number
): Promise<Partial<IListOnSale> | null> {
  const list = await getActiveInstantByCollectibleIDAndSeller(
    collectibleID,
    seller
  );
  const updated = await listOnSaleModel.findOneAndUpdate(
    {
      collectible: collectibleID,
      seller: seller,
      type: listOnSaleTypeEnum.isInstant,
      state: listOnSaleStateEnum.active
    },
    { $inc: { amount: count } }
  );

  if (list && list.amount! + count === 0)
    await finishListOnSaleState(list._id!);
  return updated;
}

async function activeAuctionState(
  listOnSaleID: ObjectIDType<IListOnSale>
): Promise<Partial<IListOnSale> | null> {
  return await listOnSaleModel.findByIdAndUpdate(listOnSaleID, {
    state: listOnSaleStateEnum.active,
    expireAt: moment().add(7, 'day').toDate()
  });
}

async function finishListOnSaleState(
  listOnSaleID: ObjectIDType<IListOnSale>
): Promise<any> {
  const res = await listOnSaleModel.updateOne(
    { _id: listOnSaleID },
    {
      $set: { state: listOnSaleStateEnum.finished }
    }
  );
  return;
}

async function getCollectibleListingTotalAmount(
  collectibleID: ObjectIDType<ICollectible>
): Promise<any> {
  return await listOnSaleModel
    .aggregate([
      {
        $match: {
          collectible: new mongoose.Types.ObjectId(collectibleID.toString()),
          state: {
            $in: [listOnSaleStateEnum.initialized, listOnSaleStateEnum.active]
          }
        }
      },
      {
        $group: {
          _id: new mongoose.Types.ObjectId(collectibleID.toString()),
          count: { $sum: '$amount' }
        }
      }
    ])
    .then(function (queryResult) {
      if (queryResult[0]) return queryResult[0].count;
      return 0;
    });
}

async function getCollectibleListingTotalAmountByCollectibleIDAndSellerID(
  collectibleID: ObjectIDType<ICollectible>,
  sellerID: ObjectIDType<IUser>
): Promise<any> {
  return await listOnSaleModel
    .aggregate([
      {
        $match: {
          collectible: new mongoose.Types.ObjectId(collectibleID.toString()),
          seller: sellerID,
          state: {
            $in: [listOnSaleStateEnum.initialized, listOnSaleStateEnum.active]
          }
        }
      },
      {
        $group: {
          _id: new mongoose.Types.ObjectId(collectibleID.toString()),
          count: { $sum: '$amount' }
        }
      }
    ])
    .then(function (queryResult) {
      if (queryResult[0]) return queryResult[0].count;
      return 0;
    });
}

async function getNewestListOnSales(
  page: number,
  countPerPage: number
): Promise<INewestListOnSales[]> {
  page = page || 1;
  countPerPage = countPerPage || 8;
  return await listOnSaleModel.aggregate([
    {
      $match: {
        state: {
          $in: [listOnSaleStateEnum.initialized, listOnSaleStateEnum.active]
        }
      }
    },
    { $sort: { createdAt: -1 } },
    { $skip: (page - 1) * countPerPage },
    { $limit: countPerPage },
    {
      $lookup: {
        from: 'bids',
        as: 'highestBid',
        let: { auction: '$_id' },
        pipeline: [
          {
            $match: {
              $and: [
                {
                  $expr: {
                    $eq: ['$$auction', '$auction']
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
    {
      $group: {
        _id: '$_id',
        collectible: { $first: '$collectible' },
        state: { $first: '$state' },
        seller: { $first: '$seller' },
        type: { $first: '$type' },
        price: { $first: '$price' },
        amount: { $first: '$amount' },
        updatedAt: { $first: '$updatedAt' },
        highestBid: { $max: '$highestBid.price' }
      }
    },
    {
      $group: {
        _id: '$collectible',
        price: { $min: '$price' },
        listOnSaleType: { $avg: '$type' },
        availableAmount: { $sum: '$amount' },
        highestBid: { $max: '$highestBid' }
      }
    },
    {
      $lookup: {
        from: 'collectibles',
        localField: '_id',
        foreignField: '_id',
        as: 'collectible'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'collectible.creator',
        foreignField: '_id',
        as: 'creator'
      }
    },
    { $unwind: { path: '$collectible', preserveNullAndEmptyArrays: true } },
    { $unwind: { path: '$creator', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        price: 1,
        listOnSaleType: 1,
        availableAmount: 1,
        collectible: { name: 1, imageHash: 1, volume: 1 },
        highestBid: 1,
        creator: { accountID: 1, name: 1, medias: { profilePic: { hash: 1 } } }
      }
    }
  ]);
}

async function getActiveListsForDashboardBySellerID(
  page: number,
  countPerPage: number,
  sellerID: ObjectIDType<IUser>
): Promise<INewestListOnSales[]> {
  page = page || 1;
  countPerPage = countPerPage || 8;
  return await listOnSaleModel.aggregate([
    {
      $match: {
        seller: sellerID,
        state: {
          $in: [listOnSaleStateEnum.initialized, listOnSaleStateEnum.active]
        }
      }
    },
    { $sort: { createdAt: -1 } },
    { $skip: (page - 1) * countPerPage },
    { $limit: countPerPage },
    {
      $lookup: {
        from: 'bids',
        as: 'highestBid',
        let: { collectibleID: '$collectible' },
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
    {
      $group: {
        _id: '$_id',
        price: { $first: '$price' },
        type: { $first: '$type' },
        amount: { $first: '$amount' },
        highestBid: { $max: '$highestBid.price' },
        collectible: { $first: '$collectible' },
        updatedAt: { $max: '$updatedAt' }
      }
    },
    {
      $lookup: {
        from: 'collectibles',
        localField: 'collectible',
        foreignField: '_id',
        as: 'collectible'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'collectible.creator',
        foreignField: '_id',
        as: 'creator'
      }
    },
    { $unwind: { path: '$collectible', preserveNullAndEmptyArrays: true } },
    { $unwind: { path: '$creator', preserveNullAndEmptyArrays: true } },
    { $sort: { updatedAt: -1 } },
    {
      $project: {
        price: 1,
        type: 1,
        amount: 1,
        highestBid: 1,
        collectible: { _id: 1, name: 1, imageHash: 1 },
        creator: { accountID: 1, name: 1, medias: { profilePic: { hash: 1 } } }
      }
    }
  ]);
}

async function getActiveInstantPurchaseDataByCollectibleIDAndSeller(
  collectibleID: ObjectIDType<ICollectible>,
  seller: ObjectIDType<IUser>
): Promise<Partial<IListOnSale> | null> {
  return listOnSaleModel
    .findOne({
      collectible: collectibleID,
      seller: seller,
      type: listOnSaleTypeEnum.isInstant,
      state: listOnSaleStateEnum.active
    })
    .populate({
      path: 'collectible',
      populate: { path: 'collectionID', select: { contractAddress: 1 } },
      select: { tokenID: 1 }
    })
    .populate({ path: 'seller', select: { accountID: 1 } })
    .select({
      signature: 1,
      price: 1,
      amount: 1,
      fixedAmount: 1
    });
}

async function getFinishingAuctions(): Promise<Partial<any>[] | null> {
  return await listOnSaleModel
    .find({
      type: listOnSaleTypeEnum.isAuction,
      state: listOnSaleStateEnum.active,
      expireAt: {
        $lt: moment().toDate()
      }
    })
    .populate({
      path: 'collectible',
      select: { collectionID: 1, tokenID: 1 },
      populate: { path: 'collectionID', select: { contractAddress: 1 } }
    });
}

const ListOnSaleRepo = {
  createListOnSale,
  getListOnSaleByID,
  activeAuctionState,
  finishListOnSaleState,
  getAuctionsCountByCollectibleID,
  getActiveAuctionByCollectibleIDAndSeller,
  getActiveInstantByCollectibleIDAndSeller,
  getActiveAuctionByCollectibleID,
  getActiveInstantsByCollectibleID,
  getActiveAuctionsByCollectibleID,
  checkActiveListOnSaleByCollectibleIDAndSeller,
  getCollectibleListingTotalAmount,
  getNewestListOnSales,
  getActiveInstantPurchaseDataByCollectibleIDAndSeller,
  getActiveListsForDashboardBySellerID,
  updateActiveInstanAmountByCollectibleIDAndSeller,
  getInitializedAuctionByCollectibleIDAndSeller,
  getFinishingAuctions,
  getCollectibleListingTotalAmountByCollectibleIDAndSellerID,
  getActiveListOnSaleByCollectibleIDAndSeller
};

export default ListOnSaleRepo;
