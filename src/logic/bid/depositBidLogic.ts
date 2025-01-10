import moment from 'moment';
import { ObjectIDType } from '../../helpers/aliases.js';
import { IUserProps } from '../../models/user.js';
import { IBid } from '../../models/bid.js';
import BidRepo from '../../repos/bidRepo.js';
import ListOnSaleRepo from '../../repos/listOnSaleRepo.js';
import UserRepo from '../../repos/user/userRepo.js';
import CollectionRepo from '../../repos/collectionRepo.js';
import CollectibleRepo from '../../repos/collectibleRepo.js';
import ActivityRepo from '../../repos/activityRepo.js';
import { activityTypeEnum } from '../../models/activity.js';

interface bidObjLogicInput {
  collectionAddress: string;
  tokenID: number;
  auctionNum: number;
  bidder: string;
  seller: string;
  bidAmount: number;
}
export async function depositBidLogic(bidObj: bidObjLogicInput): Promise<{
  statusCode: number;
  data: ObjectIDType<IBid> | undefined;
  err: string | undefined;
}> {
  try {
    //DOC: Fetch auctioneer obj
    const bidderObj = await UserRepo.findByAccountID(
      bidObj.bidder,
      IUserProps.idOnly
    );
    if (!bidderObj) {
      //TODO: add exception log
      console.log('bidder not found!');
      return { statusCode: 404, data: undefined, err: 'bidder not found!' };
    }
    const sellerObj = await UserRepo.findByAccountID(
      bidObj.seller,
      IUserProps.idOnly
    );
    if (!sellerObj) {
      //TODO: add exception log
      console.log('seller not found!');
      return { statusCode: 404, data: undefined, err: 'seller not found!' };
    }
    //DOC: verify request
    const collectionAddress = await CollectionRepo.getByContractAddress(
      bidObj.collectionAddress
    );
    if (!collectionAddress) {
      //TODO: add exception log
      console.log('collection not found!');
      return {
        statusCode: 404,
        data: undefined,
        err: 'collection not found!'
      };
    }
    const collectibleObj = await CollectibleRepo.getByCollectionIDandTokenID(
      collectionAddress._id!,
      bidObj.tokenID
    );
    if (collectibleObj == null) {
      console.log('collectible not found!');
      return {
        statusCode: 404,
        data: undefined,
        err: 'collectible not found!'
      };
    }
    const auctionObj =
      await ListOnSaleRepo.getActiveAuctionByCollectibleIDAndSeller(
        collectibleObj._id!,
        sellerObj._id!
      );
    if (auctionObj == null) {
      console.log('auctionObj not found!');
      return {
        statusCode: 404,
        data: undefined,
        err: 'auctionObj not found!'
      };
    }
    const createdBid = await BidRepo.getCreatedBidByUserIDandCollectibleID(
      bidderObj._id!,
      collectibleObj._id!,
      auctionObj._id!
    );
    if (createdBid == null) {
      console.log('created bid not found!');
      return {
        statusCode: 404,
        data: undefined,
        err: 'created bid not found!'
      };
    }
    const depositedBid = await BidRepo.approveBidByBidID(createdBid._id!);
    if (depositedBid == null) {
      console.log('deposited bid not found!');
      return {
        statusCode: 404,
        data: undefined,
        err: 'deposited bid not found!'
      };
    }
    //DOC: create bidPlaced activity for bidder
    await ActivityRepo.createActivity({
      collectible: collectibleObj._id,
      user: bidderObj._id!,
      price: createdBid.price,
      type: activityTypeEnum.bidPlaced,
      issueDate: moment().toDate()
    });
    return { statusCode: 200, data: depositedBid._id!, err: undefined };
  } catch (e) {
    console.log(e);
    return {
      statusCode: 500,
      data: undefined,
      err: 'create bid failed!'
    };
  }
}
