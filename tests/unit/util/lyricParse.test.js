const { lyricParse, Lyric } = require('../../../util/lyricParse');

describe('lyricParse', () => {
	describe('Lyric class', () => {
		test('should parse simple lyric', () => {
			const lyricString = `[ti:Song Title]
[ar:Artist Name]
[al:Album Name]
[00:01.00]First line
[00:05.00]Second line
[00:10.00]Third line`;

			const result = lyricParse(lyricString);

			expect(result).toBeInstanceOf(Lyric);
			expect(result.tags.title).toBe('Song Title');
			expect(result.tags.artist).toBe('Artist Name');
			expect(result.tags.album).toBe('Album Name');
			expect(result.lines).toHaveLength(3);
		});

		test('should parse time correctly', () => {
			const lyricString = `[00:01.50]Test line`;
			const result = lyricParse(lyricString);

			expect(result.lines[0].time).toBe(1500);
			expect(result.lines[0].txt).toBe('Test line');
		});

		test('should parse time with milliseconds', () => {
			const lyricString = `[01:23.45]Test line`;
			const result = lyricParse(lyricString);

			expect(result.lines[0].time).toBe(83450);
		});

		test('should handle empty lyric', () => {
			const result = lyricParse('');

			expect(result.lines).toHaveLength(0);
			expect(result.tags.title).toBe('');
			expect(result.tags.artist).toBe('');
		});

		test('should sort lines by time', () => {
			const lyricString = `[00:10.00]Third
[00:01.00]First
[00:05.00]Second`;
			const result = lyricParse(lyricString);

			expect(result.lines[0].txt).toBe('First');
			expect(result.lines[1].txt).toBe('Second');
			expect(result.lines[2].txt).toBe('Third');
		});

		test('should ignore empty lines', () => {
			const lyricString = `[00:01.00]Line 1
[00:05.00]
[00:10.00]Line 2`;
			const result = lyricParse(lyricString);

			expect(result.lines).toHaveLength(2);
		});

		test('should handle special characters', () => {
			const lyricString = `[00:01.00]测试中文 🎵 Special!@#$%`;
			const result = lyricParse(lyricString);

			expect(result.lines[0].txt).toBe('测试中文 🎵 Special!@#$%');
		});

		test('should parse offset tag', () => {
			const lyricString = `[offset:500]
[00:01.00]Test`;
			const result = lyricParse(lyricString);

			expect(result.tags.offset).toBe('500');
		});

		test('should parse by tag', () => {
			const lyricString = `[by:Lyric Creator]
[00:01.00]Test`;
			const result = lyricParse(lyricString);

			expect(result.tags.by).toBe('Lyric Creator');
		});

		test('should handle multiple time stamps in one line', () => {
			const lyricString = `[00:01.00][00:05.00]Repeated line`;
			const result = lyricParse(lyricString);

			expect(result.lines).toHaveLength(2);
			expect(result.lines[0].time).toBe(1000);
			expect(result.lines[1].time).toBe(5000);
		});
	});
});
