import { ObjectIDType } from '../../helpers/aliases.js';
import {
  listOnSaleStateEnum,
  IListOnSale,
  listOnSaleTypeEnum
} from '../../models/listOnSale.js';
import ListOnSaleRepo from '../../repos/listOnSaleRepo.js';
import { ICollectible } from '../../models/collectible.js';
import { IUser } from '../../models/user.js';

interface instantObjLogicInput {
  collectible: ObjectIDType<ICollectible>;
  seller: ObjectIDType<IUser>;
  signature: string;
  price: number;
  amount: number;
  fixedAmount: number;
}

export async function createInstantLogic(
  instantObj: instantObjLogicInput
): Promise<{
  statusCode: number;
  data: ObjectIDType<IListOnSale> | undefined;
  err: string | undefined;
}> {
  try {
    //DOC: Validation
    const x = await ListOnSaleRepo.getActiveInstantByCollectibleIDAndSeller(
      instantObj.collectible,
      instantObj.seller
    );
    if (x) {
      return {
        statusCode: 409,
        data: x,
        err: 'create instant sale failed! there is another active instant for this user and collectible'
      };
    }
    const instantResult = await ListOnSaleRepo.createListOnSale({
      state: listOnSaleStateEnum.active,
      type: listOnSaleTypeEnum.isInstant,
      ...instantObj
    });
    return { statusCode: 200, data: instantResult._id, err: undefined };
  } catch (e) {
    console.log('error in creating instant', e);
    return {
      statusCode: 500,
      data: undefined,
      err: 'create instant sale failed!'
    };
  }
}
