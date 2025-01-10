import MongoUnit from 'mongo-unit';
import { expect } from 'chai';
import testData from '../../../test/testData.spec.js';
import TestDataSpec from '../../../test/testData.spec.js';
import UserRepo from './userRepo.js';
import { IUserProps } from '../../models/user.js';

describe('userRepo', function () {
  beforeEach(() => {
    MongoUnit.load(testData);
  });
  afterEach(() => MongoUnit.drop());

  it('find a user by account id; valid account id', async function () {
    const user = await UserRepo.findByAccountID(
      TestDataSpec.users[0].accountID,
      IUserProps.self
    );
    expect(user).exist;
    expect(user?._id?.toString()).equal(TestDataSpec.users[0]._id.toString());
  });

  it('find a user by account id; invalid account id', async function () {
    const user = await UserRepo.findByAccountID('-', IUserProps.self);
    expect(user).not.exist;
  });
});
