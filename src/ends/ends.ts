import IEnd from './IEnd';
import UserLoginEnd from './user/loginEnd.js';
import CollectibleCreateEnd from './collectible/createCollectibleEnd.js';
import UserEditProfileEnd from './user/editProfileEnd.js';
import UserGetProfileEnd from './user/getProfileEnd.js';
import UserLogoutEnd from './user/logoutEnd.js';
import UserUploadMediaEnd from './user/uploadUserMediaEnd.js';
import CollectionCreateEnd from './collection/createCollectionEnd.js';
import MediaGetEnd from './media/getMediaEnd.js';
import GetUserCollectionsEnd from './collection/getUserCollectionsEnd.js';
import CollectibleGetMintDataEnd from './collectible/getMintDataEnd.js';
import SetMintResultEnd from './collectible/setMintDataEnd.js';
import CollectibleGetSignSellOrderEnd from './collectible/getSignSellOrderDataEnd.js';
import SetSignedSellOrderEnd from './collectible/setSignedSellOrderEnd.js';
import HomeGetTrendCollectibleEnd from './pages/getHomeDataEnd.js';
import HomeGetDiscoverCollectibleEnd from './pages/getHomeDiscoveryEnd.js';
import CollectibleGetDetailEnd from './collectible/getCollectibleDetailEnd.js';
import CollectibleGetPurchaseDataEnd from './collectible/getPurchaseDataEnd.js';
import CollectibleCheckCreatedBidEnd from './collectible/getCheckCreatedBidEnd.js';
import CreateBidEnd from './collectible/createBidEnd.js';
import CollectibleGetDepositDataEnd from './collectible/getDepositBidDataEnd.js';
import CollectibleGetSignBidSignatureEnd from './collectible/getSignBidSignatureDataEnd.js';
import SetSignedBidSignatureEnd from './collectible/setSignedBidSignatureEnd.js';
import UserDashboardEnd from './user/userDashboardEnd.js';
import UserGetNotificationsEnd from './user/getNotificationsEnd.js';
import CollectibleAvailCountToTransferEnd from './collectible/getCollectibleAvailCountToTransferEnd.js';
import RemoveListFromSaleEnd from './collectible/removeListFromSaleEnd.js';
import UserLoginTextEnd from './user/createloginTextEnd.js';

const Ends: IEnd<any, any>[] = [
  UserLoginEnd,
  UserLoginTextEnd,
  UserEditProfileEnd,
  UserLogoutEnd,
  UserGetProfileEnd,
  UserUploadMediaEnd,
  UserDashboardEnd,
  UserGetNotificationsEnd,
  MediaGetEnd,
  HomeGetTrendCollectibleEnd,
  HomeGetDiscoverCollectibleEnd,
  CollectionCreateEnd,
  GetUserCollectionsEnd,
  CollectibleCreateEnd,
  CollectibleGetMintDataEnd,
  SetMintResultEnd,
  RemoveListFromSaleEnd,
  CollectibleGetSignSellOrderEnd,
  SetSignedSellOrderEnd,
  CollectibleGetDetailEnd,
  CollectibleGetPurchaseDataEnd,
  CollectibleCheckCreatedBidEnd,
  CreateBidEnd,
  CollectibleGetDepositDataEnd,
  CollectibleGetSignBidSignatureEnd,
  SetSignedBidSignatureEnd,
  CollectibleAvailCountToTransferEnd
];

export default Ends;
