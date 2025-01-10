import moment from 'moment';
import { IUser } from '../../models/user.js';
import CollectibleRepo from '../../repos/collectibleRepo.js';
import { ObjectIDType } from '../../helpers/aliases.js';
import {
  listOnSaleStateEnum,
  listOnSaleTypeEnum
} from '../../models/listOnSale.js';
import ListOnSaleRepo from '../../repos/listOnSaleRepo.js';
import { ICollectible } from '../../models/collectible.js';
import ActivityRepo from '../../repos/activityRepo.js';
import { activityTypeEnum } from '../../models/activity.js';

export async function removeListFromSaleLogic(
  userID: ObjectIDType<IUser>,
  collectibleID: ObjectIDType<ICollectible>
): Promise<{
  statusCode: number;
  data: { status: string } | undefined;
  err: string | undefined;
}> {
  try {
    //DOC: verify request
    if (
      !(await CollectibleRepo.checkCollectibleOwnershipByUserID(
        collectibleID,
        userID
      ))
    )
      return {
        statusCode: 409,
        data: undefined,
        err: 'you are not collectible Owner!'
      };
    const collectibleObj = await CollectibleRepo.getByCollectibleID(
      collectibleID
    );
    if (!collectibleObj) {
      //TODO: add exception log
      return {
        statusCode: 404,
        data: undefined,
        err: 'collectible not found!'
      };
    }
    //DOC: Validation
    const listObj =
      await ListOnSaleRepo.getActiveListOnSaleByCollectibleIDAndSeller(
        collectibleObj._id!,
        userID
      );
    if (!listObj)
      return {
        statusCode: 404,
        data: undefined,
        err: 'there is no active listOnSale!'
      };
    //DOC: seller can only remove instant sale of unactivated auction from sale
    if (
      listObj.type === listOnSaleTypeEnum.isAuction &&
      listObj.state === listOnSaleStateEnum.active
    )
      return {
        statusCode: 409,
        data: undefined,
        err: 'activated auction cant be finished by seller.'
      };
    await ListOnSaleRepo.finishListOnSaleState(listObj._id!);
    //DOC: create listRemoved activity for owner
    await ActivityRepo.createActivity({
      collectible: collectibleObj._id,
      user: userID,
      type: activityTypeEnum.listRemoved,
      issueDate: moment().toDate()
    });
    return { statusCode: 200, data: { status: 'success' }, err: undefined };
  } catch (e) {
    return {
      statusCode: 500,
      data: undefined,
      err: 'removing list from sale failed!'
    };
  }
}
