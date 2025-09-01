import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Card, CardContent, CardMedia, Typography, Button, CircularProgress, Container } from '@mui/material';
import type { Podcast } from '../types/podcast';
import { fetchPodcasts } from '../features/podcastsSlice';
import type { RootState, AppDispatch } from '../app/store';

export const PodcastList: React.FC = () => {
  // All hooks must be called before any early return
  const dispatch = useDispatch<AppDispatch>();
  const { podcasts: podcastsRaw, loading, error } = useSelector((state: RootState) => state.podcasts);
  const podcasts = Array.isArray(podcastsRaw) ? podcastsRaw : [];
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const allCategories = Array.from(new Set(podcasts.flatMap((p: any) => Array.isArray(p.categories) ? p.categories : [p.category]).filter(Boolean)));
  const [filter, setFilter] = React.useState<'recommended' | 'all' | string>('all');

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchPodcasts());
    }
  }, [dispatch, isAuthenticated]);

  // Debug: log podcasts array to check data (after all variable declarations and useEffect, before any if statements)
  console.log('PodcastList podcasts:', podcasts);

  let filteredPodcasts = podcasts;
  if (filter === 'recommended') {
    filteredPodcasts = podcasts.slice(0, 8);
  } else if (filter !== 'all') {
    filteredPodcasts = podcasts.filter((p: any) => {
      if (Array.isArray(p.categories)) return p.categories.includes(filter);
      return p.category === filter;
    });
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography>Please log in to see podcasts</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Sticky filter bar */}
      <Box sx={{ position: 'sticky', top: 64, zIndex: 10, background: 'background.paper', mb: 3, py: 1, px: 2, borderRadius: 2, boxShadow: 1, display: 'flex', gap: 2, alignItems: 'center' }}>
        <Button variant={filter === 'recommended' ? 'contained' : 'outlined'} onClick={() => setFilter('recommended')}>Recommended</Button>
        <Button variant={filter === 'all' ? 'contained' : 'outlined'} onClick={() => setFilter('all')}>All</Button>
        {allCategories.map((cat) => (
          <Button key={cat} variant={filter === cat ? 'contained' : 'outlined'} onClick={() => setFilter(cat)}>{cat}</Button>
        ))}
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
        {filteredPodcasts.map((podcast: any) => {
          // Support both old and new backend fields
          const category = Array.isArray(podcast.categories) ? podcast.categories[0] : (podcast.category || '');
          const language = Array.isArray(podcast.languages) ? podcast.languages[0] : (podcast.language || '');
          return (
            <Card key={podcast.id} elevation={3}>
              <CardMedia
                component="img"
                height="200"
                image={podcast.image_url || podcast.imageUrl}
                alt={podcast.title}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent>
                <Typography gutterBottom variant="h6" component="h2" noWrap>
                  {podcast.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  component="p"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {podcast.description}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  {podcast.publisher} • {category}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                  {language}

  // Debug: log podcasts array to check data (after all early returns)
  console.log('PodcastList podcasts:', podcasts);
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ mt: 2 }}
                  href={`/podcasts/${podcast.id}`}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </Box>
    </Container>
  );
};
