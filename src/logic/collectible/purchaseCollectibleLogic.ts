import ListOnSaleRepo from '../../repos/listOnSaleRepo.js';
import UserRepo from '../../repos/user/userRepo.js';
import { ObjectIDType } from '../../helpers/aliases.js';
import { ICollectible } from '../../models/collectible.js';
import { IUserProps } from '../../models/user.js';
import { IListOnSale } from '@models/listOnSale.js';
export async function purchaseCollectibleLogic(
  colletibleID: ObjectIDType<ICollectible>,
  sellerAccountID: string
): Promise<{
  statusCode: number;
  data: Partial<IListOnSale> | undefined;
  err: string | undefined;
}> {
  //DOC: fetch seller data to get userID
  const sellerObj = await UserRepo.findByAccountID(
    sellerAccountID,
    IUserProps.idOnly
  );
  if (!sellerObj)
    return {
      statusCode: 404,
      data: undefined,
      err: 'seller not found!'
    };
  //DOC: check if there is any listOneSale from seller on the collectible
  const listOnSaleObj =
    await ListOnSaleRepo.getActiveInstantPurchaseDataByCollectibleIDAndSeller(
      colletibleID,
      sellerObj._id!
    );
  if (!listOnSaleObj)
    return {
      statusCode: 404,
      data: undefined,
      err: 'there is no purchase listing!'
    };
  return {
    statusCode: 200,
    data: listOnSaleObj,
    err: undefined
  };
}
