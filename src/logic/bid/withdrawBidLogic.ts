import moment from 'moment';
import { ObjectIDType } from '../../helpers/aliases.js';
import { IUserProps } from '../../models/user.js';
import { IBid } from '../../models/bid.js';
import BidRepo from '../../repos/bidRepo.js';
import ListOnSaleRepo from '../../repos/listOnSaleRepo.js';
import UserRepo from '../../repos/user/userRepo.js';
import CollectionRepo from '../../repos/collectionRepo.js';
import CollectibleRepo from '../../repos/collectibleRepo.js';
import NotificationRepo from '../../repos/notificationRepo.js';
import { notificationTypeEnum } from '../../models/notification.js';

interface bidObjLogicInput {
  collectionAddress: string;
  tokenID: number;
  auctionNum: number;
  bidder: string;
  amount: number;
  seller: string;
}
export async function withdrawBidLogic(bidObj: bidObjLogicInput): Promise<{
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
      return { statusCode: 404, data: undefined, err: 'bidder not found!' };
    }
    const sellerObj = await UserRepo.findByAccountID(
      bidObj.seller,
      IUserProps.idOnly
    );
    if (!sellerObj) {
      //TODO: add exception log
      return { statusCode: 404, data: undefined, err: 'seller not found!' };
    }
    //DOC: verify request
    const collectionAddress = await CollectionRepo.getByContractAddress(
      bidObj.collectionAddress
    );
    if (!collectionAddress) {
      //TODO: add exception log
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
      return {
        statusCode: 404,
        data: undefined,
        err: 'auctionObj not found!'
      };
    }
    const approvedBid = await BidRepo.getApprovedBidByUserIDandCollectibleID(
      bidderObj._id!,
      collectibleObj._id!,
      auctionObj._id!
    );
    if (approvedBid == null) {
      return {
        statusCode: 404,
        data: undefined,
        err: 'created bid not found!'
      };
    }
    const resultBid = await BidRepo.withdrawBidByUserIDandCollectibleID(
      bidderObj._id!,
      collectibleObj._id!,
      auctionObj._id!
    );
    if (resultBid == null) {
      return {
        statusCode: 404,
        data: undefined,
        err: 'withdraw bid failed!'
      };
    }
    await NotificationRepo.createNotification({
      collectible: collectibleObj._id,
      user: bidderObj._id!,
      secondUser: sellerObj._id!,
      amount: bidObj.amount,
      type: notificationTypeEnum.bidWithdraw,
      issueDate: moment().toDate()
    });
    return { statusCode: 200, data: resultBid._id!, err: undefined };
  } catch (e) {
    console.log(e);
    return {
      statusCode: 500,
      data: undefined,
      err: 'create bid failed!'
    };
  }
}
