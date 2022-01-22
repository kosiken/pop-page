import React from 'react';
import Backdrop from '@mui/material/Backdrop';
import { User } from '../models';
import Avatar from '@mui/material/Avatar';
import Container  from '@mui/material/Container';

const ImageView: React.FC<{
    user: User
}> = ({ user }) => {

    const [open, setOpen] = React.useState(false);
    const handleClose = () => {
        setOpen(false);
    };

    const handleToggle = () => {
        setOpen(!open);
    };

    return (<>
        <Avatar sx={{ width: 80, height: 80 }} alt={user!.name} src={user!.picUrl} onClick={handleToggle} style={{ display: 'inline-block' }}/>
        <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={open}
        onClick={handleClose}
      >

          <Container>
      
        <img alt={user.name} src={user.picUrl}  />
        </Container>
      </Backdrop>
  
  
    </>)


};

export default ImageView;
