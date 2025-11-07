import { Box, CircularProgress, Skeleton, Backdrop, Typography } from '@mui/material';

// Full-page loading overlay
export const FullPageLoader = ({ message = 'Loading...' }) => (
  <Backdrop
    sx={{
      color: '#fff',
      zIndex: (theme) => theme.zIndex.drawer + 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      flexDirection: 'column',
      gap: 2,
    }}
    open={true}
  >
    <CircularProgress size={60} color="inherit" />
    <Typography variant="h6">{message}</Typography>
  </Backdrop>
);

// Spinner loading component
export const LoadingSpinner = ({ size = 60, message }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '400px',
      gap: 2,
    }}
  >
    <CircularProgress size={size} />
    {message && (
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    )}
  </Box>
);

// Button loading spinner
export const ButtonSpinner = ({ size = 20 }) => (
  <CircularProgress size={size} color="inherit" />
);

// Shimmer loading for accordion lists
export const AccordionSkeleton = ({ count = 5 }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
    {[...Array(count)].map((_, index) => (
      <Skeleton
        key={index}
        variant="rounded"
        height={48}
        animation="wave"
      />
    ))}
  </Box>
);

// Shimmer loading for cards
export const CardSkeleton = ({ count = 3 }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    {[...Array(count)].map((_, index) => (
      <Skeleton
        key={index}
        variant="rounded"
        height={120}
        animation="wave"
      />
    ))}
  </Box>
);

// Shimmer for stat cards
export const StatCardSkeleton = () => (
  <Skeleton variant="rounded" height={100} animation="wave" />
);

// Shimmer for table rows
export const TableSkeleton = ({ rows = 5, columns = 4 }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
    {[...Array(rows)].map((_, rowIndex) => (
      <Box key={rowIndex} sx={{ display: 'flex', gap: 2 }}>
        {[...Array(columns)].map((_, colIndex) => (
          <Skeleton
            key={colIndex}
            variant="text"
            width={`${100 / columns}%`}
            height={40}
            animation="wave"
          />
        ))}
      </Box>
    ))}
  </Box>
);

export default LoadingSpinner;

