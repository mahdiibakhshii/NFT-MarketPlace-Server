import UserRepo from '../../repos/user/userRepo.js';
import { ILoginStatus } from '../../models/login.js';
import LoginRepo from '../../repos/user/loginRepo.js';
import { newToken } from '../../helpers/tokenHelper.js';
import { randomNumberWithFixedLength } from '../../helpers/generalFunctions.js';

export async function userLoginTextLogic(accountID: string): Promise<{
  loginText: string;
  isNew: boolean;
}> {
  const { user, isNew } = await UserRepo.upsert(accountID);
  const foundedLoginObj = await LoginRepo.findinitByUserID(user._id!);
  if (foundedLoginObj)
    return { loginText: foundedLoginObj.message!, isNew: isNew };
  const message = `I want to login on company at ${new Date().toJSON()} with nonce:${randomNumberWithFixedLength(
    5
  )}.I accept the company Terms of Service and I am at least 13 years old.`;
  await LoginRepo.create({
    user: user._id!,
    token: newToken(),
    message: message,
    status: ILoginStatus.init,
    expireAt: new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
  });
  return {
    loginText: message,
    isNew: isNew
  };
}
