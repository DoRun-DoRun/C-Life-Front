import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface ChallengeState {
  selectedChallengeMstNo: number | null;
}

const initialState: ChallengeState = {
  selectedChallengeMstNo: null,
};

const challengeSlice = createSlice({
  name: 'challenge',
  initialState,
  reducers: {
    setSelectedChallengeMstNo(state, action: PayloadAction<number | null>) {
      state.selectedChallengeMstNo = action.payload;
    },
  },
});

export const {setSelectedChallengeMstNo} = challengeSlice.actions;
export default challengeSlice.reducer;
