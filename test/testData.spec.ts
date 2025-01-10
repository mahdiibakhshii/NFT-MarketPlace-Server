import { Types } from 'mongoose';

const USER_ID = new Types.ObjectId('6285e8b48f4c511191386002');
const USER_ID2 = new Types.ObjectId('632eba33b21da001c699dc59');
const USER_ID3 = new Types.ObjectId('6395bfa546867dd7326371fb');
const LOGIN_ID = new Types.ObjectId('6285e8b48f4c511191386003');
const COLLECTION_ID = new Types.ObjectId('6341546b39f44e2c86887afa');
const COLLECTIBLE_ID = new Types.ObjectId('634154c939f44e2c86887b02');
const COLLECTIBLE_ID2 = new Types.ObjectId('63c2722c95fa2b750ca4109a');
const COLLECTIBLE_ID3 = new Types.ObjectId('63b91abadf9c7aa19941fc7b');
const COLLECTIBLE_ID4 = new Types.ObjectId('63b91a85df9c7aa19941fc6c');
const MEDIA_ID = new Types.ObjectId('6395bfc98cc211211b6954c7');
const MEDIA_ID2 = new Types.ObjectId('63b3e39f1ff6945e51aa5415');
const BID_ID = new Types.ObjectId('63b91be9c58c670bd56e16e4');
const BID_ID2 = new Types.ObjectId('63b91c33c58c670bd56e17e4');
const LIST_ID = new Types.ObjectId('63b3e46722907f142e33c804');
const LIST_ID2 = new Types.ObjectId('63b91aefdf9c7aa19941fcb0');
export default {
  users: [
    {
      _id: USER_ID,
      accountID: '0xC27BfE41F1fFbC3F5E6f6a3971e426DF7D484CaF',
      isVerified: true,
      socialMedia: []
    },
    {
      _id: USER_ID2,
      accountID: '0xea2D21dbDd4B96DC07CeB4539390f0D4cb9490F0',
      isVerified: true,
      socialMedia: []
    },
    {
      _id: USER_ID3,
      accountID: '0x915b3d3e1d612c23834c678abf35f30fa757eb04',
      isVerified: true,
      socialMedia: []
    }
  ],
  logins: [
    {
      _id: LOGIN_ID,
      user: USER_ID,
      token: 'my_test_token',
      message:
        'I want to login on company at 2023-01-07T07:11:12.504Z with nonce:13273.I accept the company Terms of Service and I am at least 13 years old.',
      status: 1,
      expireAt: new Date(9051731433909),
      createdAt: new Date(1651731433909),
      updatedAt: new Date(1651731433909),
      __v: 0
    }
  ],
  collections: [
    {
      _id: COLLECTION_ID,
      creator: USER_ID,
      title: 'test collection',
      description: 'test description',
      color: 'black',
      tokensCount: 0,
      contractAddress: '0x8dd3460B035D54bb5F07aAF91dafvfcE0adsdbsdc1',
      contractIndex: 1,
      expireAt: new Date(9051731433909),
      createdAt: new Date(1651731433909),
      updatedAt: new Date(1651731433909),
      __v: 0
    }
  ],
  collectibles: [
    {
      _id: COLLECTIBLE_ID,
      creator: USER_ID,
      owners: [
        { owner: USER_ID, count: 80 },
        { owner: USER_ID2, count: 20 }
      ],
      collectionID: COLLECTION_ID,
      name: 'nft name',
      description: 'nft description',
      royalty: 10,
      sellMethod: 1,
      sellPrice: 100,
      imageLocal: MEDIA_ID2,
      imageHash: '8510dda740e780e5a0ac7f71c38099f0b8b0f1456f435bbf',
      ipfsURI: 'bafkreiazabb52v3k2nhrb5qde6gylapf6vcknjycvybmirxscpgvbbrwcq',
      isLock: false,
      tokenID: 1,
      volume: 100,
      soldItem: 0,
      state: 1,
      property: [],
      expireAt: new Date(9051731433909),
      createdAt: new Date(1651731433909),
      updatedAt: new Date(1651731433909),
      __v: 0
    },
    {
      _id: COLLECTIBLE_ID2,
      creator: USER_ID,
      owners: [{ owner: USER_ID, count: 100 }],
      collectionID: COLLECTION_ID,
      name: 'nft name 2',
      description: 'nft description 2',
      royalty: 10,
      sellMethod: 1,
      sellPrice: 100,
      imageLocal: MEDIA_ID2,
      imageHash: '8510dda740e780e5a0ac7f71c38099f0b8b0f1456f435bbf',
      ipfsURI: 'bafkreiazabb52v3k2nhrb5qde6gylapf6vcknjycvybmirxscpgvbbrwcq',
      isLock: false,
      tokenID: 1,
      volume: 100,
      soldItem: 0,
      state: 0,
      property: [],
      expireAt: new Date(9051731433909),
      createdAt: new Date(1651731433909),
      updatedAt: new Date(1651731433909),
      __v: 0
    },
    {
      _id: COLLECTIBLE_ID3,
      creator: USER_ID,
      owners: [{ owner: USER_ID, count: 100 }],
      collectionID: COLLECTION_ID,
      name: 'nft name 3',
      description: 'nft description 3',
      royalty: 10,
      sellMethod: 1,
      sellPrice: 100,
      imageLocal: MEDIA_ID2,
      imageHash: '8510dda740e780e5a0ac7f71c38099f0b8b0f1456f435bbf',
      ipfsURI: 'bafkreiazabb52v3k2nhrb5qde6gylapf6vcknjycvybmirxscpgvbbrwcq',
      isLock: false,
      tokenID: 1,
      volume: 100,
      soldItem: 0,
      state: 1,
      property: [],
      expireAt: new Date(9051731433909),
      createdAt: new Date(1651731433909),
      updatedAt: new Date(1651731433909),
      __v: 0
    },
    {
      _id: COLLECTIBLE_ID4,
      creator: USER_ID,
      owners: [{ owner: USER_ID, count: 100 }],
      collectionID: COLLECTION_ID,
      name: 'nft name 4',
      description: 'nft description 4',
      royalty: 10,
      sellMethod: 1,
      sellPrice: 100,
      imageLocal: MEDIA_ID2,
      imageHash: '8510dda740e780e5a0ac7f71c38099f0b8b0f1456f435bbf',
      ipfsURI: 'bafkreiazabb52v3k2nhrb5qde6gylapf6vcknjycvybmirxscpgvbbrwcq',
      isLock: false,
      tokenID: 1,
      volume: 100,
      soldItem: 0,
      state: 0,
      property: [],
      expireAt: new Date(9051731433909),
      createdAt: new Date(1651731433909),
      updatedAt: new Date(1651731433909),
      __v: 0
    }
  ],
  media: [
    {
      _id: MEDIA_ID,
      name: 'sample.jpg',
      type: 0,
      mimeType: 'image/jpeg',
      foreignType: 0,
      foreignId: USER_ID,
      url: 'userProfile/image/23ea0950463e62bd43e0301b8b8cc096.jpeg',
      md5: '5b72cb69798743a6c28f5cd701a40cbe',
      size: 7918,
      hash: '253566f4d9fd70e8729246908b8b35faaab6d6970d291b21',
      status: 1,
      i: {
        w: 255,
        h: 255
      },
      createdAt: new Date(1651731433909),
      updatedAt: new Date(1651731433909),
      __v: 0
    },
    {
      _id: MEDIA_ID2,
      name: 'sample2.jpg',
      type: 0,
      mimeType: 'image/jpeg',
      foreignType: 2,
      foreignId: USER_ID,
      url: 'collectibleImage/image/0ae4d725258f73b870e09a6d187866f4.jpeg',
      md5: 'e2b2cf559af0b677a5bc4450be81dbde',
      size: 7204,
      hash: '8510dda740e780e5a0ac7f71c38099f0b8b0f1456f435bbf',
      status: 1,
      i: {
        w: 255,
        h: 255
      },
      createdAt: new Date(1651731433909),
      updatedAt: new Date(1651731433909),
      __v: 0
    }
  ],
  listonsales: [
    {
      _id: LIST_ID,
      collectible: COLLECTIBLE_ID,
      seller: USER_ID,
      type: 1,
      signature:
        '0xa86b66870311a160ecb97ebb3cfbb168966b066ff4e8baa905ab829ec52e561510bdfbda83e74a6c962bfebc5e7998c5ab94b1c70ece230f8124a8d0b1f9ad301b',
      price: 0.01,
      amount: 80,
      fixedAmount: 80,
      state: 1,
      createdAT: new Date(1651731433909),
      expireAt: new Date(9651831433909)
    },
    {
      _id: LIST_ID2,
      collectible: COLLECTIBLE_ID,
      seller: USER_ID2,
      type: 0,
      signature:
        '0xb45c8b4056f4a3d528326076f49ea890cd301d513d129d6cf79f02ce4d6f31801fea35687f382ca50e9a74503c9374974c1472e8b45f09f9e18ab8192a99be131b',
      price: 0.01,
      amount: 20,
      fixedAmount: 20,
      state: 0,
      createdAT: new Date(1651731433909),
      expireAt: new Date(9651831433909)
    }
  ],
  bids: [
    {
      _id: BID_ID,
      auction: LIST_ID2,
      bidder: USER_ID,
      collectible: COLLECTIBLE_ID,
      price: 0.02,
      state: 0,
      dipositedAt: new Date(1651731433909),
      signature:
        '0x0afba002bd5def653d4ebc024e6451d9f6bed220cdfdba1d6eead180bde18dc13bb983b90961deeb29ae86cdae9ba7c76a33482ef72c129ba79e0ed200a787331b'
    },
    {
      _id: BID_ID2,
      auction: LIST_ID2,
      bidder: USER_ID,
      collectible: COLLECTIBLE_ID,
      price: 0.03,
      state: 1,
      dipositedAt: new Date(1651731433909),
      signature:
        '0x0afba002bd5def653d4ebc024e6451d9f6bed220cdfdba1d6eead180bde18dc13bb983b90961deeb29ae86cdae9ba7c76a33482ef72c129ba79e0ed200a787331b'
    }
  ]
};
