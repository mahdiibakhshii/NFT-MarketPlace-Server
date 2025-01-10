import { ObjectIDType } from '../../helpers/aliases.js';
import {
  ILogin,
  ILoginProps,
  ILoginStatus,
  LoginModel
} from '../../models/login.js';
import { IUser } from '../../models/user.js';

async function create(doc: ILogin): Promise<ILogin> {
  return await LoginModel.create(doc);
}

async function findByToken(
  token: string,
  props?: ILoginProps
): Promise<ILogin | null> {
  return LoginModel.findOne(
    {
      token: token,
      status: ILoginStatus.active,
      expireAt: { $gt: new Date() }
    },
    props || ['_id', 'user']
  );
}
async function findinitByUserID(
  userID: ObjectIDType<IUser>
): Promise<ILogin | null> {
  return LoginModel.findOne(
    {
      user: userID,
      status: ILoginStatus.init,
      expireAt: { $gt: new Date() }
    },
    ['_id', 'user', 'token', 'message']
  );
}
async function deactiveToken(userID: ObjectIDType<IUser>): Promise<void> {
  await LoginModel.updateMany(
    {
      user: userID,
      status: ILoginStatus.active
    },
    { status: ILoginStatus.expire }
  );
  return;
}
async function activeToken(userID: ObjectIDType<IUser>): Promise<void> {
  await LoginModel.updateMany(
    {
      user: userID,
      status: ILoginStatus.init
    },
    { status: ILoginStatus.active }
  );
  return;
}
const LoginRepo = {
  create,
  findByToken,
  findinitByUserID,
  deactiveToken,
  activeToken
};
export default LoginRepo;
