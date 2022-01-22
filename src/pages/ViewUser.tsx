

import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import { useParams } from "react-router";
import List from '@mui/material/List';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import Chip from '@mui/material/Chip';
import { Helmet } from 'react-helmet';


import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

import Stack from '@mui/material/Stack'
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useDispatch, useSelector } from "react-redux";

import { collection, doc, getDocs, query, where, getDoc } from "firebase/firestore";

import { HomeAction } from '../store/reducers';


// LionApp



import Spacer from '../components/Spacer';
import { LionAppDb } from '../firebaseObjects';
import { AppState } from '../store';
import Header from '../components/Header';
import { User, DefaultUser, NominationEntry, CandidateEntry } from '../models';
import Centered from '../components/Centered';
import { titleCase } from '../helpers';
import ImageView from '../components/ImageView';
import LoadingPageIndicator from '../components/LoadingPageIndicator';

const tableName2 = "app-candidate-entry";
const tableName3 = "app-nomination-entry";


const ViewUser = () => {
    const dispatch = useDispatch();
    let { id } = useParams<{ id: string }>();
    const messageUser = (message: string) => {
        dispatch<HomeAction>({ type: 'show-error', errorMessage: message });

    }
    const appUser = useSelector((state: AppState) => state.auth.user);
  
    const [loading, setLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [user, setUser] = useState<User>(DefaultUser);
    const [nominationEntries, setNominationEntries] = useState<NominationEntry[]>([]);
    const [candidateEntries, setCandidateEntries] = useState<CandidateEntry[]>([]);
    const check = async () => {
        setLoading(true);
        try {
            const userRef = doc(LionAppDb, "app-users", id);
            const userDoc = await getDoc(userRef);

            if (userDoc.exists()) {
                let toCreate: any = userDoc.data();
                toCreate.id = id;
                if (!toCreate.picUrl) toCreate.picUrl = ''
                const theUser = new User(toCreate);
                setUser(theUser);

            }
            else {
                messageUser("Cannot Find User");
                setHasError(true);
                setLoading(false);
                return;
            }

            let q = query(collection(LionAppDb, tableName2), where("candidateId", "==", id));
            const querySnapshot1 = await getDocs(q);

            q = query(collection(LionAppDb, tableName3), where("userId", "==", id));
            const querySnapshot2 = await getDocs(q);



            console.log(querySnapshot1.docs)
            // c
            setCandidateEntries(querySnapshot1.docs.map(d => {

                return {
                    ...d.data(),
                    id: d.id
                } as CandidateEntry;
            }))

            setNominationEntries(querySnapshot2.docs.map(d => {

                return {
                    ...d.data(),
                    id: d.id
                } as NominationEntry;
            }))





        } catch (err) {
            console.log(err);
        }
        setLoading(false)
    }
    useEffect(() => {

        check();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id])

    if (loading) return <LoadingPageIndicator />;
    if (hasError) {
        return (
            <Box>
                <Spacer />

                <Typography>
                    An Error has occurred In Loading
                </Typography>

                <Spacer />
                <Button onClick={check}>
                    Retry
                </Button>
            </Box>
        )

    }
    {
        const name = titleCase(user.name)
        return (<Box >
            <Header title="View User" />
            <Helmet>
            
                <meta
                    property="og:image"
                    content={user.picUrl}
                />
                <meta
                    property="og:description"
                    content={"Vote for People on this platform"}
                />
                <meta
                    property="og:description"
                    content={"Vote for People on this platform"}
                />
                <meta name="image" content={user.picUrl} />
                <link rel="canonical" href={"https://krcquickvote.netlify.app/" + window.location.pathname} />
            </Helmet>
            <Container sx={{ p: 2, mt: 4 }} maxWidth="sm" >
            {appUser!.isAdmin && (
                <Chip label={user.paid ? "Paid" : "Not Paid"} variant={user.paid ? "filled": "outlined"} />
            )}
            <Centered >
                    <Box sx={{ p: 3, textAlign: 'center' }} >
                        <ImageView user={user!} />
                        


                    </Box>
                </Centered>
                <Typography variant='h5' component={'h5'}>
                    {name}
                </Typography>
                <Spacer />
                <Typography variant="h6" component={'h6'}>
                    Nominations
                </Typography>
                {!nominationEntries.length && <Typography variant="caption">
                    No nominations
                </Typography>}
            
                <Stack direction="row" spacing={1}>
              
                    {nominationEntries.map((c, i) => (<Chip label={titleCase(c.category.name)} key={'nomination' + i} />))}
                </Stack>

                <Spacer />
                <Typography variant="h6" component={'h6'}>
                    Contesting
                </Typography>
                {!candidateEntries.length && <Typography variant="caption">
                    This user is not contesting any award
                </Typography>}
           
                <Stack direction="row" spacing={1}>

                    {candidateEntries.map((c, i) => (<Chip label={titleCase(c.category.name)} variant="outlined" key={'candidate-entry-' + i}

                        icon={<span style={{
                            borderRadius: '10px',
                            padding: '2px',
                            minWidth: '20px',
                            backgroundColor: "#1976d2",
                            color: "#FFFFFF",
                            lineHeight: 1,
                            fontFamily: "\"Roboto\",\"Helvetica,\"Arial\",sans-serif"
                        }} >{c.votes} </span>}
                    />))}
                </Stack>
                <List>

                    <ListItem button>
                        <ListItemText primary="State Code" secondary={user.stateCode || "Not Specifed"} />
                    </ListItem>
                    <ListItem button>
                        <ListItemText primary="About" secondary={user.profile || "Not Specifed"} />
                    </ListItem>
                </List>

               { (!!user.fbUserName ||!!user.instagramUserName  ) && <Spacer space={30} /> }
                <Stack direction="row" spacing={1}>

                    {!!user.fbUserName && (<a style={{ textDecoration: "none", color: "#1b74e4" }} href={user.fbUserName} target={'_blank'} rel="noreferrer">
                        <IconButton style={{ textDecoration: "none", color: "#1b74e4" }} >
                            <FacebookIcon style={{ textDecoration: "none", color: "#1b74e4" }} />
                        </IconButton>
                    </a>
                    )}
                    {!!user.instagramUserName && (<a style={{ textDecoration: "none", color: "inherit" }} href={"https://www.instagram.com/" + user.instagramUserName} target={'_blank'} rel="noreferrer">
                        <IconButton style={{ textDecoration: "none", color: "inherit" }} >
                            <InstagramIcon style={{ textDecoration: "none", color: "inherit" }} />
                        </IconButton>
                    </a>)}


                </Stack>
                <Spacer space={30} />

            </Container>
        </Box>);
    }
};

export default ViewUser;
