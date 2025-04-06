import { createStore } from 'redux';
import rootReducer from './reducers';

// Configure and create the Redux store
const configureStore = (initialState = {}) => {
  return createStore(
    rootReducer,
    initialState
  );
};

export default configureStore;