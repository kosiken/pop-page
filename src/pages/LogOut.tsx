import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Spacer from '../components/Spacer';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Header from '../components/Header';


const LogOut = () => {
    return (
        <Box>
            <Header title="Log Out" />
            <Container maxWidth="sm">
            <Spacer />
            <Typography variant="h3" gutterBottom component="div">
                Log out from Application
            </Typography>
            <Spacer />
            <Typography variant="body2" gutterBottom>
                Are you sure you want to logout?
            </Typography>

            <Spacer />

            <Button variant="contained" onClick={() => {
                window.localStorage.clear();
                window.location.pathname = "/"

            }}>
                LogOut
            </Button>
            </Container>
        </Box>
    );
};

export default LogOut;
