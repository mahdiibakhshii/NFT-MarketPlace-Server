import { ObjectIDType } from '../../helpers/aliases.js';
import { bidStateEnum, IBid } from '../../models/bid.js';
import BidRepo from '../../repos/bidRepo.js';
import { listOnSaleStateEnum } from '../../models/listOnSale.js';

export async function getDepositBidDataLogic(
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
        signature: string;
      }
    | undefined;
  err: string | undefined;
}> {
  //Fetch bid
  const bidObj = await BidRepo.getDepositBidDataByID(bidID);
  if (!bidObj)
    return { statusCode: 404, data: undefined, err: 'bid not found' };
  if (bidObj.state !== bidStateEnum.created)
    return {
      statusCode: 409,
      data: undefined,
      err: 'bid has been deposited already'
    };
  if (bidObj!.auction!.state === listOnSaleStateEnum.finished)
    return {
      statusCode: 409,
      data: undefined,
      err: 'auction has been finished'
    };

  return {
    statusCode: 200,
    data: {
      collectionAddress: bidObj.collectible.collectionID.contractAddress,
      tokenId: bidObj.collectible.tokenID,
      auctionNum: bidObj.auction.auctionNum,
      owner: bidObj.auction.seller.accountID,
      floorPrice: bidObj.auction.price,
      bidAmount: bidObj.price,
      signature: bidObj.auction.signature
    },
    err: undefined
  };
}
