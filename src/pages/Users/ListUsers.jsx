import React, { useEffect, useState } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Grid as MuiGrid,
} from "@mui/material";
import { spacing } from "@mui/system";
import styled from "@emotion/styled";
import { db } from "../../firebaseConfig"; // Utilisation des bons exports

const Grid = styled(MuiGrid)(spacing);

const ListUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const usersData = querySnapshot.docs.map(doc => doc.data());
        setUsers(usersData);
      } catch (error) {
        console.error("Erreur lors de la récupération des utilisateurs: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12} lg={8}>
        <Card mb={6}>
          <CardContent>
            <Typography variant="h4" gutterBottom>Liste des Utilisateurs</Typography>
            <List>
              {users.map((user, index) => (
                <ListItem key={index}>
                  <ListItemAvatar>
                    <Avatar alt={user.displayName || "User"} src={user.photoURL || ""} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={user.displayName || "User"}
                    secondary={
                      <Typography variant="body2" color="textSecondary">
                        {user.email}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default ListUsers;
