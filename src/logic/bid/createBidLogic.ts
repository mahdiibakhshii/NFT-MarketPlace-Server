import { ObjectIDType } from '../../helpers/aliases.js';
import { IUser, IUserProps } from '../../models/user.js';
import { listOnSaleStateEnum } from '../../models/listOnSale.js';
import { ICollectible } from '../../models/collectible.js';
import { bidStateEnum, IBid } from '../../models/bid.js';
import BidRepo from '../../repos/bidRepo.js';
import ListOnSaleRepo from '../../repos/listOnSaleRepo.js';
import UserRepo from '../../repos/user/userRepo.js';

interface bidObjLogicInput {
  collectible: ObjectIDType<ICollectible>;
  seller: string;
  price: number;
}

export async function createBidLogic(
  userID: ObjectIDType<IUser>,
  bidObj: bidObjLogicInput
): Promise<{
  statusCode: number;
  data: ObjectIDType<IBid> | undefined;
  err: string | undefined;
}> {
  try {
    //TODO: check if collectible exists.
    //DOC: check if collectible has put on sale sell order.
    //TODO: this logic should be changed. because we have multiple sell orders on the collectible not one order to check.
    //DOC: check if there is no higher bid on the auction
    //DOC: check auction and active if it is in initialized state.
    const sellerObj = await UserRepo.findByAccountID(
      bidObj.seller,
      IUserProps.idOnly
    );
    if (!sellerObj)
      return {
        statusCode: 404,
        data: undefined,
        err: 'seller not found'
      };
    const auctionObj =
      await ListOnSaleRepo.getActiveAuctionByCollectibleIDAndSeller(
        bidObj.collectible,
        sellerObj._id!
      );
    if (auctionObj === null)
      return {
        statusCode: 404,
        data: undefined,
        err: 'create bid failed. cant find Auction to bid!'
      };
    if (auctionObj.state === listOnSaleStateEnum.finished)
      return {
        statusCode: 409,
        data: undefined,
        err: 'auction has been finished!'
      };
    if (bidObj.price < auctionObj.price!)
      return {
        statusCode: 409,
        data: undefined,
        err: 'request price is lower that floor price!'
      };
    //DOC: get highest active bid to check if new bid is higher than the last approved bid
    const approvedBids =
      await BidRepo.getHighestActiveBidsByCollectibleIdAndAuctionId(
        bidObj.collectible,
        auctionObj._id!
      );
    if (
      approvedBids &&
      approvedBids.length === auctionObj.amount &&
      approvedBids[approvedBids.length - 1].price! >= bidObj.price
    )
      return {
        statusCode: 409,
        data: undefined,
        err: 'request price is lower than the last approved price in the leaderboard!'
      };
    const bidResult = await BidRepo.createBid({
      bidder: userID,
      auction: auctionObj._id!,
      state: bidStateEnum.created,
      ...bidObj
    });
    if (bidResult) return { statusCode: 200, data: bidResult, err: undefined };
    else
      return { statusCode: 500, data: undefined, err: 'error in creating bid' };
  } catch (e) {
    console.log(e);
    return {
      statusCode: 500,
      data: undefined,
      err: 'create bid failed!'
    };
  }
}
