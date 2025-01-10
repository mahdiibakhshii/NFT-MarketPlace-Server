import { ObjectIDType } from '../../helpers/aliases.js';
import { IUser } from '../../models/user.js';
import BidRepo from '../../repos/bidRepo.js';
import { listOnSaleStateEnum } from '../../models/listOnSale.js';
import { IBid } from '../../models/bid.js';

export async function getSignBidSignatureDataLogic(
  userID: ObjectIDType<IUser>,
  bidID: ObjectIDType<IBid>
): Promise<{
  statusCode: number;
  data:
    | {
        collectionAddress: string;
        tokenId: number;
        auctionNum: number;
        owner: string;
        floorPrice: number;
        bidAmount: number;
      }
    | undefined;
  err: string | undefined;
}> {
  //Fetch bid
  const bidObj = await BidRepo.getSignBidSignatureDataByID(bidID);
  if (!bidObj)
    return { statusCode: 404, data: undefined, err: 'bid not found' };
  if (bidObj!.auction!.state === listOnSaleStateEnum.finished)
    return {
      statusCode: 409,
      data: undefined,
      err: 'auction has been finished'
    };
  if (userID.toString() !== bidObj.bidder.toString())
    return {
      statusCode: 409,
      data: undefined,
      err: 'requested user is not bidder'
    };
  return {
    statusCode: 200,
    data: {
      collectionAddress: bidObj.collectible.collectionID.contractAddress,
      tokenId: bidObj.collectible.tokenID,
      auctionNum: bidObj.auction.auctionNum,
      owner: bidObj.auction.seller.accountID,
      floorPrice: bidObj.auction.floorPrice,
      bidAmount: bidObj.price
    },
    err: undefined
  };
}
