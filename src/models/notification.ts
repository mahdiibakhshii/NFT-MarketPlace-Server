import { model, Schema } from 'mongoose';
import { ObjectIDType } from '../helpers/aliases.js';
import { schemaToProps } from '../helpers/schemaHelper.js';
import { IUser } from './user';
import { ICollectible } from './collectible.js';

export enum notificationTypeEnum {
  nftMinted = 0,
  nftSold = 1,
  nftBought = 2,
  bidWithdraw = 3,
  royalityTransfered = 4
}
export interface INotification {
  _id: Schema.Types.ObjectId;
  collectible: ObjectIDType<ICollectible>;
  user: ObjectIDType<IUser>;
  secondUser?: ObjectIDType<IUser>;
  amount?: number;
  type: notificationTypeEnum;
  issueDate: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    collectible: {
      type: Schema.Types.ObjectId,
      ref: 'collectible',
      required: true
    },
    user: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    secondUser: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      default: undefined
    },
    amount: { type: Number, default: undefined },
    type: { type: Number, required: true },
    issueDate: { type: Date, required: true }
  },
  { timestamps: true }
);
notificationSchema.methods.to = schemaToProps;

export const NotificationModel = model<INotification>(
  'notification',
  notificationSchema
);

export enum INotificationProps {
  self = '_id collectible user secondUser amount type issueDate '
}
