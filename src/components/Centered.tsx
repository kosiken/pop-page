import { Box, Theme } from '@mui/material';
import { SxProps } from '@mui/system';
import React from 'react';


type CenteredProps = {
    children: any;
    key?: string;
    sx?: SxProps<Theme>;
    
};

const Centered: React.FC<CenteredProps> = ({children, sx = {}, ...props}) => {
    var sX: SxProps<Theme> = {};
    sX= Object.assign({
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    }, sx);
    return (

        <Box sx={sX}>
            {children}
        </Box>
    )
}

export default Centered