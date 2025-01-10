import moment from 'moment';
import CollectionRepo from '../../repos/collectionRepo.js';
import { IUserProps } from '../../models/user.js';
import CollectibleRepo from '../../repos/collectibleRepo.js';
import UserRepo from '../../repos/user/userRepo.js';
import ActivityRepo from '../../repos/activityRepo.js';
import { activityTypeEnum } from '../../models/activity.js';

interface IBurnCollectibleLogicInput {
  owner: string;
  collectionAddress: string;
  tokenID: number;
  amount: number;
}
export async function burnCollectibleLogic(
  burnObj: IBurnCollectibleLogicInput
) {
  try {
    //DOC: Fetch owner obj
    const ownerObj = await UserRepo.findByAccountID(
      burnObj.owner,
      IUserProps.idOnly
    );
    if (!ownerObj) {
      //TODO: add exception log
      return { statusCode: 404, data: undefined, err: 'owner not found!' };
    }
    //DOC: verify request
    const collectionAddress = await CollectionRepo.getByContractAddress(
      burnObj.collectionAddress
    );
    if (!collectionAddress) {
      //TODO: add exception log
      return { statusCode: 404, data: undefined, err: 'collection not found!' };
    }
    const collectibleObj = await CollectibleRepo.getByCollectionIDandTokenID(
      collectionAddress._id!,
      burnObj.tokenID
    );
    if (collectibleObj == null) {
      return {
        statusCode: 404,
        data: undefined,
        err: 'collectible not found!'
      };
    }
    //DOC: update ownersList and create activity docs

    const OwnerOwnCount = await CollectibleRepo.getOwnerCountByCollectibleID(
      collectibleObj._id!,
      ownerObj._id!
    );
    if (!OwnerOwnCount || OwnerOwnCount - burnObj.amount < 0)
      return {
        statusCode: 409,
        data: undefined,
        err: 'owner ownes count is less than burn amount!'
      };
    await CollectibleRepo.updateOwnerCountByCollectibleID(
      collectibleObj._id!,
      ownerObj._id!,
      burnObj.amount * -1
    );
    //DOC: create burn activity for owner
    await ActivityRepo.createActivity({
      collectible: collectibleObj._id,
      user: ownerObj._id!,
      type: activityTypeEnum.nftBurned,
      issueDate: moment().toDate()
    });
    //TODO: create burn notification for owner
    //DOC: Create sellReceipt Process
    return { statusCode: 200, data: 'newSellReceiptObj', err: undefined };
  } catch (e) {
    console.log(e);
    return { statusCode: 500, data: undefined, err: 'Unhandled error !: ' + e };
  }
}
