import cluster from 'cluster';
import moment from 'moment';
import Web3WsProvider from 'web3-providers-ws';
import ethers, { BigNumber, BigNumberish, Wallet } from 'ethers';
import { hashMessage } from 'ethers/lib/utils.js';
import IService from '../IService';
import { FactoryAbi } from '../../constants/FactoryABI.js';
import { ObjectIDType } from '../../helpers/aliases.js';
import { ICollection } from '../../models/collection.js';
import { TraderAbi } from '../../constants/TraderABI.js';
import { createSellReceiptLogic } from '../../logic/collectible/createSellReceiptLogic.js';
import { setCollectionDeployedDataLogic } from '../../logic/collection/setCollectionDeployedDataLogic.js';
import ContractLoggerRepo from '../../repos/contractLoggerRepo.js';
import { IContractLoggerType } from '../../models/contractLogger.js';
import { depositBidLogic } from '../../logic/bid/depositBidLogic.js';
import { activeAuctionLogic } from '../../logic/listOnSale/activeAuctionLogic.js';
import { withdrawBidLogic } from '../../logic/bid/withdrawBidLogic.js';
import { finishAuctionLogic } from '../../logic/listOnSale/finishAuctionLogic.js';
import { sellReceiptTypeEnum } from '../../models/sellReceipt.js';
import { burnCollectibleLogic } from '../../logic/collectible/burnCollectibleLogic.js';
import NotificationRepo from '../../repos/notificationRepo.js';
import CollectionRepo from '../../repos/collectionRepo.js';
import CollectibleRepo from '../../repos/collectibleRepo.js';
import UserRepo from '../../repos/user/userRepo.js';
import { IUserProps } from '../../models/user.js';
import { notificationTypeEnum } from '../../models/notification.js';
import finishAuctionJob from '../../../src/jobs/finishAuctionJob.js';

interface IProviderService extends IService {
  provider: any;
  factoryInstance: any;
  traderInstance: any;
  lastUpNum: number;
  pingTimeout: any;
  keepAliveInterval: any;
  getGasPrice: () => Promise<BigNumberish>;
  getWallet: (privateKey: string) => Promise<Wallet>;
  getChain: (_provider: any) => Promise<number>;
  getNonce: (signer: any) => Promise<void>;
  createCollection: (
    collectionName: string,
    collectionURI: string,
    collectionSymbol: string,
    collectionLocalId: string
  ) => Promise<void | undefined>;
  sendFinishAuction: (
    contractAddress: string,
    tokenID: number,
    auctionNum: number,
    signature: string,
    companyWallet: string,
    serviceFee: number
  ) => Promise<any>;
  verifySignature(message: string, signature: string, signer: string): boolean;
}
const ProviderService: IProviderService = {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  provider: undefined,
  factoryInstance: undefined,
  traderInstance: undefined,
  lastUpNum: 0,
  pingTimeout: null,
  keepAliveInterval: null,
  start: async function () {
    const QUICKNODE_WSS_ENDPOINT = process.env.QUICKNODE_WSS_ENDPOINT;
    const provider = new ethers.providers.Web3Provider(
      new (Web3WsProvider as any)(QUICKNODE_WSS_ENDPOINT, {
        clientConfig: { keepalive: true, keepaliveInterval: 3600000 },
        reconnect: {
          auto: true,
          delay: 1000,
          maxAttempts: 5,
          onTimeout: false
        }
      }),
      'any'
    );

    this.provider = provider;
    const factoryAddress = process.env.FACTORY_ADDRESS;
    const traderAddress = process.env.TRADER_ADDRESS;
    if (!factoryAddress) {
      throw 'check factoryAddress at .env';
    }
    if (!traderAddress) {
      //TODO: Error handling
      throw 'check traderAddress at .env';
    }
    const factoryInstance = new ethers.Contract(
      factoryAddress,
      FactoryAbi,
      provider
    );
    this.factoryInstance = factoryInstance;
    const traderInstance = new ethers.Contract(
      traderAddress,
      TraderAbi,
      provider
    );
    this.traderInstance = traderInstance;
    if (cluster.worker!.id === 1) {
      finishAuctionJob();
      this.traderInstance.on(
        'CollectiblePurchased',
        async (
          buyerAddress: string,
          sellerAddress: string,
          collecionAddress: string,
          tokenId: number,
          price: BigNumber,
          amount: number,
          receiver: string,
          royaltyAmount: BigNumber,
          opNum: BigNumber
        ) => {
          console.log('!!!CollectiblePurchased event!!!');
          const logger = await ContractLoggerRepo.findByopNum(opNum.toNumber());
          if (logger) {
            console.log('duplicate logger opNum:', opNum.toNumber());
            return;
          }
          await ContractLoggerRepo.create({
            opNum: opNum.toNumber(),
            type: IContractLoggerType.collectiblePurchased
          });
          await createSellReceiptLogic({
            buyer: buyerAddress,
            seller: sellerAddress,
            collectionAddress: collecionAddress,
            tokenID: tokenId,
            sellPrice: parseFloat(ethers.utils.formatEther(price)),
            amount: amount,
            type: sellReceiptTypeEnum.forInstant,
            royaltyAddress: receiver,
            royaltyAmount: parseFloat(ethers.utils.formatEther(royaltyAmount))
          });
        }
      );
      this.traderInstance.on(
        'AuctionStarted',
        async (
          collectionAddress: string,
          tokenId: number,
          auctionNum: number,
          auctioneer: string,
          opNum: BigNumber
        ) => {
          console.log('!!!AuctionStarted event!!!');
          const logger = await ContractLoggerRepo.findByopNum(opNum.toNumber());
          if (logger) {
            console.log(
              'duplicate logger opNum in AuctionStarted:',
              opNum.toNumber()
            );
            return;
          }
          await ContractLoggerRepo.create({
            opNum: opNum.toNumber(),
            type: IContractLoggerType.auctionStarted
          });
          await activeAuctionLogic({
            collectionAddress: collectionAddress,
            tokenID: tokenId,
            auctionNum: auctionNum,
            auctioneer: auctioneer
          });
        }
      );
      this.traderInstance.on(
        'BidCreated',
        async (
          collectionAddress: string,
          tokenId: number,
          auctionNum: number,
          bidder: string,
          seller: string,
          bidAmount: BigNumber,
          opNum: BigNumber
        ) => {
          console.log('!!!BidCreated event!!!');
          const logger = await ContractLoggerRepo.findByopNum(opNum.toNumber());
          if (logger) {
            console.log(
              'duplicate logger opNum in BidCreated:',
              opNum.toNumber()
            );
            return;
          }
          await ContractLoggerRepo.create({
            opNum: opNum.toNumber(),
            type: IContractLoggerType.auctionStarted
          });
          await depositBidLogic({
            collectionAddress: collectionAddress,
            tokenID: tokenId,
            auctionNum: auctionNum,
            bidder: bidder,
            seller: seller,
            bidAmount: parseFloat(ethers.utils.formatEther(bidAmount))
          });
        }
      );
      this.traderInstance.on(
        'BidWithdraw',
        async (
          collectionAddress: string,
          tokenId: number,
          auctionNum: number,
          bidder: string,
          seller: string,
          amount: BigNumber,
          newBidder: string,
          opNum: BigNumber
        ) => {
          console.log('!!!BidWithdraw event!!!');
          const logger = await ContractLoggerRepo.findByopNum(opNum.toNumber());
          if (logger) {
            console.log(
              'duplicate logger opNum in BidWithdraw:',
              opNum.toNumber()
            );
            return;
          }
          await ContractLoggerRepo.create({
            opNum: opNum.toNumber(),
            type: IContractLoggerType.BidWithdraw
          });
          await withdrawBidLogic({
            collectionAddress: collectionAddress,
            tokenID: tokenId,
            auctionNum: auctionNum,
            bidder: bidder,
            amount: parseFloat(ethers.utils.formatEther(amount)),
            seller: seller
          });
        }
      );
      this.traderInstance.on(
        'AuctionFinished',
        async (
          collectionAddress: string,
          tokenId: number,
          auctionNum: number,
          auctioneer: string,
          opNum: BigNumber
        ) => {
          console.log('!!!AuctionFinished event!!!');
          const logger = await ContractLoggerRepo.findByopNum(opNum.toNumber());
          if (logger) {
            console.log(
              'duplicate logger opNum in finishAuction:',
              opNum.toNumber()
            );
            return;
          }
          await ContractLoggerRepo.create({
            opNum: opNum.toNumber(),
            type: IContractLoggerType.auctionFinished
          });
          await finishAuctionLogic({
            collectionAddress: collectionAddress,
            tokenID: tokenId,
            auctionNum: auctionNum,
            auctioneer: auctioneer
          });
        }
      );
      this.traderInstance.on(
        'AuctionTransferToken',
        async (
          collectionAddress: string,
          tokenId: number,
          auctionNum: number,
          prevOwner: string,
          price: BigNumber,
          amount: number,
          newOwner: string,
          opNum: BigNumber
        ) => {
          console.log('!!!AuctionTransferToken event!!!');
          const logger = await ContractLoggerRepo.findByopNum(opNum.toNumber());
          if (logger) {
            console.log(
              'duplicate logger opNum in AuctionTransferToken:',
              opNum.toNumber()
            );
            return;
          }
          await ContractLoggerRepo.create({
            opNum: opNum.toNumber(),
            type: IContractLoggerType.auctionFinished
          });
          const sellResult = await createSellReceiptLogic({
            buyer: newOwner,
            seller: prevOwner,
            collectionAddress: collectionAddress,
            tokenID: tokenId,
            auctionNum: auctionNum,
            sellPrice: parseFloat(ethers.utils.formatEther(price)),
            amount: amount,
            type: sellReceiptTypeEnum.forAuction,
            royaltyAddress: undefined,
            royaltyAmount: undefined
          });
          console.log({ sellResult });
        }
      );
      this.traderInstance.on(
        'AuctionWithdrawServiceFee',
        async (
          collectionAddress: string,
          tokenId: number,
          auctionNum: number,
          owner: string,
          amount: BigNumber,
          companyWallet: string,
          opNum: BigNumber
        ) => {
          const logger = await ContractLoggerRepo.findByopNum(opNum.toNumber());
          if (logger) {
            console.log(
              'duplicate logger opNum in AuctionTransferToken: ',
              opNum.toNumber()
            );
            return;
          }
          await ContractLoggerRepo.create({
            opNum: opNum.toNumber(),
            type: IContractLoggerType.auctionFinished
          });
          const sellResult = await createSellReceiptLogic({
            buyer: companyWallet,
            seller: owner,
            collectionAddress: collectionAddress,
            tokenID: tokenId,
            auctionNum: auctionNum,
            sellPrice: parseFloat(ethers.utils.formatEther(amount)),
            amount: 0,
            type: sellReceiptTypeEnum.forServiceFee,
            royaltyAddress: undefined,
            royaltyAmount: undefined
          });
          console.log({ sellResult });
        }
      );
      this.traderInstance.on(
        'TokenTransferedByOwner',
        async (
          destAddress: string,
          ownerAddress: string,
          collectionAddress: string,
          tokenId: number,
          amount: number,
          opNum: BigNumber
        ) => {
          const logger = await ContractLoggerRepo.findByopNum(opNum.toNumber());
          if (logger) {
            console.log(
              'duplicate logger opNum in TokenTransferedByOwner: ',
              opNum.toNumber()
            );
            return;
          }
          await ContractLoggerRepo.create({
            opNum: opNum.toNumber(),
            type: IContractLoggerType.auctionFinished
          });
          await createSellReceiptLogic({
            buyer: destAddress,
            seller: ownerAddress,
            collectionAddress: collectionAddress,
            tokenID: tokenId,
            sellPrice: 0,
            amount: amount,
            type: sellReceiptTypeEnum.forTransferByOwner,
            royaltyAddress: undefined,
            royaltyAmount: undefined
          });
        }
      );
      this.traderInstance.on(
        'TokenBurnedByOwner',
        async (
          ownerAddress: string,
          collectionAddress: string,
          tokenId: number,
          amount: number,
          opNum: BigNumber
        ) => {
          const logger = await ContractLoggerRepo.findByopNum(opNum.toNumber());
          if (logger) {
            console.log(
              'duplicate logger opNum in TokenTransferedByOwner: ',
              opNum.toNumber()
            );
            return;
          }
          await ContractLoggerRepo.create({
            opNum: opNum.toNumber(),
            type: IContractLoggerType.auctionFinished
          });
          await burnCollectibleLogic({
            owner: ownerAddress,
            collectionAddress: collectionAddress,
            tokenID: tokenId,
            amount: amount
          });
        }
      );
      this.traderInstance.on(
        'RoyaltyTransfered',
        async (
          collectionAddress: string,
          tokenId: number,
          seller: string,
          buyer: string,
          amount: BigNumber,
          copies: number,
          opNum: BigNumber
        ) => {
          //TODO:seller should be changed to receiver / buyer to seller
          //TODO: move this logic to a logic file, not here!
          const logger = await ContractLoggerRepo.findByopNum(opNum.toNumber());
          if (logger) {
            console.log(
              'duplicate logger opNum in royaltyTransfered: ',
              opNum.toNumber()
            );
            return;
          }
          await ContractLoggerRepo.create({
            opNum: opNum.toNumber(),
            type: IContractLoggerType.royaltyTransfered
          });
          //fetch collection
          const collectionObj = await CollectionRepo.getByContractAddress(
            collectionAddress
          );
          if (!collectionObj) return;
          const collectibleObj =
            await CollectibleRepo.getByCollectionIDandTokenID(
              collectionObj._id!,
              tokenId
            );
          if (!collectibleObj) return;
          const receiverObj = await UserRepo.findByAccountID(
            seller,
            IUserProps.idOnly
          );
          if (!receiverObj) return;
          const buyerObj = await UserRepo.findByAccountID(
            buyer,
            IUserProps.idOnly
          );
          if (!buyerObj) return;
          await NotificationRepo.createNotification({
            collectible: collectibleObj._id,
            user: receiverObj._id,
            secondUser: buyerObj._id,
            amount: parseFloat(ethers.utils.formatEther(amount)),
            type: notificationTypeEnum.royalityTransfered,
            issueDate: moment().toDate()
          });
        }
      );
    }
    this.factoryInstance.on(
      'CollectionCreated',
      async (
        collectionAddress: string,
        collectionIndex: BigNumber,
        collectionLocalId: ObjectIDType<ICollection>,
        owner: string
      ) => {
        console.log('in the collection created event');
        try {
          await setCollectionDeployedDataLogic({
            collectionID: collectionLocalId,
            collectionAddress: collectionAddress,
            collectionIndex: collectionIndex.toNumber()
          });
        } catch (e) {
          console.log(e);
        }
      }
    );
  },
  sendFinishAuction: async function (
    contractAddress: string,
    tokenID: number,
    auctionNum: number,
    signature: string,
    companyWallet: string,
    serviceFee: number
  ) {
    const wallet = await this.getWallet(process.env.WALLET_SECRET!);
    const nonce = await this.getNonce(wallet);
    const gasFee = await this.getGasPrice();
    const rawTxn = await this.traderInstance.populateTransaction.finishAuction(
      contractAddress,
      tokenID,
      auctionNum,
      signature,
      companyWallet,
      serviceFee,
      { gasPrice: gasFee, nonce: nonce }
    );
    (await wallet).sendTransaction(rawTxn);
  },
  stop: async function () {
    return;
  },
  verifySignature(message: string, signature: string, signer: string) {
    const verifySigner = ethers.utils.recoverAddress(
      hashMessage(message),
      signature
    );
    return verifySigner.toUpperCase() === signer.toUpperCase();
  },
  getGasPrice: async function () {
    const feeData = await this.provider.getFeeData();
    return feeData.gasPrice;
  },
  getWallet: async function (privateKey: string) {
    const wallet = await new ethers.Wallet(privateKey, this.provider);
    return wallet;
  },
  getChain: async function (_provider: any) {
    const chainId = await _provider.getNetwork();
    return chainId.chainId;
  },
  getNonce: async function (signer: any) {
    return (await signer).getTransactionCount();
  },
  createCollection: async function (
    collectionName: string,
    collectionURI: string,
    collectionSymbol: string,
    collectionLocalId: string
  ) {
    try {
      if ((await this.getChain(this.provider)) === 80001) {
        const wallet = this.getWallet(process.env.WALLET_SECRET!);
        const nonce = await this.getNonce(wallet);
        const gasFee = await this.getGasPrice();
        const rawTxn =
          await this.factoryInstance.populateTransaction.deployCollection(
            collectionName,
            collectionURI,
            collectionSymbol,
            collectionLocalId,
            {
              gasPrice: gasFee,
              nonce: nonce
            }
          );
        (await wallet).sendTransaction(rawTxn);
        return;
      } else {
        console.log('Wrong network - Connect to configured chain ID first!');
      }
    } catch (e) {
      console.log('Error Caught in Catch Statement: ', e);
    }
    return;
  }
};

export default ProviderService;
