import { ObjectIDType } from '../../helpers/aliases.js';
import { IBid } from '../../models/bid.js';
import { ICollectible } from '../../models/collectible.js';
import { IUser } from '../../models/user.js';
import BidRepo from '../../repos/bidRepo.js';
import { IListOnSale } from '@models/listOnSale.js';

interface ICheckIfBidIsCreatedResponse {
  statusCode: number;
  isCreated: boolean;
  bid: Partial<IBid> | undefined;
  err: string | undefined;
}
export async function checkIfBidIsCreated(
  userID: ObjectIDType<IUser>,
  collectibleID: ObjectIDType<ICollectible>,
  auctionID: ObjectIDType<IListOnSale>
): Promise<ICheckIfBidIsCreatedResponse> {
  try {
    const foundedBid = await BidRepo.getCreatedBidByUserIDandCollectibleID(
      userID,
      collectibleID,
      auctionID
    );
    if (!foundedBid)
      return {
        statusCode: 200,
        isCreated: false,
        bid: undefined,
        err: undefined
      };
    return {
      statusCode: 200,
      isCreated: true,
      bid: foundedBid,
      err: undefined
    };
  } catch (err) {
    return {
      statusCode: 500,
      isCreated: false,
      bid: undefined,
      err: 'internal server error'
    };
  }
}
