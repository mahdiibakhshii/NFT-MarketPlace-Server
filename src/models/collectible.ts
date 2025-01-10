import { Schema, model } from 'mongoose';
import { schemaToProps } from '../helpers/schemaHelper.js';
import { ObjectIDType } from '../helpers/aliases.js';
import { IUser } from './user';
import { ICollection } from './collection.js';

export interface ICollectibleProperty {
  key: string;
  value: string;
}
export enum sellMethodEnum {
  onSell = 0,
  instantSell = 1
}

export enum collectibleState {
  stored = 0,
  minted = 1,
  sellOrderSigned = 2,
  sellOrderLocked = 3
}

export interface ICollectible {
  _id: Schema.Types.ObjectId;
  creator: ObjectIDType<IUser>;
  owners: [{ owner: ObjectIDType<IUser>; count: number }];
  collectionID: ObjectIDType<ICollection>;
  name: string;
  description: string;
  royalty: number;
  property?: ICollectibleProperty[];
  sellMethod: sellMethodEnum;
  sellPrice?: number;
  imageLocal?: Schema.Types.ObjectId;
  imageHash?: string;
  ipfsURI?: string;
  isLock: boolean;
  tokenID: number;
  volume: number;
  soldItem: number;
  state: collectibleState;
  signature: string;
  signerAddress: string;
}

const collectibleSchema = new Schema<ICollectible>(
  {
    creator: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    owners: [
      {
        owner: { type: Schema.Types.ObjectId, ref: 'user', required: true },
        count: { type: Number, required: true }
      }
    ],
    collectionID: {
      type: Schema.Types.ObjectId,
      ref: 'collection',
      required: true
    },
    name: { type: String, required: true },
    description: { type: String },
    royalty: { type: Number, default: 10 },
    property: [
      {
        key: String,
        value: String
      }
    ],
    sellMethod: { type: Number },
    sellPrice: { type: Number },
    imageLocal: { type: Schema.Types.ObjectId, ref: 'media' },
    imageHash: { type: String },
    ipfsURI: { type: String },
    isLock: { type: Boolean },
    tokenID: { type: Number, default: undefined },
    volume: { type: Number, default: 1 },
    soldItem: { type: Number, default: 0 },
    state: { type: Number, default: 0 },
    signature: { type: String, default: undefined },
    signerAddress: { type: String, default: undefined }
  },
  {
    timestamps: true
  }
);
collectibleSchema.methods.to = schemaToProps;

export const collectibleModel = model<ICollectible>(
  'collectible',
  collectibleSchema
);

export enum ICollectibleProps {
  self = '_id creator owner collection name description royalty property sellMethod sellPrice imageLocal ipfs isLock tokenID signedSellOrderMessage'
}
