import { Exceptions } from '../../constants/exceptions.js';
import {
  ForeignTypeEn,
  IMedia,
  mediaStatus,
  mediaTypes,
  shortObjectOf
} from '../../models/media.js';
import Crypto from 'crypto';
import mkdirp from 'async-mkdirp';
import { ObjectIDType } from '../../helpers/aliases.js';
import { IUser } from '../../models/user.js';
import Sharp from 'sharp';
import MediaRepo from '../../repos/mediaRepo.js';
import { processMedia } from '../../helpers/mediaPresentation.js';

export async function mediaUploadLogic(
  mediaType: number,
  media: any,
  foreignType: number,
  foreignId: ObjectIDType<IUser>
): Promise<{ media: Partial<IMedia> }> {
  if (process.env.DOCS_ENV)
    return { media: fakeMediaResponse(foreignType, foreignId) };
  const mimeType = media.mimetype;
  let extractedMediaType = -1;
  if (mediaType === mediaTypes.image && mimeType.startsWith('image/'))
    extractedMediaType = mediaTypes.image;
  else if (mediaType === mediaTypes.audio && mimeType.startsWith('audio/'))
    extractedMediaType = mediaTypes.audio;
  else if (mediaType === mediaTypes.video && mimeType.startsWith('video/'))
    extractedMediaType = mediaTypes.video;
  if (extractedMediaType === -1) throw Exceptions.mediaBadType;
  if (media.data.byteLength > 16 * 1024 * 1024) throw Exceptions.mediaSizeLimit;

  const mediaTypeEn = mimeType.split('/')[0];
  const foreignTypeEn = ForeignTypeEn[foreignType];
  const path = process.env.MediaPath + foreignTypeEn + '/' + mediaTypeEn + '/';
  const fileName =
    Crypto.randomBytes(16).toString('hex') + '.' + media.name.split('.').pop();

  let err: any = await mkdirp(path);
  if (media.mv) {
    err = await media.mv(path + fileName);
    if (err) {
      throw Exceptions.mediaMvErr;
    }
  } else throw Exceptions.mediaMvNotFound;
  let metaData: any = {};
  if (mediaType === mediaTypes.image && !mimeType.endsWith('icon')) {
    metaData = await Sharp(path + fileName).metadata(); // TODO:: optimize
  }

  const mediaData: IMedia = {
    name: media.name,
    foreignType: foreignType,
    foreignId: foreignId,
    type: extractedMediaType,
    size: media.data.byteLength,
    url: foreignTypeEn + '/' + mediaTypeEn + '/' + fileName,
    hash: Crypto.randomBytes(24).toString('hex'),
    md5: media.md5,
    mimeType: mimeType,
    i: {
      w: (metaData.orientation || 1) < 5 ? metaData.width : metaData.height,
      // eslint-disable-next-line no-constant-condition
      h: metaData.orientation < 5 || 1 ? metaData.height : metaData.width
    },
    status: mediaStatus.active
  };

  let objMedia = await MediaRepo.createMedia(mediaData);
  await processMedia(objMedia._id!);
  objMedia = shortObjectOf(objMedia);

  return {
    media: objMedia
  };
}

function fakeMediaResponse(
  foreignType: number,
  foreignId: ObjectIDType<IUser>
) {
  return {
    name: 'sample name',
    foreignType: foreignType,
    foreignId: foreignId,
    type: 1,
    size: 100,
    url: '/sample/url',
    hash: Crypto.randomBytes(24).toString('hex'),
    md5: 'sample string',
    mimeType: '.png',
    i: {
      w: 100,
      h: 100
    },
    status: mediaStatus.active
  };
}
