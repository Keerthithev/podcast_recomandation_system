import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Card, CardContent, CardMedia, Typography, CircularProgress, Container, Button, Avatar } from '@mui/material';
import { fetchPodcasts } from '../features/podcastsSlice';
import type { RootState, AppDispatch } from '../app/store';

export const PodcastDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { podcasts, loading, error } = useSelector((state: RootState) => state.podcasts);
  const podcast = Array.isArray(podcasts) ? podcasts.find((p: any) => p.id === id) : null;

  useEffect(() => {
    if (!podcasts || podcasts.length === 0) {
      dispatch(fetchPodcasts());
    }
  }, [dispatch, podcasts]);

  if (loading || !podcast) {
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

  // Support both old and new backend fields (ignore TS for dynamic fields)
  const image = (podcast as any).image_url || (podcast as any).imageUrl;
  const category = Array.isArray((podcast as any).categories) ? (podcast as any).categories[0] : ((podcast as any).category || '');
  const language = Array.isArray((podcast as any).languages) ? (podcast as any).languages[0] : ((podcast as any).language || '');
  const externalUrl = (podcast as any).external_url || (podcast as any).externalUrl;
  const publisher = (podcast as any).publisher || '';
  const publisherInitial = publisher ? publisher[0].toUpperCase() : '?';

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Box mb={2}>
        <Button onClick={() => navigate(-1)} startIcon={<span style={{display:'inline-flex',alignItems:'center'}}>&larr;</span>} sx={{mb:1}}>
          Back to list
        </Button>
      </Box>
      <Card sx={{ borderRadius: 4, boxShadow: 6 }}>
        <CardMedia
          component="img"
          height="320"
          image={image}
          alt={podcast.title}
          sx={{ objectFit: 'cover', borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
        />
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56, fontSize: 28, mr: 2 }}>
              {publisherInitial}
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                {podcast.title}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                {publisher} {category && `• ${category}`}
              </Typography>
            </Box>
          </Box>
          <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-line' }}>
            {podcast.description}
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Language: {language}
          </Typography>
          {externalUrl && (
            <Button variant="contained" color="primary" sx={{ mt: 1 }} href={externalUrl} target="_blank" rel="noopener noreferrer">
              Listen on Spotify
            </Button>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};
