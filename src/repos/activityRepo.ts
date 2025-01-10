import {
  ActivityModel,
  activityTypeEnum,
  IActivity
} from '../models/activity.js';
import { ObjectIDType } from '../helpers/aliases.js';
import { IUser } from '../models/user.js';
import { ICollectible } from '@models/collectible.js';

async function createActivity(
  activityObj: Partial<IActivity>
): Promise<Partial<IActivity> | null> {
  return await ActivityModel.create(activityObj);
}
async function getUserActivityForDashboard(
  userID: ObjectIDType<IUser>
): Promise<Partial<IActivity>[] | null> {
  return await ActivityModel.find({ user: userID })
    .populate({
      path: 'collectible',
      select: { name: 1, collectionID: 1, imageHash: 1 },
      populate: { path: 'collectionID', select: { title: 1 } }
    })
    .populate({
      path: 'user',
      select: { _id: 1, accountID: 1, name: 1, 'medias.profilePic.hash': 1 }
    })
    .populate({
      path: 'secondUser',
      select: { _id: 1, accountID: 1, name: 1, 'medias.profilePic.hash': 1 }
    })
    .sort({ createdAt: -1 });
}

async function getCollectibleHistory(
  collectibleID: ObjectIDType<ICollectible>
): Promise<IActivity[]> {
  return ActivityModel.find({
    collectible: collectibleID,
    type: { $nin: [activityTypeEnum.nftSold, activityTypeEnum.nftTransferIn] }
  })
    .populate({
      path: 'user',
      select: { name: 1, 'medias.profilePic.hash': 1, accountID: 1 }
    })
    .populate({
      path: 'secondUser',
      select: { name: 1, 'medias.profilePic.hash': 1, accountID: 1 }
    })
    .select({ user: 1, amount: 1, type: 1, issueDate: 1, secondUser: 1 })
    .sort({ issueDate: -1 });
}
const ActivityRepo = {
  createActivity,
  getUserActivityForDashboard,
  getCollectibleHistory
};
export default ActivityRepo;
