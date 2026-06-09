import { createController } from './util';
import { getRecommendBanner } from '../services';

export default createController(getRecommendBanner, { name: 'getRecommendBanner' });
