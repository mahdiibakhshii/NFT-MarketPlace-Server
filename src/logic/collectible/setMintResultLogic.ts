import moment from 'moment';
import { activityTypeEnum } from '../../models/activity.js';
import ActivityRepo from '../../repos/activityRepo.js';
import { ObjectIDType } from '../../helpers/aliases.js';
import { ICollectible } from '../../models/collectible.js';
import { IUser } from '../../models/user.js';
import CollectibleRepo from '../../repos/collectibleRepo.js';
import CollectionRepo from '../../repos/collectionRepo.js';
import NotificationRepo from '../../repos/notificationRepo.js';
import { notificationTypeEnum } from '../../models/notification.js';

interface ISetMintResultInput {
  collectibleID: ObjectIDType<ICollectible>;
  tokenID: number;
  contractAddress: string;
}

export async function setMintResultLogic(
  userID: ObjectIDType<IUser>,
  dataToStore: ISetMintResultInput
): Promise<{
  statusCode: number;
  data?: { status: string };
  err?: string;
}> {
  const collectibleObj = await CollectibleRepo.getByCollectibleID(
    dataToStore.collectibleID
  );
  try {
    //DOC: validate request
    if (collectibleObj === null)
      return {
        statusCode: 404,
        data: undefined,
        err: 'collectible dosent exist!'
      };
    if (userID.toString() === collectibleObj!.creator!)
      return {
        statusCode: 409,
        data: undefined,
        err: 'only creator of the collectible is allowed to set mint result!'
      };
    if (collectibleObj.state === 1)
      return {
        statusCode: 409,
        data: undefined,
        err: 'collectible already minted!'
      };
    //DOC: update collectible tolenID
    CollectibleRepo.setTokenIDByCollectibleID(
      dataToStore.collectibleID,
      dataToStore.tokenID
    );
    //DOC: add creator to owners
    CollectibleRepo.setOwnerByCollectibleID(
      dataToStore.collectibleID,
      collectibleObj.creator!,
      collectibleObj.volume!
    );
    //DOC: update collection index
    await CollectionRepo.incrementTokensCountByContractAddress(
      dataToStore.contractAddress
    );
    //DOC create new activity fot creator
    await ActivityRepo.createActivity({
      collectible: collectibleObj._id,
      user: collectibleObj.creator!,
      amount: collectibleObj.volume!,
      type: activityTypeEnum.nftMinted,
      issueDate: moment().toDate()
    });
    //DOC create new notification fot creator
    await NotificationRepo.createNotification({
      collectible: collectibleObj._id,
      user: collectibleObj.creator!,
      amount: collectibleObj.volume!,
      type: notificationTypeEnum.nftMinted,
      issueDate: moment().toDate()
    });
    return { statusCode: 200, data: { status: 'success' }, err: undefined };
  } catch (e) {
    return { statusCode: 500, data: undefined, err: 'unhandled err:' + e };
  }
}
