import { useState } from 'react';
import { AppBar, Box, CssBaseline, Container, Tab, Tabs, Toolbar, Typography } from '@mui/material';
import AllNotifications from './pages/AllNotifications';
import PriorityNotifications from './pages/PriorityNotifications';
import { appTheme } from './theme';
import { ThemeProvider } from '@mui/material/styles';

const App = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <AppBar position="static" color="primary" elevation={2}>
          <Toolbar sx={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h6" component="div" sx={{ fontWeight: 700 }}>
                Notification System
              </Typography>
              <Typography variant="body2" color="secondary.light">
                Vite + TypeScript notification UI with filters, pagination, and priority views.
              </Typography>
            </Box>

            <Tabs
              value={activeTab}
              onChange={(_, value) => setActiveTab(value)}
              textColor="inherit"
              indicatorColor="secondary"
              sx={{ '& .MuiTab-root': { color: 'white' } }}
            >
              <Tab label="All Notifications" />
              <Tab label="Priority Notifications" />
            </Tabs>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ py: 4 }}>
          {activeTab === 0 && <AllNotifications />}
          {activeTab === 1 && <PriorityNotifications />}
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default App;
