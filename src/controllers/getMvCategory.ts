import { createController } from './util';
import { getMvCategory } from '../services';

export default createController(getMvCategory, { name: 'getMvCategory' });
