import { Schema, model } from 'mongoose';
import { schemaToProps } from '../helpers/schemaHelper.js';
import { ObjectIDType } from '../helpers/aliases.js';
import { ICollectible } from './collectible.js';
import { IUser } from './user.js';
import { IListOnSale } from './listOnSale';

export enum bidStateEnum {
  created = 0,
  approved = 1,
  failed = 2,
  accepted = 3
}
export interface IBid {
  _id: Schema.Types.ObjectId;
  auction: ObjectIDType<IListOnSale>;
  bidder: ObjectIDType<IUser>;
  collectible: ObjectIDType<ICollectible>;
  price: number;
  state: bidStateEnum;
  dipositedAt: Date;
  signature: string;
}

const bidSchema = new Schema<IBid>(
  {
    auction: {
      type: Schema.Types.ObjectId,
      ref: 'listOnSale',
      required: true
    },
    bidder: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true
    },
    collectible: {
      type: Schema.Types.ObjectId,
      ref: 'collectible',
      required: true
    },
    price: { type: Number, required: true },
    state: { type: Number, required: true, default: bidStateEnum.created },
    dipositedAt: { type: Date, default: undefined },
    signature: { type: String, default: undefined }
  },
  {
    timestamps: true
  }
);
bidSchema.methods.to = schemaToProps;

export const bidModel = model<IBid>('bid', bidSchema);

export enum IBidProps {
  self = '_id auction bidder collectible price state dipositedAt signature'
}
