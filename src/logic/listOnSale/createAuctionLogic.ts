import { ObjectIDType } from '../../helpers/aliases.js';
import {
  listOnSaleStateEnum,
  IListOnSale,
  listOnSaleTypeEnum
} from '../../models/listOnSale.js';
import ListOnSaleRepo from '../../repos/listOnSaleRepo.js';
import { ICollectible } from '../../models/collectible.js';
import { IUser } from '../../models/user.js';

interface auctionObjLogicInput {
  collectible: ObjectIDType<ICollectible>;
  seller: ObjectIDType<IUser>;
  signature: string;
  price: number;
  amount: number;
  fixedAmount: number;
}

export async function createAuctionLogic(
  auctionObj: auctionObjLogicInput
): Promise<{
  statusCode: number;
  data: ObjectIDType<IListOnSale> | undefined;
  err: string | undefined;
}> {
  try {
    //DOC: Validation
    const x = await ListOnSaleRepo.getActiveAuctionByCollectibleIDAndSeller(
      auctionObj.collectible,
      auctionObj.seller
    );
    if (x) {
      return {
        statusCode: 409,
        data: x,
        err: 'create auction failed! there is another initialized auction for this user and collectible'
      };
    }
    //DOC: Aution is deactive by default. it would be activated when the first bid submited on it
    const newAuctionNum =
      (await ListOnSaleRepo.getAuctionsCountByCollectibleID(
        auctionObj.collectible
      )) + 1;
    const auctionResult = await ListOnSaleRepo.createListOnSale({
      state: listOnSaleStateEnum.initialized,
      auctionNum: newAuctionNum,
      type: listOnSaleTypeEnum.isAuction,
      ...auctionObj
    });
    return { statusCode: 200, data: auctionResult._id, err: undefined };
  } catch (e) {
    console.log('error in creating auction', e);
    return {
      statusCode: 500,
      data: undefined,
      err: 'create auction failed!'
    };
  }
}
