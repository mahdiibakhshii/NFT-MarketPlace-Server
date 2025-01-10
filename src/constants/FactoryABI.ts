export const FactoryAbi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'tokenContract',
        type: 'address'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'uint16',
        name: 'royaltyPercentage',
        type: 'uint16'
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'owner',
        type: 'address'
      }
    ],
    name: 'CollectibleMinted',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'collecionAdress',
        type: 'address'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'collectionIndex',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'itemId',
        type: 'string'
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'owner',
        type: 'address'
      }
    ],
    name: 'CollectionCreated',
    type: 'event'
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'collectionTokens',
    outputs: [
      {
        internalType: 'contract companyCollection',
        name: '',
        type: 'address'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'string', name: '_collectionName', type: 'string' },
      { internalType: 'string', name: '_collectionUri', type: 'string' },
      { internalType: 'string', name: '_symbol', type: 'string' },
      { internalType: 'string', name: '_id', type: 'string' },
      { internalType: 'address', name: '_traderContract', type: 'address' }
    ],
    name: 'deployCollection',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_index', type: 'uint256' },
      { internalType: 'uint256', name: '_id', type: 'uint256' }
    ],
    name: 'getERC1155byIndexAndId',
    outputs: [
      { internalType: 'address', name: '_contract', type: 'address' },
      { internalType: 'address', name: '_owner', type: 'address' },
      { internalType: 'string', name: '_uri', type: 'string' },
      { internalType: 'uint256', name: 'supply', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'indexToContract',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'indexToOwner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_index', type: 'uint256' },
      { internalType: 'uint256', name: 'id', type: 'uint256' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
      { internalType: 'string', name: 'name', type: 'string' },
      { internalType: 'string', name: '_collectionUri', type: 'string' },
      { internalType: 'uint16', name: 'royaltyPercentage', type: 'uint16' }
    ],
    name: 'mintCollectible',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  }
];
