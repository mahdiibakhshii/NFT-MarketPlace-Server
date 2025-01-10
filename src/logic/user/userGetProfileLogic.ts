import { ObjectIDType } from '../../helpers/aliases.js';
import { IUser, IUserProps } from '../../models/user.js';
import UserRepo from '../../repos/user/userRepo.js';
export async function userGetProfileLogic(
  userID: ObjectIDType<IUser>
): Promise<{ user: Partial<IUser> }> {
  const user = await UserRepo.findByID(userID, IUserProps.self);
  return {
    user: user!
  };
}
