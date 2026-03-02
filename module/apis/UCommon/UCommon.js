const u_common = require('../u_common');

module.exports = ({ method = 'get', params = {}, option = {} }) => {
	const options = Object.assign(option, { params });
	return u_common({ method, options });
};
