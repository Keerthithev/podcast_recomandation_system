import { configureStore } from '@reduxjs/toolkit';
import podcastReducer from '../features/podcastsSlice';
import authReducer from '../features/authSlice';

export const store = configureStore({
  reducer: {
    podcasts: podcastReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
