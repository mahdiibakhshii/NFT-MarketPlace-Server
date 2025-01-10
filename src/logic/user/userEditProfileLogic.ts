import { IUser } from '../../models/user.js';
import UserRepo from '../../repos/user/userRepo.js';
import { IUserEditProfileEndInput } from '../../ends/user/editProfileEnd.js';

export async function userEditProfileLogic(
  updatedData: IUserEditProfileEndInput
): Promise<{
  user: Partial<IUser> | null;
}> {
  const user = await UserRepo.editUser(updatedData);
  return {
    user: user
  };
}
