import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Avatar,
  IconButton,
  Stack,
  useTheme,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

export default function Listes() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const usersData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData);
    };
    fetchUsers();
  }, []);

  return (
    <Box sx={{ p: { xs: 1, md: 3 }, maxWidth: 1100, mx: 'auto', minHeight: '80vh', bgcolor: theme.palette.background.default }}>
      <Typography variant="h4" sx={{ fontWeight: 700, textAlign: { xs: 'center', md: 'left' }, mb: 2, color: isDark ? '#fff' : '#111' }}>
        Liste des Utilisateurs
      </Typography>
      <Paper elevation={3} sx={{ p: { xs: 1, md: 2 }, borderRadius: 3, boxShadow: 2, bgcolor: isDark ? '#111' : '#fff', color: isDark ? '#fff' : '#111', mb: 3 }}>
        <Grid container spacing={2}>
          {users.map(user => (
            <Grid item xs={12} sm={6} md={4} key={user.id}>
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  boxShadow: 1,
                  bgcolor: isDark ? '#181818' : '#fafafa',
                  color: isDark ? '#fff' : '#111',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  position: 'relative',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': { transform: 'scale(1.03)', boxShadow: 4 },
                }}
              >
                <Avatar src={user.photoURL} sx={{ width: 64, height: 64, mb: 1, bgcolor: isDark ? '#222' : '#eee', color: isDark ? '#fff' : '#111' }}>
                  <PersonIcon fontSize="large" />
                </Avatar>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {user.displayName}
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5, color: isDark ? '#bbb' : '#555' }}>
                  {user.email}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 500 }}>
                    {user.role}
                  </Typography>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
}
