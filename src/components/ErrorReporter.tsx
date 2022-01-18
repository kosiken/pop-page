import React, { useState, useEffect } from 'react';
import CloseIcon from "@mui/icons-material/Close";
import { useDispatch, useSelector  } from "react-redux";
import IconButton from "@mui/material/IconButton";
import Snackbar from "@mui/material/Snackbar";
import { AppState } from "../store";
import { HomeAction } from "../store/reducers";


 

const ErrorReporter: React.FC= function () {
    
    const dispatch = useDispatch();

    const [errorPresent, setErrorPresent] = useState(false);
    let  errorMessage  = useSelector((state: AppState) => state.home.errorMessage);
    useEffect(() => {
     if(errorMessage.length)   setErrorPresent(true);
    }, [errorMessage])

    
    const handleClose = () => {
        
        setErrorPresent(false);
        dispatch<HomeAction>({type: "show-error", errorMessage: ''});
    }
    const action = (
  
      
            <IconButton
                size="small"
                aria-label="close"
                color="inherit"
                onClick={handleClose}
            >

                <CloseIcon fontSize="small" />
            </IconButton>
  
    );


    return (<Snackbar
        open={errorPresent}
        autoHideDuration={5000}
        
        onClose={handleClose}
        message={errorMessage}
        action={action}
    />)

}

export default ErrorReporter;