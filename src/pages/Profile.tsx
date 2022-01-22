
import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import snakeCase from 'lodash/snakeCase'
import { ref as firebaseRef, uploadBytes, deleteObject, getDownloadURL } from "firebase/storage";
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import { useDispatch, useSelector } from "react-redux";
import LinearProgress from "@mui/material/LinearProgress";
import * as yup from "yup";
import { collection, setDoc, doc, getDocs, query, where } from "firebase/firestore";

import { FieldValues, useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { HomeAction, AuthAction } from '../store/reducers';


// LionApp



import Spacer from '../components/Spacer';
import { LionAppDb, LionStorage } from '../firebaseObjects';
import { AppState } from '../store';
import Header from '../components/Header';
import { IEntry, User } from '../models';
import Centered from '../components/Centered';
import { titleCase } from '../helpers';
import ImageView from '../components/ImageView';
// import api from '../../api'

const entries: IEntry[] = [
    {
        name: "name",
        required: true,
        multiline: false,
        placeholder: "Your Name",
        title: "Name *",
        defaultValue: "",
        type: "text",
        transformFunction: titleCase
    },

    {
        name: "profile",
        title: "Profile",
        required: false,
        multiline: true,
        placeholder: "Some info about you",
        defaultValue: "No Profile",
        type: "text"
    },
    {
        name: "stateCode",
        title: "State Code",
        required: false,
        multiline: false,
        placeholder: "Your state code",
        defaultValue: "KD/21A/",
        type: "text"

    },
    {
        name: "phoneNumber",
        title: "Phone Number",
        required: true,
        multiline: false,
        placeholder: "Your Whatsapp number",
        defaultValue: "",
        type: "tel"
    },

    {
        name: "instagramUserName",
        title: "Instagram Username",
        required: false,
        multiline: false,
        placeholder: "Your username on Instagram",
        defaultValue: "",
        type: "text"
    }
    ,

    {
        name: "fbUserName",
        title: "Facebook Url",
        required: false,
        multiline: false,
        placeholder: "The link to your facebook profile",
        defaultValue: "",
        type: "text"
    }
]


const schema = yup
    .object({
        profile: yup.string(),
        stateCode: yup.string(),
        name: yup.string().min(3).required(),
        phoneNumber: yup.string().min(10).max(14),
        instagramUserName: yup.string().notRequired(),
        fbUserName: yup.string().notRequired(),
    })
    .required();

const Profile: React.FC<{
}> = () => {
    const user = useSelector((state: AppState) => state.auth.user);
    const storageRef = firebaseRef(LionStorage);
    const [loading, setLoading] = React.useState(false);
    const [picUrl, setPicUrl] = React.useState<string>("");
    const [objectUrl, setObjectUrl] = React.useState<string | undefined>();
    const ref = React.useRef<HTMLInputElement | null>(null);
    const [errrorMessage, setErrorMessage] = React.useState("");
    const dispatch = useDispatch();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({ resolver: yupResolver(schema) });



    const changePhoto = async () => {
        if (loading) return;
        setLoading(true)
        try {

            const fileName = snakeCase(user!.name.trim()).toLowerCase()
            const imageRef = firebaseRef(storageRef, fileName);
            if (ref.current === null) throw new Error("Cannot upload image");
            // if(!ref.current.)
            if (ref.current.files!.length === 0) throw new Error("Cannot upload image");
            const file = ref.current.files![0];

            if (!file) throw new Error("Cannot upload image");
            try {
                const deleted = await deleteObject(imageRef);
                console.log(deleted);
            }
            catch (err1) {
                console.log(err1)
            }
            const uploaded = await uploadBytes(imageRef, file)
            let url = await getDownloadURL(uploaded.ref);
            setPicUrl(url);
            messageUser("Click 'Update' to save changes")
        } catch (err: any) {
            console.log(err);
            messageUser(err.message || "An error occurred")
        }

        setLoading(false)


    }
    const messageUser = (message: string) => {
        dispatch<HomeAction>({ type: 'show-error', errorMessage: message });

    }


    const updateUser: SubmitHandler<FieldValues | {
        name: string;
        stateCode: string;
        profile: string;
        phoneNumber: string;
        instagramUserName?: string;
        fbUserName?: string;
    }> = async (data) => {
        setErrorMessage("");
        setLoading(true);
        try {
            if (!user) {
                console.log("error");
                setLoading(false);
                return;
            }
            user.name = data.name.toLowerCase();
            if (data.profile) user!.profile = data.profile
            if (data.stateCode) {
                user!.stateCode = data.stateCode;
            }
            if (data.phoneNumber) {
                user!.phoneNumber = data.phoneNumber
            }

            if (data.fbUserName) {
                user.fbUserName = data.fbUserName.toLowerCase();
            }
            if (data.instagramUserName) {
                user.instagramUserName = data.instagramUserName.toLowerCase()
            }

            if (picUrl.length > 0) user.picUrl = picUrl;
            const tableName5 = "app-nomination-entry";
            const tableName2 = "app-candidate-entry";
            const nomineesRef = collection(LionAppDb, tableName5);
            const candidatesRef = collection(LionAppDb, tableName2)
            let q = query(collection(LionAppDb, tableName5), where("userId", "==", user!.id));

            const querySnapshot = await getDocs(q);
            q = query(collection(LionAppDb, tableName2), where("candidateId", "==", user!.id));
            const querySnapshot2 = await getDocs(q);
            if (!querySnapshot.empty || !querySnapshot2.empty) {
                const arr = querySnapshot.docs;
                const arr3 = querySnapshot2.docs

                let toSet = arr.map(c => {
                    return setDoc(doc(nomineesRef, c.id), {
                        ...c.data(),
                        user: {
                            id: user.id,
                            name: user.name.toLowerCase(),
                            url: user.picUrl
                        }
                    })
                })
                toSet = toSet.concat(arr3.map(c => {
                    return setDoc(doc(candidatesRef, c.id), {
                        ...c.data(),
                        candidate: {
                            id: user.id,
                            name: user.name.toLowerCase(),
                            url: user.picUrl
                        }
                    })
                }))

                const result = await Promise.all(toSet);
                console.log(result)
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
            details.updatedAt = Date.now();
            details.createdAt = user.createdAt;
            await setDoc(doc(usersRef, user!.id), details);
            dispatch<AuthAction>({ type: "login", user: new User(user.getDetails()), token:  user.id, shouldSet: false })
       
            messageUser("Profile updated Successfully")


        } catch (err: any) {


            // console.log(e.code === AuthErrorCodes.EMAIL_EXISTS);
            // if (e.code === AuthErrorCodes.EMAIL_EXISTS) {
            messageUser(err.message || "An error has occurred");

            // }
        }

        setLoading(false);

    }


    const getDetail = (entry: IEntry) => {
        const value = user!.getDetails()[entry.name];
        if (entry.transformFunction) return entry.transformFunction(value)
        return value
    }

    return (
        <Box>
            <Header title="Profile" />
            <Spacer space={20} />

            <Container maxWidth="sm">
                {!!errrorMessage && (<Typography color="red">{errrorMessage}</Typography>)}

                <input ref={ref} type="file" accept="image/*" id="imgInp" style={{ display: "none" }} onChange={(e) => {
                    if (!e.target) return;
                    if (!e.target.files) return
                    if (e.target.files.length === 0) return;
                    let c = e.target.files[0];
                    setObjectUrl(URL.createObjectURL(c));


                }} />
                <Centered >
                    <Box sx={{ p: 3, textAlign: 'center' }} >
                        <ImageView user={user!} />
                        <Spacer />
                        <Button onClick={() => {
                            if (ref.current) {
                                ref.current.click()
                            }
                        }}>
                            {"Change Photo"}
                        </Button>

                        {!!objectUrl && (<>
                            <Spacer />
                            <Button variant="contained" onClick={changePhoto}>
                                Upload Photo
                            </Button>
                        </>)}

                        {!!objectUrl && (<>
                            <Spacer />
                            <Button variant="contained" color="error" onClick={() => {
                                if (ref.current !== null) {
                                    setObjectUrl(undefined);
                                    ref.current.files = null;


                                }
                            }}>
                                Remove Photo
                            </Button>
                        </>)}



                    </Box>
                </Centered>
                {loading && <LinearProgress />}

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
                                type={entry.type}
                                sx={{
                                    width: '100%'
                                }}

                                {...register(entry.name)}
                                rows={entry.multiline ? 4 : 1}
                                defaultValue={getDetail(entry)}
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
