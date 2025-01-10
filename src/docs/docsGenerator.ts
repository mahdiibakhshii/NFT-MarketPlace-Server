import { generatePostmanCollection } from './postmanCollectionGenerator.js';
import axios from 'axios';

generatePostmanCollection().then(({ status, result }) => {
  if (!status) return console.log('Postman collection creation failed!');

  console.log('Postman collection file created.');

  if (
    process.env.POSTMAN_API_KEY &&
    process.env.POSTMAN_COLLECTION_ID &&
    process.env.POSTMAN_COLLECTION_POSTMAN_ID
  ) {
    console.log('Updating postman collection on the clouds...');
    axios
      .put(
        'https://api.getpostman.com/collections/' +
          process.env.POSTMAN_COLLECTION_ID,
        {
          collection: result
        },
        {
          headers: {
            'X-Api-Key': process.env.POSTMAN_API_KEY
          }
        }
      )
      .then((res) => {
        console.log(`statusCode: ${res.status}`);
        console.log('Mission Accomplished!');
      })
      .catch((error) => {
        console.error(error);
        console.error(error?.response?.data?.error);
        console.log('Update failed!');
      });
  } else
    console.log(
      "Prepare your postman colleciton's environment data, to auto update it on the clouds!"
    );
});
