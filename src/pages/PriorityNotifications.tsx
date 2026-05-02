import { Box, CircularProgress, Typography } from '@mui/material';
import NotificationFilter from '../components/NotificationFilter';
import NotificationCard from '../components/NotificationCard';
import PaginationControls from '../components/PaginationControls';
import { useNotifications } from '../hooks/useNotifications';

const PriorityNotifications = () => {
  const {
    notifications,
    page,
    limit,
    total,
    typeFilter,
    isLoading,
    error,
    unreadCount,
    setPage,
    setLimit,
    setTypeFilter,
    refresh
  } = useNotifications({ priorityMode: true });

  return (
    <Box display="flex" flexDirection="column" gap={3}>
        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} alignItems="flex-start" justifyContent="space-between" gap={2}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Priority Notifications
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Notifications are sorted by priority and recency. This page surfaces the most urgent updates first.
            </Typography>
          </Box>
          <Typography variant="subtitle1" color="primary">
            {unreadCount} unread
          </Typography>
        </Box>

        <NotificationFilter
          typeFilter={typeFilter}
          onTypeChange={setTypeFilter}
          onRefresh={refresh}
        />

        <Box display="grid" gap={2}>
          {isLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" py={10}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ p: 3, borderRadius: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
              <Typography variant="subtitle1">Unable to load priority notifications.</Typography>
              <Typography variant="body2">{error}</Typography>
            </Box>
          ) : notifications.length === 0 ? (
            <Box sx={{ p: 4, borderRadius: 2, bgcolor: 'background.paper', textAlign: 'center' }}>
              <Typography variant="h6">No priority notifications found.</Typography>
              <Typography variant="body2" color="text.secondary">
                Adjust the type filter or refresh to fetch the latest updates.
              </Typography>
            </Box>
          ) : (
            notifications.map((notification) => (
              <NotificationCard key={notification.id} notification={notification} priorityMode />
            ))
          )}
        </Box>

        <PaginationControls
          page={page}
          limit={limit}
          total={total}
          onPageChange={setPage}
          onLimitChange={setLimit}
          isLoading={isLoading}
        />
      </Box>
  );
};

export default PriorityNotifications;
