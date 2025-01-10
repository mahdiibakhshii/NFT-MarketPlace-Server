import { ObjectIDType } from '../../helpers/aliases.js';
import { IUser, IUserProps } from '../../models/user.js';
import BidRepo from '../../repos/bidRepo.js';
import { listOnSaleStateEnum } from '../../models/listOnSale.js';
import { IBid } from '../../models/bid.js';
import UserRepo from '../../repos/user/userRepo.js';

export async function setSignedBidSignatureLogic(
  userID: ObjectIDType<IUser>,
  bidID: ObjectIDType<IBid>,
  signerAddress: string,
  signature: string
): Promise<{
  statusCode: number;
  data?: { status: string };
  err?: string;
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
  const signer = await UserRepo.findByAccountID(
    signerAddress,
    IUserProps.idOnly
  );
  if (!signer)
    return {
      statusCode: 404,
      data: undefined,
      err: 'cant find signer'
    };
  if (signer._id!.toString() !== bidObj.bidder.toString())
    return {
      statusCode: 409,
      data: undefined,
      err: 'signer is not bidder'
    };
  await BidRepo.setSignedBidSignature(bidID, signature);
  return {
    statusCode: 200,
    data: {
      status: 'success'
    },
    err: undefined
  };
}
