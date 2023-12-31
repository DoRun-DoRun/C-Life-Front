import {persistUser, userDataType} from './../async/asyncStore';
import {createSlice} from '@reduxjs/toolkit';

// User에서 관리해야하는 Slice

const initialState: userDataType = {
  userName: null,
  accessToken: null,
  refreshToken: null,
  UID: null,
  SIGN_TYPE: null,
  USER_EMAIL: null,
};

/**
 * TemplateSlice에서 관리할 상태를 지정합니다.
 */
export const UserSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // 모든 사용자 정보를 상태에 저장합니다.
    setUser(state, action) {
      const {userName, UID, accessToken, refreshToken} = action.payload;
      state.userName = userName;
      state.UID = UID;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;

      persistUser(state);
    },
    setUserName(state, action) {
      const {userName} = action.payload;
      state.userName = userName;

      persistUser(state);
    },
    setAccessToken(state, actoin) {
      const {accessToken} = actoin.payload;
      state.accessToken = accessToken;

      persistUser(state);
    },
  },
});

// Action creators are generated for each case reducer function
export const {setUser, setAccessToken, setUserName} = UserSlice.actions;

export default UserSlice.reducer;
