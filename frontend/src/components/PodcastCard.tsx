import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Tooltip,
  CardActions,
  Collapse,
  Chip,
} from '@mui/material';
import {
  PlayArrow,
  Favorite,
  FavoriteBorder,
  Share,
  ExpandMore as ExpandMoreIcon,
  PlaylistAdd,
} from '@mui/icons-material';
import type { Podcast } from '../types/podcast';

interface PodcastCardProps {
  podcast: Podcast;
  onInteraction: (type: 'listen' | 'like' | 'share' | 'subscribe') => void;
}

export const PodcastCard: React.FC<PodcastCardProps> = ({ podcast, onInteraction }) => {
  const [expanded, setExpanded] = useState(false);
  const [liked, setLiked] = useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const handleLike = () => {
    setLiked(!liked);
    onInteraction('like');
  };

  return (
    <Card sx={{ 
      mb: 2,
      transition: 'transform 0.2s',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: (theme) => theme.shadows[6],
      }
    }}>
      <Box sx={{ display: 'flex' }}>
        <CardMedia
          component="img"
          sx={{ width: 151, height: 151 }}
          image={podcast.imageUrl}
          alt={podcast.title}
        />
        <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          <CardContent>
            <Typography component="h5" variant="h5" gutterBottom>
              {podcast.title}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <Chip label={podcast.category} color="primary" size="small" />
              {podcast.language && (
                <Chip label={podcast.language} size="small" variant="outlined" />
              )}
            </Box>
            <Typography variant="body2" color="text.secondary" noWrap>
              {podcast.description}
            </Typography>
          </CardContent>
          <CardActions sx={{ justifyContent: 'space-between', px: 2 }}>
            <Box>
              <Tooltip title="Play">
                <IconButton onClick={() => onInteraction('listen')}>
                  <PlayArrow />
                </IconButton>
              </Tooltip>
              <Tooltip title={liked ? 'Unlike' : 'Like'}>
                <IconButton onClick={handleLike}>
                  {liked ? <Favorite color="error" /> : <FavoriteBorder />}
                </IconButton>
              </Tooltip>
              <Tooltip title="Share">
                <IconButton onClick={() => onInteraction('share')}>
                  <Share />
                </IconButton>
              </Tooltip>
              <Tooltip title="Add to playlist">
                <IconButton onClick={() => onInteraction('subscribe')}>
                  <PlaylistAdd />
                </IconButton>
              </Tooltip>
            </Box>
            <Tooltip title={expanded ? 'Show less' : 'Show more'}>
              <IconButton
                onClick={handleExpandClick}
                sx={{
                  transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s',
                }}
              >
                <ExpandMoreIcon />
              </IconButton>
            </Tooltip>
          </CardActions>
        </Box>
      </Box>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <Typography paragraph>{podcast.description}</Typography>
          {podcast.episodes && podcast.episodes.length > 0 && (
            <>
              <Typography variant="h6" gutterBottom>
                Latest Episodes
              </Typography>
              {podcast.episodes.slice(0, 3).map((episode) => (
                <Box key={episode.id} sx={{ mb: 1 }}>
                  <Typography variant="subtitle2">{episode.title}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(episode.release_date).toLocaleDateString()}
                  </Typography>
                </Box>
              ))}
            </>
          )}
        </CardContent>
      </Collapse>
    </Card>
  );
};
