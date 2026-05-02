import { Box, Card, CardContent, Chip, IconButton, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CircleNotificationsIcon from '@mui/icons-material/CircleNotifications';
import { format } from 'date-fns';
import { Notification } from '../types/notification';

interface NotificationCardProps {
  notification: Notification;
  priorityMode?: boolean;
}

const NotificationCard = ({ notification, priorityMode = false }: NotificationCardProps) => {
  const formattedDate = format(new Date(notification.timestamp), 'PP p');

  const badgeColor = (type: Notification['type']) => {
    switch (type) {
      case 'Placement':
        return 'success';
      case 'Result':
        return 'info';
      case 'Event':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Card
      elevation={priorityMode ? 6 : 1}
      sx={{
        borderLeft: notification.read ? '4px solid transparent' : (theme) => `4px solid ${theme.palette.primary.main}`,
        opacity: notification.read ? 0.82 : 1,
        transition: 'transform 200ms ease, box-shadow 200ms ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: (theme) => theme.shadows[6]
        }
      }}
    >
      <CardContent>
        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} justifyContent="space-between" gap={2}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              {formattedDate}
            </Typography>
            <Typography variant="h6" component="p" sx={{ mt: 1, mb: 1 }}>
              {notification.message}
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column" gap={1} alignItems={{ xs: 'flex-start', md: 'flex-end' }}>
            <Chip label={notification.type} color={badgeColor(notification.type)} size="small" />
            <Chip
              label={notification.read ? 'Read' : 'Unread'}
              variant={notification.read ? 'outlined' : 'filled'}
              size="small"
              color={notification.read ? 'default' : 'primary'}
            />
            <IconButton aria-label="notification-status" size="small">
              {notification.read ? <CheckCircleIcon color="success" /> : <CircleNotificationsIcon color="primary" />}
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default NotificationCard;
