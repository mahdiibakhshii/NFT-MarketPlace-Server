import { createAuctionLogic } from '../listOnSale/createAuctionLogic.js';
import { ObjectIDType } from '../../helpers/aliases.js';
import { collectibleState, ICollectible } from '../../models/collectible.js';
import { IUser, IUserProps } from '../../models/user.js';
import CollectibleRepo from '../../repos/collectibleRepo.js';
import UserRepo from '../../repos/user/userRepo.js';
import ListOnSaleRepo from '../../repos/listOnSaleRepo.js';
import { listOnSaleTypeEnum } from '../../models/listOnSale.js';
import { createInstantLogic } from '../../logic/listOnSale/createInstantLogic.js';

interface ISetSignedSellOrderInput {
  collectibleID: ObjectIDType<ICollectible>;
  signerAddress: string;
  signature: string;
  price: number;
  amount: number;
  sellMethod: number;
}
export async function setSignSellOrderLogic(
  userID: ObjectIDType<IUser>,
  dataToStore: ISetSignedSellOrderInput
): Promise<{
  statusCode: number;
  data?: { status: string };
  err?: string;
}> {
  const collectibleObj = await CollectibleRepo.getByCollectibleID(
    dataToStore.collectibleID
  );
  const userInfo = await UserRepo.findByID(userID, IUserProps.self);
  //DOC: validate request
  if (collectibleObj === null)
    return {
      statusCode: 404,
      data: undefined,
      err: 'collectible dosent exist!'
    };
  if (collectibleObj.state === collectibleState.stored)
    return {
      statusCode: 409,
      data: undefined,
      err: 'collectible is not minted!'
    };
  if (
    userInfo?.accountID?.toLowerCase() !==
    dataToStore.signerAddress.toLowerCase()
  )
    return {
      statusCode: 409,
      data: undefined,
      err: 'Message Signer is not request sender!'
    };
  if (
    await ListOnSaleRepo.checkActiveListOnSaleByCollectibleIDAndSeller(
      dataToStore.collectibleID,
      userID
    )
  )
    return {
      statusCode: 409,
      data: undefined,
      err: 'this user already has unfinished listing on this collectible!'
    };

  //DOC: check signer is owner of the collectible
  const isOwner = await CollectibleRepo.checkCollectibleOwnershipByUserID(
    dataToStore.collectibleID,
    userID
  );
  if (!isOwner)
    return {
      statusCode: 409,
      data: undefined,
      err: 'You dont have permission to sign this collectible!'
    };
  //DOC: check requested amount be <= owner's amount
  const ownerCount = await CollectibleRepo.getOwnerCountByCollectibleID(
    dataToStore.collectibleID,
    userID
  );
  if (ownerCount && dataToStore.amount > ownerCount)
    return {
      statusCode: 409,
      data: undefined,
      err: 'requested amount is higher than ownership amout!'
    };
  //DOC: create auction for collectible
  let createdListOnSale;
  if (dataToStore.sellMethod == listOnSaleTypeEnum.isAuction) {
    createdListOnSale = await createAuctionLogic({
      collectible: dataToStore.collectibleID,
      seller: userID,
      signature: dataToStore.signature,
      price: dataToStore.price,
      amount: dataToStore.amount,
      fixedAmount: dataToStore.amount
    });
  } else if (dataToStore.sellMethod == listOnSaleTypeEnum.isInstant) {
    try {
      createdListOnSale = await createInstantLogic({
        collectible: dataToStore.collectibleID,
        seller: userID,
        signature: dataToStore.signature,
        price: dataToStore.price,
        amount: dataToStore.amount,
        fixedAmount: dataToStore.amount
      });
    } catch (e) {
      return {
        statusCode: 409,
        data: undefined,
        err: 'error in creating instant listOnSale!'
      };
    }
  } else {
    return {
      statusCode: 409,
      data: undefined,
      err: 'sellMethod type is not supported!'
    };
  }
  if (createdListOnSale?.statusCode == 200) {
    return { statusCode: 200, data: { status: 'success' }, err: undefined };
  } else if (createdListOnSale?.statusCode == 409) {
    return { statusCode: 409, data: undefined, err: createdListOnSale.err };
  } else {
    return { statusCode: 500, data: undefined, err: createdListOnSale?.err };
  }
}
