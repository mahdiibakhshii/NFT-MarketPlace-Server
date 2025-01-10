import { ForeignType, IMedia, mediaTypes } from '../models/media.js';
import MediaRepo from '../repos/mediaRepo.js';

import mkdirp from 'async-mkdirp';
import Sharp from 'sharp';
import { ObjectIDType } from './aliases';

export async function processMedia(mediaID: ObjectIDType<IMedia>) {
  try {
    // find the media
    const media = await MediaRepo.getByMediaID(mediaID);
    if (media) {
      // what type is it?!
      switch (media.type) {
        case mediaTypes.image:
          /*
            Image presentation types are :
                b1000.  `1000 x X` size image with low quality and blur.

                m1000.  `1000 x X` size image with medium quality.

                m500.  `500 x X` size image with medium quality.
         */

          switch (media.foreignType) {
            case ForeignType.userCover:
            case ForeignType.userProfile: {
              const outputPath =
                process.env.MediaPath + 'media' + '_b1000/' + media.url;
              await mkdirp(outputPath.substr(0, outputPath.lastIndexOf('/')));
              // sharp it!
              await Sharp(process.env.MediaPath + '' + media.url)
                .rotate()
                .resize({
                  width: Math.min(
                    media.i === undefined ? 1500 : media.i.w,
                    1000
                  ),
                  height: Math.min(
                    media.i === undefined ? 1500 : media.i.h,
                    1000
                  ),
                  fit: Sharp.fit.inside,
                  position: Sharp.strategy.entropy
                })
                .jpeg({
                  quality: 40,
                  chromaSubsampling: '4:4:4'
                })
                .blur(10)
                .toFile(outputPath);

              //case Media.ForeignType.:

              // create directory if needed
              const outputPathM1000 =
                process.env.MediaPath + 'media' + '_m1000/' + media.url;
              await mkdirp(
                outputPathM1000.substr(0, outputPathM1000.lastIndexOf('/'))
              );
              // sharp it!
              await Sharp(process.env.MediaPath + '' + media.url)
                .rotate()
                .resize({
                  width: Math.min(
                    media.i === undefined ? 1500 : media.i.w,
                    1000
                  ),
                  height: Math.min(
                    media.i === undefined ? 1500 : media.i.h,
                    1000
                  ),
                  fit: Sharp.fit.inside,
                  position: Sharp.strategy.entropy
                })
                .jpeg({
                  quality: 80,
                  chromaSubsampling: '4:4:4'
                })
                .toFile(outputPathM1000);

              // create directory if needed
              const outputPathM500 =
                process.env.MediaPath + 'media' + '_m500/' + media.url;
              await mkdirp(
                outputPathM500.substr(0, outputPathM500.lastIndexOf('/'))
              );
              // sharp it!
              await Sharp(process.env.MediaPath + '' + media.url)
                .rotate()
                .resize({
                  width: Math.min(media.i === undefined ? 500 : media.i.w, 300),
                  height: Math.min(
                    media.i === undefined ? 500 : media.i.h,
                    300
                  ),
                  fit: Sharp.fit.inside,
                  position: Sharp.strategy.entropy
                })
                .jpeg({
                  quality: 60,
                  chromaSubsampling: '4:4:4'
                })
                .toFile(outputPathM500);
              break;
            }
            case ForeignType.collectibleImage: {
              const outputPath =
                process.env.MediaPath + 'media' + '_b1000/' + media.url;
              await mkdirp(outputPath.substr(0, outputPath.lastIndexOf('/')));
              // sharp it!
              await Sharp(process.env.MediaPath + '' + media.url)
                .rotate()
                .resize({
                  width: Math.min(
                    media.i === undefined ? 1500 : media.i.w,
                    1000
                  ),
                  height: Math.min(
                    media.i === undefined ? 1500 : media.i.h,
                    1000
                  ),
                  fit: Sharp.fit.inside,
                  position: Sharp.strategy.entropy
                })
                .jpeg({
                  quality: 40,
                  chromaSubsampling: '4:4:4'
                })
                .blur(10)
                .toFile(outputPath);

              const outputPathB500 =
                process.env.MediaPath + 'media' + '_b500/' + media.url;
              await mkdirp(
                outputPathB500.substr(0, outputPathB500.lastIndexOf('/'))
              );
              // sharp it!
              await Sharp(process.env.MediaPath + '' + media.url)
                .rotate()
                .resize({
                  width: Math.min(media.i === undefined ? 500 : media.i.w, 300),
                  height: Math.min(
                    media.i === undefined ? 500 : media.i.h,
                    300
                  ),
                  fit: Sharp.fit.inside,
                  position: Sharp.strategy.entropy
                })
                .jpeg({
                  quality: 60,
                  chromaSubsampling: '4:4:4'
                })
                .blur(10)
                .toFile(outputPathB500);
              break;
            }
          }
          break;
      }
    }
  } catch (e) {
    console.log(e);
  }
}
