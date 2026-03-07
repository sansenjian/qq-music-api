import Router from '@koa/router';
import context from './context';

const router = new Router();

router.get('/user/getCookie', context.getCookie);
router.get('/user/setCookie', context.setCookie);
router.get('/user/getUserPlaylists', context.getUserPlaylists);
router.get('/user/getUserAvatar', context.getUserAvatar);
router.get('/user/getUserLikedSongs', context.getUserLikedSongs);

router.get('/downloadQQMusic', context.getDownloadQQMusic);

router.get('/getHotkey', context.getHotKey);

router.get('/getSearchByKey/:key', context.getSearchByKey);
router.get('/getSearchByKey', context.getSearchByKey);

router.get('/getSmartbox/:key', context.getSmartbox);
router.get('/getSmartbox', context.getSmartbox);

router.get('/getSongListCategories', context.getSongListCategories);

router.get('/getSongLists/:page/:limit/:categoryId/:sortId', context.getSongLists);
router.get('/getSongLists', context.getSongLists);

router.post('/batchGetSongLists', context.batchGetSongLists);

router.get('/getSongInfo/:songmid', context.getSongInfo);
router.get('/getSongInfo', context.getSongInfo);
router.post('/batchGetSongInfo', context.batchGetSongInfo);

router.get('/getSongListDetail/:disstid', context.getSongListDetail);
router.get('/getSongListDetail', context.getSongListDetail);

router.get('/getNewDisks', context.getNewDisks);

router.get('/getMvByTag', context.getMvByTag);

router.get('/getMv', context.getMv);

router.get('/getSingerList', context.getSingerList);

router.get('/getSimilarSinger', context.getSimilarSinger);

router.get('/getSingerAlbum', context.getSingerAlbum);

router.get('/getSingerHotsong', context.getSingerHotsong);

router.get('/getSingerMv', context.getSingerMv);

router.get('/getSingerDesc', context.getSingerDesc);

router.get('/getSingerStarNum', context.getSingerStarNum);

router.get('/getRadioLists', context.getRadioLists);

router.get('/getDigitalAlbumLists', context.getDigitalAlbumLists);

router.get('/getLyric/:songmid', context.getLyric);
router.get('/getLyric', context.getLyric);

router.get('/getMusicPlay/:songmid', context.getMusicPlay);
router.get('/getMusicPlay', context.getMusicPlay);

router.get('/getAlbumInfo/:albummid', context.getAlbumInfo);
router.get('/getAlbumInfo', context.getAlbumInfo);

router.get('/getComments', context.getComments);

router.get('/getRecommend', context.getRecommend);

router.get('/getMvPlay', context.getMvPlay);

router.get('/getTopLists', context.getTopLists);

router.get('/getRanks', context.getRanks);

router.get('/getTicketInfo', context.getTicketInfo);

router.get('/getImageUrl', context.getImageUrl);

router.get('/getQQLoginQr', context.getQQLoginQr);
router.get('/user/getQQLoginQr', context.getQQLoginQr);
router.post('/checkQQLoginQr', context.checkQQLoginQr);
router.post('/user/checkQQLoginQr', context.checkQQLoginQr);

// 推荐相关
router.get('/getDailyRecommend', context.getDailyRecommend);
router.get('/getPrivateFM', context.getPrivateFM);
router.get('/getNewSongs', context.getNewSongs);
router.get('/getPersonalRecommend', context.getPersonalRecommend);
router.get('/getSimilarSongs', context.getSimilarSongs);

// 扩展功能
router.get('/getPlaylistTags', context.getPlaylistTags);
router.get('/getPlaylistsByTag', context.getPlaylistsByTag);
router.get('/getHotComments', context.getHotComments);
router.get('/getSingerListByArea', context.getSingerListByArea);

export default router;
