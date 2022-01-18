
import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import { useDispatch } from "react-redux";
import { getAuth, createUserWithEmailAndPassword, AuthError, AuthErrorCodes } from 'firebase/auth'
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import * as yup from "yup";
import { FieldValues, useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { HomeAction } from '../../store/reducers';



// LionApp

import Spacer from '../../components/Spacer';
import { LionApp } from '../../firebaseObjects';
// import api from '../../api'



const schema = yup
    .object({
        email: yup.string().email().required(),
        password: yup.string().min(4).required(),
        name: yup.string().min(3).required(),

    })
    .required();

const SignUp: React.FC<{
    onLoading: (loading: boolean) => void;
    onSuccess: (email: string, name?: string) => Promise<void>;
}> = ({ onLoading, onSuccess }) => {


    const [errrorMessage, setErrorMessage] = React.useState("");
    const [show, setShow] = React.useState(false);
    const dispatch = useDispatch();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({ resolver: yupResolver(schema) });

    const authentication = getAuth(LionApp);
    authentication.useDeviceLanguage();
 
    
    const signUp: SubmitHandler<FieldValues | {
        name: string;
        email: string;
        password: string;
    }> = async (data) => {
        setErrorMessage("");
        onLoading(true);
        try {
            let user = await createUserWithEmailAndPassword(authentication, data.email, data.password)
            console.log(user);
            onSuccess(user.user.email || data.email, data.name);

        } catch (err: any) {
            let e = err as AuthError;

            // console.log(e.code === AuthErrorCodes.EMAIL_EXISTS);
            if (e.code === AuthErrorCodes.EMAIL_EXISTS) {
                dispatch<HomeAction>({ type: 'show-error', errorMessage: "Email is already in use"});

            }
        }

        onLoading(false);

    }

    

    const getBody = () => show ? (<InputAdornment position="start">
        <VisibilityOffIcon />
    </InputAdornment>) : (<InputAdornment position="start">
        <VisibilityIcon />
    </InputAdornment>)


    return (
        <Box>

            {!!errrorMessage && (<Typography color="red">{errrorMessage}</Typography>)}
            <form onSubmit={handleSubmit(signUp)}>
                <FormControl fullWidth sx={{
                    display: 'block',
                    padding: '10px 0'
                }}>
                    <TextField

                        label="Full Name"
                        helperText={errors.name?.message}
                        error={!!errors.name}
                        type="text"
                        sx={{
                            width: '100%'
                        }}

                        {...register("name")}

                    />
                </FormControl>


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

export default SignUp
