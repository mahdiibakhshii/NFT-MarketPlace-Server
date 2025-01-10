import { IUserEditProfileEndInput } from '../../ends/user/editProfileEnd.js';
import { ObjectIDType } from '../../helpers/aliases.js';
import { ForeignType, IMedia } from '../../models/media.js';
import { IUser, IUserProps, UserModel } from '../../models/user.js';

async function upsert(
  accountID: string
): Promise<{ user: Partial<IUser>; isNew: boolean }> {
  const existingUser = await findByAccountID(accountID, IUserProps.self);
  if (existingUser) return { user: existingUser, isNew: false };
  const doc: IUser = {
    accountID: accountID,
    isVerified: false,
    socialMedia: []
  };
  return {
    user: (await UserModel.create(doc)).to!(IUserProps.self),
    isNew: true
  };
}

async function findByID(
  userID: ObjectIDType<IUser>,
  props: IUserProps
): Promise<Partial<IUser> | null> {
  return await UserModel.findById(userID, props);
}

async function findByAccountID(
  accountID: string,
  props: IUserProps
): Promise<Partial<IUser> | null> {
  return await UserModel.findOne(
    {
      accountID: { $regex: accountID, $options: 'i' }
    },
    props
  );
}

async function editUser(updatedData: IUserEditProfileEndInput) {
  const updateObj: { [key: string]: any } = {};
  if (updatedData.name) updateObj.name = updatedData.name;
  if (updatedData.bio) updateObj.bio = updatedData.bio;
  if (updatedData.urls) updateObj.urls = updatedData.urls;
  if (updatedData.socialMedia) updateObj.socialMedia = updatedData.socialMedia;
  await UserModel.updateOne(
    {
      accountID: updatedData.accountID
    },
    updateObj
  );

  return await findByAccountID(updatedData.accountID, IUserProps.self);
}
async function setProfilePic(
  userID: ObjectIDType<IUser>,
  media: Partial<IMedia>,
  mediaForeignType: ForeignType
): Promise<IUser | undefined> {
  let user;
  if (mediaForeignType === ForeignType.userProfile)
    user = await UserModel.findOneAndUpdate(
      {
        _id: userID
      },
      { 'medias.profilePic': media },
      { new: true }
    );
  else if (mediaForeignType === ForeignType.userCover)
    user = await UserModel.findOneAndUpdate(
      {
        _id: userID
      },
      { 'medias.coverPic': media },
      { new: true }
    );
  if (user) return user;
  else return undefined;
}
async function getUserDashboardByID(
  userID: ObjectIDType<IUser>
): Promise<Partial<IUser> | null> {
  return await UserModel.findById(userID).select({
    accountID: 1,
    name: 1,
    bio: 1,
    socialMedia: 1,
    urls: 1,
    isVerified: 1,
    createdAt: 1,
    medias: 1
  });
}
const UserRepo = {
  upsert,
  findByAccountID,
  findByID,
  editUser,
  setProfilePic,
  getUserDashboardByID
};
export default UserRepo;
