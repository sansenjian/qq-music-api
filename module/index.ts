import downloadQQMusic from './apis/downloadQQMusic';
// search
import getHotKey from './apis/search/getHotKey';
import getSearchByKey from './apis/search/getSearchByKey';
import getSmartbox from './apis/search/getSmartbox';

// song list
import songLists from './apis/songLists/songLists';
import songListCategories from './apis/songLists/songListCategories';
import songListDetail from './apis/songLists/songListDetail';

// MV
import getMvByTag from './apis/mv/getMvByTag';

// singer
import getSimilarSinger from './apis/singers/getSimilarSinger';
import getSingerMv from './apis/singers/getSingerMv';
import getSingerDesc from './apis/singers/getSingerDesc';
import getSingerStarNum from './apis/singers/getSingerStarNum';

// radio
import getRadioLists from './apis/radio/getRadioLists';

// DigitalAlbum
import getDigitalAlbumLists from './apis/digitalAlbum/getDigitalAlbumLists';

// music
import getLyric from './apis/music/getLyric';
import getMusicPlay from './apis/music/getMusicPlay';

// album
import getAlbumInfo from './apis/album/getAlbumInfo';

// comments
import getComments from './apis/comments/getComments';

// UCommon
import UCommon from './apis/UCommon/UCommon';

// getTopLists
import getTopLists from './apis/rank/getTopLists';

// getQQLoginQr
import getQQLoginQr from './apis/user/getQQLoginQr';

// checkQQLoginQr
import checkQQLoginQr from './apis/user/checkQQLoginQr';

// getUserPlaylists
import { getUserPlaylists } from './apis/user/getUserPlaylists';

// getUserAvatar
import { getUserAvatar } from './apis/user/getUserAvatar';

// getUserLikedSongs
import { getUserLikedSongs } from './apis/user/getUserLikedSongs';

export {
	downloadQQMusic,
	// search
	getHotKey,
	getSearchByKey,
	getSmartbox,
	// song lists
	songLists,
	songListCategories,
	songListDetail,
	// MV
	getMvByTag,
	// singer
	getSimilarSinger,
	getSingerMv,
	getSingerDesc,
	getSingerStarNum,
	// radio
	getRadioLists,
	// DigitalAlbum
	getDigitalAlbumLists,
	// music
	getLyric,
	getMusicPlay,
	// album
	getAlbumInfo,
	// comments
	getComments,
	// UCommon
	UCommon,
	// getTopLists
	getTopLists,
	// login
	getQQLoginQr,
	checkQQLoginQr,
	// user
	getUserPlaylists,
	getUserAvatar,
	getUserLikedSongs
};
