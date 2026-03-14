import type { KoaContext, Controller } from '../types';

// Import refactored controllers
import getDownloadQQMusicController from './getDownloadQQMusic';
import getHotkeyController from './getHotkey';
import getSearchByKeyController from './getSearchByKey';
import getSmartboxController from './getSmartbox';
import getSongListCategoriesController from './getSongListCategories';
import getSongListsController from './getSongLists';
import batchGetSongListsController from './batchGetSongLists';
import getSongInfoController from './getSongInfo';
import batchGetSongInfoController from './batchGetSongInfo';
import getSongListDetailController from './getSongListDetail';
import getNewDisksController from './getNewDisks';
import getMvByTagController from './getMvByTag';
import getMvController from './getMv';
import getSingerListController from './getSingerList';
import getSimilarSingerController from './getSimilarSinger';
import getSingerAlbumController from './getSingerAlbum';
import getSingerHotsongController from './getSingerHotsong';
import getSingerMvController from './getSingerMv';
import getSingerDescController from './getSingerDesc';
import getSingerStarNumController from './getSingerStarNum';
import getRadioListsController from './getRadioLists';
import getDigitalAlbumListsController from './getDigitalAlbumLists';
import getLyricController from './getLyric';
import getMusicPlayController from './getMusicPlay';
import getAlbumInfoController from './getAlbumInfo';
import getCommentsController from './getComments';
import getRecommendController from './getRecommend';
import getMvPlayController from './getMvPlay';
import getTopListsController from './getTopLists';
import getRanksController from './getRanks';
import getTicketInfoController from './getTicketInfo';
import getImageUrlController from './getImageUrl';
import getQQLoginQrController from './getQQLoginQr';
import checkQQLoginQrController from './checkQQLoginQr';
import cookiesController from './cookies';
import getUserPlaylistsController from './getUserPlaylists';
import getUserAvatarController from './getUserAvatar';
import getUserLikedSongsController from './getUserLikedSongs';
import {
  getDailyRecommendController,
  getPrivateFMController,
  getNewSongsController
} from './getDailyRecommend';
import {
  getPersonalRecommendController,
  getSimilarSongsController
} from './getPersonalRecommend';
import {
  getPlaylistTagsController,
  getPlaylistsByTagController,
  getHotCommentsController,
  getSingerListByAreaController
} from './getPlaylistTags';

// Export all controllers with consistent naming
export default {
  getCookie: cookiesController.get,
  setCookie: cookiesController.set,
  getDownloadQQMusic: getDownloadQQMusicController,
  getHotKey: getHotkeyController,
  getSearchByKey: getSearchByKeyController,
  getSmartbox: getSmartboxController,
  getSongListCategories: getSongListCategoriesController,
  getSongLists: getSongListsController,
  batchGetSongLists: batchGetSongListsController,
  getSongInfo: getSongInfoController,
  batchGetSongInfo: batchGetSongInfoController,
  getSongListDetail: getSongListDetailController,
  getNewDisks: getNewDisksController,
  getMvByTag: getMvByTagController,
  getMv: getMvController,
  getSingerList: getSingerListController,
  getSimilarSinger: getSimilarSingerController,
  getSingerAlbum: getSingerAlbumController,
  getSingerHotsong: getSingerHotsongController,
  getSingerMv: getSingerMvController,
  getSingerDesc: getSingerDescController,
  getSingerStarNum: getSingerStarNumController,
  getRadioLists: getRadioListsController,
  getDigitalAlbumLists: getDigitalAlbumListsController,
  getLyric: getLyricController,
  getMusicPlay: getMusicPlayController,
  getAlbumInfo: getAlbumInfoController,
  getComments: getCommentsController,
  getRecommend: getRecommendController,
  getMvPlay: getMvPlayController,
  getTopLists: getTopListsController,
  getRanks: getRanksController,
  getTicketInfo: getTicketInfoController,
  getImageUrl: getImageUrlController,
  getQQLoginQr: getQQLoginQrController,
  checkQQLoginQr: checkQQLoginQrController,
  getUserPlaylists: getUserPlaylistsController,
  getUserAvatar: getUserAvatarController,
  getUserLikedSongs: getUserLikedSongsController,
  getDailyRecommend: getDailyRecommendController,
  getPrivateFM: getPrivateFMController,
  getNewSongs: getNewSongsController,
  getPersonalRecommend: getPersonalRecommendController,
  getSimilarSongs: getSimilarSongsController,
  getPlaylistTags: getPlaylistTagsController,
  getPlaylistsByTag: getPlaylistsByTagController,
  getHotComments: getHotCommentsController,
  getSingerListByArea: getSingerListByAreaController
};

