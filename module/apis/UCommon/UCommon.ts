import { AxiosRequestConfig, Method } from 'axios';
import u_common from '../u_common';

interface UCommonParams {
	method?: Method | string;
	params?: any;
	option?: AxiosRequestConfig;
}

export default ({ method = 'get', params = {}, option = {} }: UCommonParams) => {
	const options: AxiosRequestConfig = { ...option, params };
	return u_common({ method, options });
};
