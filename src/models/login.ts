import { Schema, model } from 'mongoose';
import { schemaToProps } from '../helpers/schemaHelper.js';
import { ObjectIDType } from '../helpers/aliases.js';
import { IUser } from './user.js';

export enum ILoginStatus {
  init = 0,
  active = 1,
  expire = 2
}

export interface ILogin {
  _id?: Schema.Types.ObjectId;
  user: ObjectIDType<IUser>;
  token: string;
  message?: string;
  status: ILoginStatus;
  expireAt: Date;

  createdAt?: Date;
  updatedAt?: Date;

  to?: (props: ILoginProps) => Partial<ILogin>;
}

const loginSchema = new Schema<ILogin>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'user' },
    token: { type: String, required: true, unique: true, index: true },
    message: { type: String },
    status: { type: Number },
    expireAt: { type: Date }
  },
  {
    timestamps: true
  }
);
loginSchema.index({
  token: 1,
  status: 1,
  expireAt: 1
});
loginSchema.methods.to = schemaToProps;

export const LoginModel = model<ILogin>('login', loginSchema);

export enum ILoginProps {
  self = 'token'
}
