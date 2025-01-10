import { IUser, IUserProps } from '../../models/user.js';
import UserRepo from '../../repos/user/userRepo.js';
import { ILogin } from '../../models/login.js';
import LoginRepo from '../../repos/user/loginRepo.js';
import ProviderService from '../../services/web3/ProviderService.js';

export async function userLoginLogic(
  accountID: string,
  signature: string
): Promise<{
  user: Partial<IUser> | null;
  login: Partial<ILogin> | null;
  err: string | undefined;
}> {
  const user = await UserRepo.findByAccountID(accountID, IUserProps.self);
  if (!user)
    return {
      user: null,
      login: null,
      err: 'user dose not exists!'
    };
  const login = await LoginRepo.findinitByUserID(user._id!);
  if (!login)
    return {
      user: null,
      login: null,
      err: 'token dose not exists!'
    };
  if (
    process.env.DOCS_ENV ||
    ProviderService.verifySignature(
      login?.message === undefined ? '' : login.message,
      signature,
      accountID
    )
  ) {
    await LoginRepo.activeToken(user._id!);
    return {
      user: user,
      login: login,
      err: undefined
    };
  }
  return {
    user: null,
    login: null,
    err: 'signature is not verified!'
  };
}
