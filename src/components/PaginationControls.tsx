import { Box, FormControl, InputLabel, MenuItem, Pagination, PaginationItem, Select, Typography } from '@mui/material';

interface PaginationControlsProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  isLoading: boolean;
}

const PaginationControls = ({ page, limit, total, onPageChange, onLimitChange, isLoading }: PaginationControlsProps) => {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} alignItems="center" justifyContent="space-between" gap={2}>
      <Typography variant="body2" color="text.secondary">
        Showing page {page} of {totalPages} • {total} notifications
      </Typography>

      <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="page-size-label">Page size</InputLabel>
          <Select
            labelId="page-size-label"
            value={limit}
            label="Page size"
            onChange={(event) => onLimitChange(Number(event.target.value))}
          >
            {[5, 10, 15, 20].map((size) => (
              <MenuItem key={size} value={size}>
                {size}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Pagination
          page={page}
          count={totalPages}
          onChange={(_, value) => onPageChange(value)}
          renderItem={(item) => <PaginationItem {...item} />}
          disabled={isLoading}
          siblingCount={1}
          boundaryCount={1}
          color="primary"
        />
      </Box>
    </Box>
  );
};

export default PaginationControls;
