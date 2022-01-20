import React from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Centered from './Centered';
import logo from '../assets/National_Youth_Service_Corps_logo.jpg';



const LoadingPageIndicator: React.FC<{ height?: string }> = ({ height = '100vh' }) => (

    <Centered sx={{ height }}>
        <Box>
            <img src={logo} style={{
                height: 200,
                width: 200
            }} alt="logo" /> 
            <div style={{
                textAlign: 'center'
            }}>
            <CircularProgress />
            </div>
           
        </Box>



    </Centered>
)


export default LoadingPageIndicator
