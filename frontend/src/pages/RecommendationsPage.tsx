import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Container, Typography, CircularProgress } from '@mui/material';
import { PodcastCard } from '../components/PodcastCard';
import { fetchRecommendations, recordInteraction } from '../features/podcastsSlice';
import type { RootState, AppDispatch } from '../app/store';
import type { Podcast } from '../types/podcast';
import type { UserInteraction } from '../features/podcastsSlice';

export const RecommendationsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { recommendations, loading, error } = useSelector((state: RootState) => state.podcasts);

  useEffect(() => {
    // TODO: Replace with actual user ID
    dispatch(fetchRecommendations('test-user-id'));
  }, [dispatch]);

  const handleInteraction = (podcastId: string, type: UserInteraction['type']) => {
    const interaction: UserInteraction = {
      podcastId,
      type,
      timestamp: new Date().toISOString(),
    };
    dispatch(recordInteraction({ userId: 'test-user-id', interaction }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Recommended Podcasts
      </Typography>
      {recommendations.map((podcast: Podcast) => (
        <PodcastCard
          key={podcast.id}
          podcast={podcast}
          onInteraction={(type) => handleInteraction(podcast.id, type)}
        />
      ))}
    </Container>
  );
};
