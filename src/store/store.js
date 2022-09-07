import { createStore } from 'redux';
import homeReducer from '../reducer/index';

export const store = createStore(homeReducer);
