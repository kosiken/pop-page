
import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';


import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import { useDispatch, useSelector } from "react-redux";
import LinearProgress from "@mui/material/LinearProgress";
import * as yup from "yup";
import { collection, setDoc, doc } from "firebase/firestore";

import { FieldValues, useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { HomeAction} from '../store/reducers';



// LionApp

import Spacer from '../components/Spacer';
import {  LionAppDb } from '../firebaseObjects';
import { AppState } from '../store';
import Header from '../components/Header';
// import api from '../../api'

const entries = [
    {
        name: "name",
        required: true,
        multiline: false,
        placeholder: "Your Name",
        title: "Name *",
        defaultValue: ""
    },

    {
        name: "profile",
        title: "Profile",
        required: false,
        multiline: true,
        placeholder: "Some info about you",
        defaultValue: "No Profile"

    },
    {
        name: "stateCode",
        title: "State Code",
        required: false,
        multiline: false,
        placeholder: "Your state code",
        defaultValue: "KD/21A/"

    },

]


const schema = yup
    .object({
        profile: yup.string(),
        stateCode: yup.string(),
        name: yup.string().min(3).required(),

    })
    .required();

const Profile: React.FC<{
  }> = () => {
    const user = useSelector((state: AppState) => state.auth.user);
 
    const [loading, setLoading] = React.useState(false);
    const [errrorMessage, setErrorMessage] = React.useState("");
    const dispatch = useDispatch();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({ resolver: yupResolver(schema) });

 
    
    const updateUser: SubmitHandler<FieldValues | {
        name: string;
        stateCode: string;
        profile: string;
    }> = async (data) => {
        setErrorMessage("");
        setLoading(true);
        try {
            if(!user) {
                console.log("error");
                setLoading(false);
                return;
            }
            user.name = data.name.toLowerCase();
            if(data.profile ) user!.profile = data.profile
            if(data.stateCode) {
                user!.stateCode = data.stateCode;
            }
            user.updatedAt = Date.now();

           console.log(user);
           const usersRef = collection(LionAppDb, "app-users");
            
           let details = JSON.parse(JSON.stringify((user.getDetails())));
        //    let keys = Object.keys(details);
        console.log(details);
        //    for(let key of keys) {
        //        if(details[key] === undefined) {
        //            delete details[key];
        //        }
        //    }
           await setDoc(doc(usersRef, user!.id), details);



       
        } catch (err: any) {
          

            // console.log(e.code === AuthErrorCodes.EMAIL_EXISTS);
            // if (e.code === AuthErrorCodes.EMAIL_EXISTS) {
                dispatch<HomeAction>({ type: 'show-error', errorMessage: err.message});

            // }
        }

        setLoading(false);

    }

    


    return (
        <Box>
            <Header title="Profile" />
            <Spacer space={20} />

<Container  maxWidth="sm">
            {!!errrorMessage && (<Typography color="red">{errrorMessage}</Typography>)}
            {loading && <LinearProgress /> }
            <form onSubmit={handleSubmit(updateUser)}>
                        {entries.map((entry, i) => (
                            <FormControl fullWidth sx={{
                                display: 'block',
                                padding: '10px 0'
                            }} key={'add-category-form-entry-' + i}>
                                <TextField

                                    label={entry.title}
                                    helperText={errors[entry.name]?.message}
                                    error={!!errors[entry.name]}
                                    placeholder={entry.placeholder}
                                    multiline={entry.multiline}
                                    type="text"
                                    sx={{
                                        width: '100%'
                                    }}

                                    {...register(entry.name)}
                                    rows={entry.multiline ? 4 : 1}
                                    defaultValue={!!user ? user.getDetails()[entry.name] : ""}
                                />
                            </FormControl>
                        ))}

                        <Spacer />
                        <div style={{
                            textAlign: 'center'
                        }}>
                            <Button type="submit" variant="contained">Update</Button>


                        </div>

                    </form>
                    </Container>

        </Box>
    )
}

export default Profile
