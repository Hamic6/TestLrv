import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getDoc, doc } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';

export const fetchUserData = createAsyncThunk('auth/fetchUserData', async (uid) => {
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (userDoc.exists()) {
    return userDoc.data();
  }
  throw new Error('User not found');
});

const initialState = {
  user: null,
  isInitialized: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
    },
    setInitialized(state, action) {
      state.isInitialized = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserData.pending, (state) => {
        state.isInitialized = false;
        state.error = null;
      })
      .addCase(fetchUserData.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isInitialized = true;
      })
      .addCase(fetchUserData.rejected, (state, action) => {
        state.isInitialized = true;
        state.error = action.error.message;
      });
  },
});

export const { setUser, setInitialized } = authSlice.actions;
export default authSlice.reducer;
