import { afterNow, prepareNow } from '../../test/prepareHelpers.spec.js';
import Ends from '../ends/ends.js';
import { IEndMethod } from '../ends/IEnd.js';
import { HTTPStatusCodes } from './constants.js';
import * as fs from 'fs';
import path from 'path';
import MongoUnit from 'mongo-unit';
import testData from '../../test/testData.spec.js';
import TestDataSpec from '../../test/testData.spec.js';
//import LoginRepo from "@repos/loginRepo";
import { integerEnumDocumentation } from '../helpers/enumHelper.js';
import LoginRepo from '../repos/user/loginRepo.js';

export async function generatePostmanCollection(): Promise<{
  status: boolean;
  result?: any;
}> {
  await prepareNow();
  let collection;
  try {
    collection = {
      info: {
        name: process.env.DOCS_TITLE,
        _postman_id: process.env.POSTMAN_COLLECTION_POSTMAN_ID,
        schema:
          'https://schema.getpostman.com/json/collection/v2.0.0/collection.json'
      },
      item: []
    };

    for (const end of Ends) {
      const path = end.url.split('/');
      let relativePathItemObj: any[] = collection.item;
      // create path in postman collection
      for (let i = 1; i < path.length - 1; i++) {
        const pathItem = path[i].charAt(0).toUpperCase() + path[i].slice(1);
        const foundItem = relativePathItemObj.find(
          (it) => it.name === pathItem && it.item
        );
        if (!foundItem) {
          const newIt = {
            name: pathItem,
            item: []
          };
          relativePathItemObj.push(newIt);
          relativePathItemObj = newIt.item;
        } else {
          relativePathItemObj = foundItem.item;
        }
      }

      // create headers array, for now, it always contains `session token` and `user token` values
      const headers = [
        {
          key: 'ln',
          value: '{{language}}',
          type: 'text'
        },
        {
          key: 'lt',
          value: '{{loginToken}}',
          type: 'text'
        }
      ];
      // create request body / query params
      const requestBody =
        end.method === IEndMethod.POST
          ? {
              mode: 'raw',
              raw: JSON.stringify(end.docs.sampleInput, null, 4),
              options: {
                raw: {
                  language: 'json'
                }
              }
            }
          : undefined;

      const requestQuery =
        end.method === IEndMethod.GET
          ? createQueryFrom(end.docs.sampleInput)
          : undefined;

      // create request url
      const requestURL = {
        raw: '{{url}}/' + end.url,
        host: ['{{url}}'],
        path: end.url.split('?')[0].split('/'),
        query: requestQuery
      };

      // create sample responses
      const loginToken = '';
      await MongoUnit.load(testData);
      const loginObj = (await LoginRepo.findByToken(
        TestDataSpec.logins[0].token
      ))!;
      const response = await end.handler(
        {
          loginToken: loginToken,
          loginObj: loginObj
        },
        end.docs.sampleInput
      );
      await MongoUnit.drop();
      const sampleResponses = [
        {
          name: end.docs.name + ' => Sample Response',
          originalRequest: {
            method: end.method,
            header: headers,
            body: requestBody,
            url: requestURL
          },
          status: HTTPStatusCodes[response.statusCode],
          code: response.statusCode,
          _postman_previewlanguage: 'json',
          header: [],
          cookie: [],
          body: JSON.stringify(response.response, null, 4)
        }
      ];

      let enumsDocumentation = '';
      if (end.docs.enums) {
        enumsDocumentation += '\n';
        for (const key of Object.keys(end.docs.enums))
          enumsDocumentation += integerEnumDocumentation(
            key,
            end.docs.enums[key]
          );
      }

      // create request object
      const endRequest = {
        name: end.docs.name.charAt(0).toUpperCase() + end.docs.name.slice(1),
        request: {
          method: end.method,
          header: headers,
          body: requestBody,
          url: requestURL,
          description: end.docs.description + enumsDocumentation
        },
        response: sampleResponses
      };
      relativePathItemObj.push(endRequest);
    }
    await fs.promises.writeFile(
      path.join(process.env.DOCS_TITLE + '.postman_collection.json'),
      JSON.stringify(collection)
    );
  } catch (e) {
    console.log(e);
    return { status: false };
  }
  await afterNow();
  return { status: true, result: collection };
}

function createQueryFrom(sampleInput: any) {
  const arr = [];
  for (const key of Object.keys(sampleInput)) {
    arr.push({
      key: key,
      value: (sampleInput[key] || '').toString()
    });
  }
  return arr;
}
