import { combineReducers } from 'redux';
import adminReducer from './adminReducer'
import userReducer from './userReducer'
import errorReducerHelper from './errorReducerHelper'
import errorReducer from './errorReducer'


export default combineReducers({
    admin: adminReducer,
    user: userReducer,
    error: errorReducer,
    errorHelper: errorReducerHelper
});