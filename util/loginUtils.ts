export const hash33 = (t: string): number => {
	let e = 0;
	for (let n = 0, o = t.length; n < o; ++n) {
		e += (e << 5) + t.charCodeAt(n);
	}
	return 2147483647 & e;
};

export const getGtk = (p_skey: string): number => {
	const str = p_skey;
	let hash = 5381;
	for (let i = 0, len = str.length; i < len; ++i) {
		hash += (hash << 5) + str.charCodeAt(i);
	}
	return hash & 0x7fffffff;
};

export const getGuid = (): string => {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
		.replace(/[xy]/g, function (c) {
			const r = (Math.random() * 16) | 0;
			const v = c === 'x' ? r : (r & 0x3) | 0x8;
			return v.toString(16);
		})
		.toUpperCase();
};
