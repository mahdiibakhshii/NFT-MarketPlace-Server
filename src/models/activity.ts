import { ObjectIDType } from '../helpers/aliases.js';
import { schemaToProps } from '../helpers/schemaHelper.js';
import { model, Schema } from 'mongoose';
import { IUser } from './user';
import { ICollectible } from './collectible.js';

export enum activityTypeEnum {
  nftMinted = 0,
  nftSold = 1,
  nftBought = 2,
  nftTransferIn = 3,
  nftTransferOut = 4,
  nftBurned = 5,
  bidPlaced = 6,
  listRemoved = 7
}
export interface IActivity {
  _id: Schema.Types.ObjectId;
  collectible: ObjectIDType<ICollectible>;
  user: ObjectIDType<IUser>;
  secondUser?: ObjectIDType<IUser>;
  amount?: number;
  price?: number;
  type: activityTypeEnum;
  issueDate: Date;
}

const activitySchema = new Schema<IActivity>(
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
    price: { type: Number, default: undefined },
    type: { type: Number, required: true },
    issueDate: { type: Date, required: true }
  },
  { timestamps: true }
);
activitySchema.methods.to = schemaToProps;

export const ActivityModel = model<IActivity>('activity', activitySchema);

export enum IActivityProps {
  self = '_id collectible user secondUser amount price type issueDate '
}
