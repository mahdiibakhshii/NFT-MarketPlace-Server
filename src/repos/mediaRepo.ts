import { ObjectIDType } from '../helpers/aliases.js';
import { IMedia, MediaModel } from '../models/media.js';

async function createMedia(
  mediaObj: Partial<IMedia>
): Promise<Partial<IMedia>> {
  return await MediaModel.create(mediaObj);
}

async function getByMediaID(
  mediaID: ObjectIDType<IMedia>
): Promise<Partial<IMedia> | null> {
  return await MediaModel.findById(mediaID);
}

async function getByMediaHash(
  mediaHash: string
): Promise<Partial<IMedia> | null> {
  return await MediaModel.findOne({ hash: mediaHash });
}

const MediaRepo = {
  createMedia,
  getByMediaID,
  getByMediaHash
};
export default MediaRepo;
