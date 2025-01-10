import { Schema, model } from 'mongoose';
import { schemaToProps } from '../helpers/schemaHelper.js';
import { ObjectIDType } from '../helpers/aliases.js';
import { ICollectible } from './collectible.js';
import { IUser } from './user.js';

export enum listOnSaleStateEnum {
  initialized = 0,
  active = 1,
  finished = 2
}
export enum listOnSaleTypeEnum {
  isAuction = 0,
  isInstant = 1
}

//DOC: if instantSale => price is fixedPrice value / if auction => price is floorPrice value
export interface IListOnSale {
  _id: Schema.Types.ObjectId;
  collectible: ObjectIDType<ICollectible>;
  seller: ObjectIDType<IUser>;
  type: listOnSaleTypeEnum;
  auctionNum: number;
  signature: string;
  price: number;
  amount: number;
  fixedAmount: number;
  state: listOnSaleStateEnum;
  startAt: Date;
  expireAt: Date;
}

const listOnSaleSchema = new Schema<IListOnSale>(
  {
    collectible: {
      type: Schema.Types.ObjectId,
      ref: 'collectible',
      required: true
    },
    state: { type: Number, required: true },
    seller: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    type: { type: Number, required: true },
    auctionNum: { type: Number },
    signature: { type: String, required: true },
    price: { type: Number, required: true },
    amount: { type: Number, required: true },
    fixedAmount: { type: Number, required: true },
    startAt: { type: Date, default: undefined },
    expireAt: { type: Date, default: undefined }
  },
  {
    timestamps: true
  }
);
listOnSaleSchema.methods.to = schemaToProps;

export const listOnSaleModel = model<IListOnSale>(
  'listOnSale',
  listOnSaleSchema
);

export enum IListOnSaleProps {
  self = '_id collectible seller type auctionNum state signature price amount fixedAmount startAt expireAt'
}
