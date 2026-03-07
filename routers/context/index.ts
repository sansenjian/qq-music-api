import { KoaContext, Controller } from '../types';

const req = (id: string): any => {
  const mod = require(id);
  return mod && mod.default ? mod.default : mod;
};

const getDownloadQQMusic: Controller = req('./getDownloadQQMusic');
const getHotKey: Controller = req('./getHotkey');
const getSearchByKey: Controller = req('./getSearchByKey');
const getSmartbox: Controller = req('./getSmartbox');
const getSongListCategories: Controller = req('./getSongListCategories');
const getSongLists: Controller = req('./getSongLists');
const batchGetSongLists: Controller = req('./batchGetSongLists');
const getSongInfo: Controller = req('./getSongInfo');
const batchGetSongInfo: Controller = req('./batchGetSongInfo');
const getSongListDetail: Controller = req('./getSongListDetail');
const getNewDisks: Controller = req('./getNewDisks');
const getMvByTag: Controller = req('./getMvByTag');
const getMv: Controller = req('./getMv');
const getSingerList: Controller = req('./getSingerList');
const getSimilarSinger: Controller = req('./getSimilarSinger');
const { getPlaylistTags, getPlaylistsByTag, getHotComments, getSingerListByArea } = req('./getPlaylistTags');
const getSingerAlbum: Controller = req('./getSingerAlbum');
const getSingerHotsong: Controller = req('./getSingerHotsong');
const getSingerMv: Controller = req('./getSingerMv');
const getSingerDesc: Controller = req('./getSingerDesc');
const getSingerStarNum: Controller = req('./getSingerStarNum');
const getRadioLists: Controller = req('./getRadioLists');
const getDigitalAlbumLists: Controller = req('./getDigitalAlbumLists');
const getLyric: Controller = req('./getLyric');
const getMusicPlay: Controller = req('./getMusicPlay');
const getAlbumInfo: Controller = req('./getAlbumInfo');
const getComments: Controller = req('./getComments');
const getRecommend: Controller = req('./getRecommend');
const getMvPlay: Controller = req('./getMvPlay');
const getTopLists: Controller = req('./getTopLists');
const getRanks: Controller = req('./getRanks');
const getTicketInfo: Controller = req('./getTicketInfo');
const getImageUrl: Controller = req('./getImageUrl');
const getQQLoginQr: Controller = req('./getQQLoginQr');
const checkQQLoginQr: Controller = req('./checkQQLoginQr');
const { get: getCookie, set: setCookie } = req('./cookies');
const getUserPlaylists: Controller = req('./getUserPlaylists');
const getUserAvatar: Controller = req('./getUserAvatar');
const getUserLikedSongs: Controller = req('./getUserLikedSongs');

export default {
  getCookie,
  setCookie,
  getDownloadQQMusic,
  getHotKey,
  getSearchByKey,
  getSmartbox,
  getSongListCategories,
  getSongLists,
  batchGetSongLists,
  getSongInfo,
  batchGetSongInfo,
  getSongListDetail,
  getNewDisks,
  getMvByTag,
  getMv,
  getSingerList,
  getSingerListByArea,
  getSimilarSinger,
  getPlaylistTags,
  getPlaylistsByTag,
  getHotComments,
  getSingerAlbum,
  getSingerHotsong,
  getSingerMv,
  getSingerDesc,
  getSingerStarNum,
  getRadioLists,
  getDigitalAlbumLists,
  getLyric,
  getMusicPlay,
  getAlbumInfo,
  getComments,
  getRecommend,
  getMvPlay,
  getTopLists,
  getRanks,
  getTicketInfo,
  getImageUrl,
  getQQLoginQr,
  checkQQLoginQr,
  getUserPlaylists,
  getUserAvatar,
  getUserLikedSongs
};
