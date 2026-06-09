import { createController } from './util';
import { getSingerCategory } from '../services';

export default createController(getSingerCategory, { name: 'getSingerCategory' });
