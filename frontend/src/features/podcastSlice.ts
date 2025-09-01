import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { podcastService } from '../services/api';
import type { Podcast } from '../types/podcast';
import type { UserInteraction } from '../services/api';

interface PodcastState {
  recommendations: Podcast[];
  loading: boolean;
  error: string | null;
}

const initialState: PodcastState = {
  recommendations: [],
  loading: false,
  error: null,
};

export const fetchRecommendations = createAsyncThunk(
  'podcasts/fetchRecommendations',
  async (userId: string) => {
    return await podcastService.getRecommendations(userId);
  }
);

export const recordInteraction = createAsyncThunk(
  'podcasts/recordInteraction',
  async ({ userId, interaction }: { userId: string; interaction: UserInteraction }) => {
    return await podcastService.recordInteraction(userId, interaction);
  }
);

const podcastSlice = createSlice({
  name: 'podcasts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecommendations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecommendations.fulfilled, (state, action: PayloadAction<Podcast[]>) => {
        state.loading = false;
        state.recommendations = action.payload;
      })
      .addCase(fetchRecommendations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch recommendations';
      });
  },
});

export default podcastSlice.reducer;
