const Router = require('@koa/router');
const router = new Router();
const context = require('./context');

// cookies
router.get('/user/getCookie', context.getCookie);
router.get('/user/setCookie', context.setCookie);

// downloadQQMusic
router.get('/downloadQQMusic', context.getDownloadQQMusic);

router.get('/getHotkey', context.getHotKey);

// @deprecated Use query params instead: /getSearchByKey?key=xxx
router.get('/getSearchByKey/:key', context.getSearchByKey);
router.get('/getSearchByKey', context.getSearchByKey);

// search smartbox
// @deprecated Use query params instead: /getSmartbox?id=xxx
router.get('/getSmartbox/:id', context.getSmartbox);
router.get('/getSmartbox', context.getSmartbox);

// 1
router.get('/getSongListCategories', context.getSongListCategories);

// @deprecated Use query params instead: /getSongLists?id=xxx
router.get('/getSongLists/:id', context.getSongLists);
router.get('/getSongLists', context.getSongLists);

router.post('/batchGetSongLists', context.batchGetSongLists);

// getSongInfo
router.get('/getSongInfo', context.getSongInfo);
router.post('/batchGetSongInfo', context.batchGetSongInfo);

// 4
// disstid=7011264340
// @deprecated Use query params instead: /getSongListDetail?disstid=xxx
router.get('/getSongListDetail/:disstid', context.getSongListDetail);
router.get('/getSongListDetail', context.getSongListDetail);

// newDisk
router.get('/getNewDisks', context.getNewDisks);

// getMvByTag
router.get('/getMvByTag', context.getMvByTag);

// MV
// area_id=15&version_id=7
router.get('/getMv', context.getMv);

// getSingerList
router.get('/getSingerList', context.getSingerList);

// getSimilarSinger
// singermid=0025NhlN2yWrP4
router.get('/getSimilarSinger', context.getSimilarSinger);

// getSingerAlbum
// singermid=0025NhlN2yWrP4
router.get('/getSingerAlbum', context.getSingerAlbum);

router.get('/getSingerHotsong', context.getSingerHotsong);

/**
 * @description: getSingerMv
 * @param order: time(fan upload) || listen(singer all)
 */
router.get('/getSingerMv', context.getSingerMv);

router.get('/getSingerDesc', context.getSingerDesc);

router.get('/getSingerStarNum', context.getSingerStarNum);

// radio
router.get('/getRadioLists', context.getRadioLists);

// DigitalAlbum
router.get('/getDigitalAlbumLists', context.getDigitalAlbumLists);

// music
// getLyric
// songmid=003rJSwm3TechU
// @deprecated Use query params instead: /getLyric?songmid=xxx
router.get('/getLyric/:songmid', context.getLyric);
router.get('/getLyric', context.getLyric);

// songmid=003rJSwm3TechU
// @deprecated Use query params instead: /getMusicPlay?songmid=xxx
router.get('/getMusicPlay/:songmid', context.getMusicPlay);
router.get('/getMusicPlay', context.getMusicPlay);

// album
// albummid=0016l2F430zMux
// @deprecated Use query params instead: /getAlbumInfo?albummid=xxx
router.get('/getAlbumInfo/:albummid', context.getAlbumInfo);
router.get('/getAlbumInfo', context.getAlbumInfo);

router.get('/getComments', context.getComments);

// recommend
router.get('/getRecommend', context.getRecommend);

// mv play
router.get('/getMvPlay', context.getMvPlay);

// rankList: getTopLists
router.get('/getTopLists', context.getTopLists);

// ranks
router.get('/getRanks', context.getRanks);

// ticket
router.get('/getTicketInfo', context.getTicketInfo);

// getImageUrl
router.get('/getImageUrl', context.getImageUrl);

// getQQLoginQr
router.get('/getQQLoginQr', context.getQQLoginQr);
// @deprecated Use /getQQLoginQr instead
router.get('/user/getQQLoginQr', context.getQQLoginQr);
router.post('/checkQQLoginQr', context.checkQQLoginQr);
// @deprecated Use POST /checkQQLoginQr instead
router.post('/user/checkQQLoginQr', context.checkQQLoginQr);

module.exports = router;
