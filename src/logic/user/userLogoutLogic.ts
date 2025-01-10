import { ObjectIDType } from '../../helpers/aliases.js';
import LoginRepo from '../../repos/user/loginRepo.js';
import { IUser } from '../../models/user.js';
export async function userLogoutLogic(
  userID: ObjectIDType<IUser>
): Promise<void> {
  await LoginRepo.deactiveToken(userID);
}
