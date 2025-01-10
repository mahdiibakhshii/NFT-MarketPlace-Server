import { IActivity } from '@models/activity.js';
import UserRepo from '../../repos/user/userRepo.js';
import { IUser, IUserProps } from '../../models/user.js';
import { ICollectible } from '../../models/collectible.js';
import { ObjectIDType } from '../../helpers/aliases.js';
import CollectibleRepo from '../../repos/collectibleRepo.js';
import ListOnSaleRepo from '../../repos/listOnSaleRepo.js';
import { IListOnSale } from '../../models/listOnSale.js';
import ActivityRepo from '../../repos/activityRepo.js';

export async function userDashboardLogic(
  requestedUserID: ObjectIDType<IUser> | undefined,
  userID: ObjectIDType<IUser>
): Promise<{
  statusCode: number;
  data:
    | {
        isSelf: boolean;
        userInfo: Partial<IUser>;
        collectibles: Partial<ICollectible>[] | null;
        onSales: Partial<IListOnSale>[] | null;
        activity: Partial<IActivity>[] | null;
      }
    | undefined;
  err: string | undefined;
}> {
  try {
    if (!userID)
      return {
        statusCode: 409,
        data: undefined,
        err: 'userID is not defined!'
      };
    const userObj = await UserRepo.findByID(userID, IUserProps.idOnly);
    if (!userObj)
      return {
        statusCode: 404,
        data: undefined,
        err: 'user not found!'
      };
    const isSelf =
      requestedUserID === undefined
        ? false
        : requestedUserID.toString() === userObj._id!.toString();
    const userInfo = await UserRepo.getUserDashboardByID(userObj._id!);
    const userCollectibles =
      await CollectibleRepo.getCollectiblesForDashboardByUserID(userObj._id!);
    const listOnSales =
      await ListOnSaleRepo.getActiveListsForDashboardBySellerID(
        1,
        8,
        userObj._id!
      );
    const userActivity = await ActivityRepo.getUserActivityForDashboard(
      userObj._id!
    );
    return {
      statusCode: 200,
      data: {
        isSelf: isSelf,
        userInfo: userInfo!,
        collectibles: userCollectibles,
        onSales: listOnSales,
        activity: userActivity
      },
      err: undefined
    };
  } catch (e) {
    return {
      statusCode: 500,
      data: undefined,
      err: 'err in dashboard'
    };
  }
}
