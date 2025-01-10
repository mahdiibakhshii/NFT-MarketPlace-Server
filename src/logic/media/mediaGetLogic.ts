import MediaRepo from '../../repos/mediaRepo.js';
import fs from 'fs';
export async function mediaGetLogic(
  hash: string,
  pt: string | undefined
): Promise<{
  media: Buffer | undefined;
  mimeType: string | undefined;
  found: boolean;
  error: any;
}> {
  try {
    const presentationType = pt ? pt : null;

    // find media with id
    const media = await MediaRepo.getByMediaHash(hash);

    const path = (media || {}).url;
    if (media && path) {
      const fullPath =
        process.env.MediaPath +
        (presentationType ? 'media_' + presentationType + '/' : '') +
        path;
      //below address is for fastify-static and at register the library we defined root path of medias.
      const downloadPath =
        'media' + (presentationType ? '_' + presentationType : '') + '/' + path;

      fs.accessSync(fullPath, fs.constants.F_OK);
      const image = fs.readFileSync(fullPath);
      return {
        media: image,
        mimeType: media.mimeType,
        found: true,
        error: undefined
      };
    } else {
      return {
        media: undefined,
        mimeType: undefined,
        found: false,
        error: 'not found'
      };
    }
  } catch (e) {
    return {
      media: undefined,
      mimeType: undefined,
      found: false,
      error: e
    };
  }
}
