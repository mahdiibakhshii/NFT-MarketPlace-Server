import { Schema, model } from 'mongoose';
import { schemaToProps } from '../helpers/schemaHelper.js';
import { ObjectIDType } from '../helpers/aliases.js';
import { IUser } from './user';
import { ICollectible } from './collectible.js';

export enum mediaTypes {
  image = 0,
  audio = 1,
  video = 2
}

export enum mediaStatus {
  inactive = 0,
  active = 1,
  removed = 2
}

export enum ForeignType {
  userProfile = 0,
  userCover = 1,
  collectibleImage = 2
}

export const ForeignTypeEn = ['userProfile', 'userCover', 'collectibleImage'];

export interface IMedia {
  _id?: Schema.Types.ObjectId;
  name?: string;
  type: mediaTypes;
  mimeType: string;
  foreignType: ForeignType;
  foreignId: ObjectIDType<IUser>;
  collectibleId?: ObjectIDType<ICollectible>;
  url?: string;
  md5?: string;
  size: number;
  hash: string;
  status: mediaStatus;
  i: {
    w: number;
    h: number;
  };
}

const mediaSchema = new Schema<IMedia>(
  {
    name: String,
    type: Number,
    mimeType: String,
    foreignType: Number,
    foreignId: { type: Schema.Types.ObjectId, ref: 'user' },
    url: String,
    md5: String,
    size: Number,
    hash: String,
    status: Number,
    i: {
      w: Number,
      h: Number
    }
  },
  {
    timestamps: true
  }
);
mediaSchema.methods.to = schemaToProps;

export const MediaModel = model<IMedia>('media', mediaSchema);

export enum IMediaProps {
  self = '_id hash size type mimeType foreignType url status'
}
export function shortObjectOf(media: Partial<IMedia>) {
  return {
    _id: media._id,
    hash: media.hash,
    size: media.size,
    type: media.type,
    mimeType: media.mimeType,
    i: media.i
  };
}
