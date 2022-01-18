
import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import { useDispatch } from "react-redux";
import { getAuth, signInWithEmailAndPassword, AuthError, AuthErrorCodes } from 'firebase/auth'

import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import Spacer from '../../components/Spacer';

import { LionApp } from '../../firebaseObjects';
import { HomeAction } from '../../store/reducers';





const schema = yup
    .object({
        email: yup.string().email().required(),
        password: yup.string().min(4).required(),


    })
    .required();



const Login: React.FC<{
    onLoading: (loading: boolean) => void;
    onSuccess: (email: string, name?: string) => Promise<void>;
}> = ({ onLoading, onSuccess }) => {
    const dispatch = useDispatch();
    const [show, setShow] = React.useState(false)

    const [errrorMessage, setErrorMessage] = React.useState("");
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({ resolver: yupResolver(schema) });
    const getBody = () => show ? (<InputAdornment position="start">
        <VisibilityOffIcon />
    </InputAdornment>) : (<InputAdornment position="start">
        <VisibilityIcon />
    </InputAdornment>)
        const authentication = getAuth(LionApp);
        authentication.useDeviceLanguage();
        
    const login = async (data:any) => {
        setErrorMessage("");
        onLoading(true);
        try {
            let user = await signInWithEmailAndPassword(authentication, data.email, data.password)
            console.log(user);
            onSuccess(user.user.email || data.email, data.name);

        } catch (err: any) {
            let e = err as AuthError;

            console.log(e.code);
            if (e.code === AuthErrorCodes.USER_DELETED || e.code === AuthErrorCodes.INVALID_PASSWORD) {
                dispatch<HomeAction>({ type: 'show-error', errorMessage: "Email or password is incorrect"});

            }
            else {
                dispatch<HomeAction>({ type: 'show-error', errorMessage: "Signed In failed with credentials"});
 
            }
        }
      
        onLoading(false);

    }
    return (
        <Box>
            {!!errrorMessage && (<Typography color="red">{errrorMessage}</Typography>)}
           
           
            <form onSubmit={handleSubmit(login)}>
                <FormControl fullWidth sx={{
                    display: 'block',
                    padding: '10px 0'
                }}>
                    <TextField
                        type="email"
                        label="Email"
                        sx={{
                            width: '100%'
                        }}
                        helperText={errors.email?.message}
                        error={!!errors.email}
                        {...register("email")}
                    />
                </FormControl>
                <FormControl fullWidth sx={{
                    display: 'block',
                    padding: '10px 0'
                }}>
                    <TextField

                        InputProps={
                            {
                                endAdornment: (<span style={{
                                    marginLeft: '10px',
                                    cursor: 'pointer'
                                }} onClick={() => {
                                    setShow(!show);
                                }}>
                                    {getBody()}
                                </span>)
                            }
                        }

                        label="Password"
                        type={show ? "text" : "password"}
                        sx={{
                            width: '100%'
                        }}
                        helperText={errors.password?.message}
                        error={!!errors.password}
                        {...register("password")}
                    />
                </FormControl>

                <Spacer />
                <div style={{
                    textAlign: 'center'
                }}>
                    <Button type="submit" variant="contained">Continue</Button>
                </div>


            </form>


        </Box>
    )
}

export default Login;
