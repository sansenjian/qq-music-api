// [01:27.96]
const timeExp = /\[(\d{2,}):(\d{2})(?:\.(\d{2,3}))?]/g;

const TAGREGMAP: Record<string, string> = {
	title: 'ti',
	artist: 'ar',
	album: 'al',
	offset: 'offset',
	by: 'by'
};

interface LyricLine {
	time: number;
	txt: string;
}

export class Lyric {
	lyric: string;
	tags: Record<string, string>;
	lines: LyricLine[];

	constructor (lyric: string) {
		this.lyric = lyric;
		this.tags = {};
		this.lines = [];

		this._init();
	}

	_init () {
		this._initTag();
		this._initLines();
	}

	_initTag () {
		for (const tag in TAGREGMAP) {
			const matches = this.lyric.match(new RegExp(`\\[${TAGREGMAP[tag]}:([^\\]]*)]`, 'i'));
			this.tags[tag] = (matches && matches[1]) || '';
		}
	}

	_initLines () {
		const lines = this.lyric.split('\n');
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i].trim();
			timeExp.lastIndex = 0;
			const matches = [...line.matchAll(timeExp)];
			if (matches.length > 0) {
				const txt = line.replace(timeExp, '').trim();
				if (txt) {
					for (const result of matches) {
						// RegExpMatchArray elements are strings, so we need to parse them
						const minutes = parseInt(result[1], 10);
						const seconds = parseInt(result[2], 10);
						const milliseconds = result[3] ? parseInt(result[3], 10) : 0;
						
						// If milliseconds is 2 digits (e.g. .96), it usually means 960ms or 96cs?
						// Standard LRC is usually centiseconds (cs), so .96 is 960ms.
						// If 3 digits, it's ms.
						// The original code was `(result[3] || 0) * 10`. 
						// If result[3] is '96', parseInt is 96. 96 * 10 = 960. Correct.
						// If result[3] is '123', parseInt is 123. 123 * 10 = 1230. Incorrect if it was already ms.
						// But regex `\d{2,3}` captures 2 or 3 digits.
						// If 3 digits, usually it is milliseconds. If 2 digits, it is centiseconds.
						// The logic `* 10` implies it assumes 2 digits (centiseconds) mostly.
						// Let's keep the original logic for compatibility.
						
						const time = minutes * 60 * 1000 + seconds * 1000 + milliseconds * 10;
						this.lines.push({
							time,
							txt
						});
					}
				}
			}
		}

		this.lines.sort((a, b) => {
			return a.time - b.time;
		});
	}
}

export function lyricParse (lyricString: string) {
	return new Lyric(lyricString);
}
