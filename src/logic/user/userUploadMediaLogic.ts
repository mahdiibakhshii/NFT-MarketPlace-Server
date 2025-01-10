import { IUser } from '../../models/user.js';
import UserRepo from '../../repos/user/userRepo.js';
import { ObjectIDType } from '../../helpers/aliases.js';
import { ForeignType, mediaTypes } from '../../models/media.js';
import { mediaUploadLogic } from '../../logic/media/mediaUploadLogic.js';

export async function userUploadMediaLogic(
  userID: ObjectIDType<IUser>,
  media: any,
  mediaForeignType: ForeignType
): Promise<{
  user: Partial<IUser>;
}> {
  const mediaResponse = await mediaUploadLogic(
    mediaTypes.image,
    media,
    mediaForeignType,
    userID
  );
  const user = await UserRepo.setProfilePic(
    userID,
    mediaResponse.media,
    mediaForeignType
  );
  return {
    user: user!
  };
}
