import { Box, Button, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { NotificationType } from '../types/notification';

interface NotificationFilterProps {
  typeFilter: NotificationType | 'All';
  onTypeChange: (value: NotificationType | 'All') => void;
  onRefresh: () => void;
}

const NotificationFilter = ({ typeFilter, onTypeChange, onRefresh }: NotificationFilterProps) => {
  return (
    <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} alignItems="center" justifyContent="space-between" gap={2}>
      <FormControl size="small" sx={{ minWidth: 180 }}>
        <InputLabel id="notification-filter-label">Type</InputLabel>
        <Select
          labelId="notification-filter-label"
          value={typeFilter}
          label="Type"
          onChange={(event) => onTypeChange(event.target.value as NotificationType | 'All')}
        >
          <MenuItem value="All">All</MenuItem>
          <MenuItem value="Placement">Placement</MenuItem>
          <MenuItem value="Result">Result</MenuItem>
          <MenuItem value="Event">Event</MenuItem>
        </Select>
      </FormControl>

      <Button variant="outlined" startIcon={<RefreshIcon />} onClick={onRefresh}>
        Refresh
      </Button>
    </Box>
  );
};

export default NotificationFilter;
