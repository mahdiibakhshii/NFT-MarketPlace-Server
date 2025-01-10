import { ICollection } from '@models/collection.js';
import { ObjectIDType } from '../helpers/aliases.js';
import { ICollectible } from '../models/collectible.js';
import { ISellReceipt, SellReceiptModel } from '../models/sellReceipt.js';

async function createSellReceipt(
  sellReceiptObj: Partial<ISellReceipt>
): Promise<Partial<ISellReceipt> | null> {
  return await SellReceiptModel.create(sellReceiptObj);
}

async function getSellReceiptByCollectibleId(
  collectibleID: ObjectIDType<ICollectible>
): Promise<Partial<ISellReceipt>[] | null> {
  return await SellReceiptModel.find({ collectible: collectibleID });
}

async function getMostSoldCollections(): Promise<
  | {
      totalSale: number;
      collectionID: ObjectIDType<ICollection>;
      collectibles: [ICollectible];
    }[]
  | null
> {
  try {
    return await SellReceiptModel.aggregate([
      {
        $lookup: {
          from: 'collectibles',
          localField: 'collectibleID',
          foreignField: '_id',
          as: 'collectible'
        }
      },
      { $unwind: '$collectible' },
      {
        $group: {
          _id: '$collectible.collectionID',
          totlaSale: { $sum: '$sellPrice' }
        }
      },
      { $addFields: { collectionID: '$_id' } },
      {
        $lookup: {
          from: 'collectibles',
          localField: 'collectionID',
          foreignField: 'collectionID',
          as: 'collectibles'
        }
      },
      {
        $lookup: {
          from: 'collections',
          localField: 'collectionID',
          foreignField: '_id',
          as: 'collection'
        }
      },
      { $unwind: '$collection' },
      {
        $lookup: {
          from: 'users',
          localField: 'collection.creator',
          foreignField: '_id',
          as: 'collection.creator'
        }
      },
      { $unwind: '$collection.creator' },
      {
        $project: {
          _id: 0,
          collectionID: 0
        }
      },
      {
        $project: {
          collection: {
            _id: 1,
            title: 1,
            creator: {
              _id: 1,
              name: 1,
              accountID: 1,
              medias: { profilePic: { hash: 1 } }
            }
          },
          collectibles: 1,
          totlaSale: 1
        }
      },
      { $sort: { totalSale: -1 } },
      { $limit: 4 }
    ]);
  } catch (e) {
    return null;
  }
}

const SellReceiptRepo = {
  createSellReceipt,
  getSellReceiptByCollectibleId,
  getMostSoldCollections
};
export default SellReceiptRepo;
