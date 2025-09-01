import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { podcastService } from '../services/api';

import { Podcast } from '../types/podcast';

export interface UserInteraction {
  podcastId: string;
  type: 'listen' | 'like' | 'share' | 'subscribe';
  timestamp: string;
}

export interface PodcastState {
  podcasts: Podcast[];
  recommendations: Podcast[];
  loading: boolean;
  error: string | null;
  currentPodcast: Podcast | null;
}

const initialState: PodcastState = {
  podcasts: [],
  recommendations: [],
  loading: false,
  error: null,
  currentPodcast: null,
};

export const fetchPodcasts = createAsyncThunk(
  'podcasts/fetchPodcasts',
  async (params?: { skip?: number; limit?: number; category?: string; language?: string; search?: string }) => {
    const response = await podcastService.getAllPodcasts(params);
    return response;
  }
);

export const fetchPodcastById = createAsyncThunk(
  'podcasts/fetchPodcastById',
  async (id: string) => {
    const response = await podcastService.getPodcastById(id);
    return response;
  }
);

export const fetchRecommendations = createAsyncThunk(
  'podcasts/fetchRecommendations',
  async (userId: string) => {
    const response = await podcastService.getRecommendations(userId);
    return response;
  }
);

export const recordInteraction = createAsyncThunk(
  'podcasts/recordInteraction',
  async ({ userId, interaction }: { userId: string; interaction: UserInteraction }) => {
    await podcastService.recordInteraction(userId, interaction);
    return interaction;
  }
);

const podcastsSlice = createSlice({
  name: 'podcasts',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentPodcast: (state) => {
      state.currentPodcast = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPodcasts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPodcasts.fulfilled, (state, action) => {
        state.loading = false;
        console.log('DEBUG fetchPodcasts.fulfilled payload:', action.payload);
        state.podcasts = action.payload;
      })
      .addCase(fetchPodcasts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch podcasts';
      })
      .addCase(fetchPodcastById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPodcastById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPodcast = action.payload;
      })
      .addCase(fetchPodcastById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch podcast';
      })
      .addCase(fetchRecommendations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecommendations.fulfilled, (state, action) => {
        state.loading = false;
        state.recommendations = action.payload;
      })
      .addCase(fetchRecommendations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch recommendations';
      })
      .addCase(recordInteraction.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to record interaction';
      });
  },
});

export const { clearError, clearCurrentPodcast } = podcastsSlice.actions;
export default podcastsSlice.reducer;
