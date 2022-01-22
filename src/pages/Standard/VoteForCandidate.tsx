import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { useParams } from "react-router";
import List from '@mui/material/List';
// import { blue, red } from '@mui/material/colors';
import Chip from '@mui/material/Chip';
import FaceIcon from '@mui/icons-material/Face';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import { collection, query, getDocsFromServer as getDocs, getDoc, addDoc, setDoc, doc, where, deleteDoc } from "firebase/firestore";

import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import CircularProgress from "@mui/material/CircularProgress";
import { VotingCategory, NominationEntry, CandidateEntry, User } from '../../models';
import Header from '../../components/Header';
import Spacer from '../../components/Spacer';
import { LionAppDb } from '../../firebaseObjects';
import LoadingPageIndicator from '../../components/LoadingPageIndicator';

import { HomeAction } from '../../store/reducers';
import { useDispatch, useSelector } from 'react-redux';
import { titleCase } from '../../helpers';
import AppLink from '../../components/AppLink';
import { AppState } from '../../store';
import LinearProgress from '@mui/material/LinearProgress';
// Header
const tableName1 = "app-voting-category";
const tableName2 = "app-candidate-entry";
const tableName3 = "app-nomination-entry";
const tableName4 = "app-votes";


interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;


    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box >
                    {children}

                </Box>
            )}
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
        sx: {
            fontFamily: 'Lato, sans-serif',
            fontWeight: 'bold',

        }
    };
}



const NomineesList: React.FC<{
    nominees: NominationEntry[];
    user: User;
}> = ({ nominees, user }) => {

    return (<Box style={{
        position: 'relative'
    }}>
        <List>
            {
                nominees.map((c, i) => {
                    return (


                            <ListItem key={'nominee-' + i} button>
                                <ListItemAvatar>
                                    <Avatar alt={c.user.name} src={c.user.url!} />
                                </ListItemAvatar>
                                <ListItemText primary={titleCase(c.user.name)} />

                                {(user.id === c.userId) && <Chip label="You" icon={<FaceIcon />} />}
                           
                           <AppLink to={(user.id === c.userId) ? "/my-profile" : "/view-user/" + c.userId} doNotUseButton>
                                <IconButton style={{ marginRight: '10px' }}>
                                    <VisibilityIcon />
                                </IconButton>

                                </AppLink>

                            </ListItem>
                      
                    )
                })
            }
        </List>
    </Box>);
}

const VotingPanel: React.FC<{
    candidate: CandidateEntry;
    user: User;
    category: VotingCategory;
    onLoading: (loading: boolean) => void;
    loading: boolean;
}> = ({ candidate: c, user, category, loading, onLoading }) => {
    const [votes, setVotes] = useState(0);
    const dispatch = useDispatch();
    const onVote = async () => {
        if (loading) return;
        onLoading(true)
        let add = 1;
        try {
            const q = query(collection(LionAppDb, tableName4), where("categoryId", "==", category.id),
                where("voterId", "==", user!.id));

            const snapshot = await getDocs(q);

            const date = Date.now();

            if (!snapshot.empty) {
                if (!window.confirm("You already voted before, Do you want to rescind previous vote and vote again")) {
                    onLoading(false);
                    return;
                }
            }
            if (snapshot.empty) {
                const entryCreate: any = {
                    category: {
                        id: category.id,
                        name: category.name
                    },
                    voter: {
                        id: user.id,
                        name: user.name
                    },
                    candidate: c.candidate,
                    voterId: user.id,
                    candidateId: c.candidate.id,
                    categoryId: category!.id,
                    createdAt: date,
                    updatedAt: date

                }
                await addDoc(collection(LionAppDb, tableName4), entryCreate)

            }
            else {

                console.log("here")
                await deleteDoc(doc(LionAppDb, tableName4, snapshot.docs[0].id));
                add = -1;
            }
            const candidateRef = collection(LionAppDb, tableName2);
            await setDoc(doc(candidateRef, c.id), {
                ...c,
                votes: c.votes + add,
                updatedAt: date
            })




            setVotes(votes + add);
            onLoading(false);



        } catch (err: any) {
            console.log(err);
            dispatch<HomeAction>({ type: 'show-error', errorMessage: err.message || "An error occurred" });

        }

        dispatch<HomeAction>({ type: 'show-error', errorMessage: add > 0 ? "Vote registered" : "Vote rescinded" });


    }

    return (
        <ListItem

            button
        >
            <ListItemAvatar>
                <Avatar alt={c.candidate.name} src={c.candidate.url!} />
            </ListItemAvatar>
            <ListItemText primary={titleCase(c.candidate.name)} secondary={(c.votes + votes) + " vote(s)"} />

            {(user.id === c.candidateId) && <Chip label="You" icon={<FaceIcon />} />}
                             
            <AppLink to={(user.id === c.candidateId) ? "/my-profile" : "/view-user/" +  c.candidateId}

                doNotUseButton> <IconButton disabled={!category.votingIsActive} style={{ marginRight: '10px' }}>
                    <VisibilityIcon />
                </IconButton>
            </AppLink>

            <IconButton disabled={!category.votingIsActive || loading} onClick={onVote}>
                <ThumbUpIcon />
            </IconButton>

        </ListItem>
    )
}

const CandidateList: React.FC<{
    candidates: CandidateEntry[];
    user: User;

    category: VotingCategory
}> = ({ candidates, category, user }) => {
    const [loading, setLoading] = useState(false);


    return (<Box style={{
        position: 'relative'
    }}>
        {loading && <LinearProgress />}

        <List>
            {
                candidates.map((c, i) => <VotingPanel key={'candidate-' + i} candidate={c} user={user} category={category} loading={loading} onLoading={setLoading} />)
            }
        </List>


    </Box>);
}

const VotingCategoryUserPage = () => {
    const user = useSelector((state: AppState) => state.auth.user);

    const [value, setValue] = React.useState(0);
    // const [title, setTitle] = useState("Admin");
    const [currentCategory, setCurrentCategory] = useState<VotingCategory | undefined>();

    const [nominationIsActive, setNominationIsActive] = useState(false);
    const [votingIsActive, setVotingIsActive] = useState(false);
    const [candidates, setCandidates] = useState<CandidateEntry[]>([]);
    const [nominees, setNominees] = useState<NominationEntry[]>([]);
    const [isNominating, setIsNominating] = useState(false);
    const [loading, setLoading] = useState(true);
    const dispatch = useDispatch();
    let { id } = useParams<{ id: string }>();
    const messageUser = (message: string) => {
        dispatch<HomeAction>({ type: 'show-error', errorMessage: message });

    }

    useEffect(() => {
        console.log([currentCategory, candidates, nominees]);

    }, [currentCategory, candidates, nominees]);

    useEffect(() => {


        const check = async () => {
            setLoading(true);
            try {
                const votingCategoryRef = doc(LionAppDb, tableName1, id);
                const votingCategorySnap = await getDoc(votingCategoryRef);
                if (!votingCategorySnap.exists()) {
                    messageUser("An error occurred - Cannot find data")
                    return;
                }
                const d = votingCategorySnap;
                let q = query(collection(LionAppDb, tableName2), where("categoryId", "==", id));
                const querySnapshot1 = await getDocs(q);

                q = query(collection(LionAppDb, tableName3), where("categoryId", "==", id));
                const querySnapshot2 = await getDocs(q);


                let c: VotingCategory = {
                    id: d.id,
                    ...d.data()
                } as VotingCategory;

                setCurrentCategory(c);

                setNominationIsActive(c.nominationsIsActive);
                setVotingIsActive(c.votingIsActive);

                // c
                setCandidates(querySnapshot1.docs.map(d => {

                    return {
                        ...d.data(),
                        id: d.id
                    } as CandidateEntry;
                }))

                setNominees(querySnapshot2.docs.map(d => {

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
        check();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id])



    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    const onNominate = async () => {
        if (!user) return;
        if (!currentCategory) return;
        if (currentCategory.isRestricted) {
            return window.alert("You need to contact 08146392214 by call or whatsapp to be a candidate for this position");
        }

        if (!(user.phoneNumber)) {
            window.alert("You need to add a phone number to be eligible for nomination, Click on my ptofile")
            return;
        }
        setIsNominating(true);
        const q = query(collection(LionAppDb, tableName3), where("categoryId", "==", id),
            where("userId", "==", user!.id));
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            const date = Date.now();
            const entryCreate: any = {
                category: {
                    id: currentCategory!.id,
                    name: currentCategory!.name
                },
                user: {
                    id: user!.id,
                    name: user!.name,
                    url: user!.picUrl
                },
                isApproved: false,
                userId: user!.id,
                categoryId: currentCategory!.id,
                createdAt: date,
                updatedAt: date


            }

            const docRef = await addDoc(collection(LionAppDb, tableName3), entryCreate)
            const entry: NominationEntry = { ...entryCreate, id: docRef.id }
            setNominees([...nominees, entry])
            messageUser("Successfully become a nominee")

        }
        else {
            messageUser("You've already nominated yourself")
        }

        setIsNominating(false)

    }

    if (loading) {
        return <LoadingPageIndicator />
    }

    return (<Box>
        <Header title={"View Category"} />
        <Container>
            <Spacer space={25} />
            <Typography variant='h5' component={'h5'}>
                {!!currentCategory ? titleCase(currentCategory.name) : "Error"}
            </Typography>
            <Spacer />
            <Typography variant="body2" gutterBottom>
                {currentCategory?.categoryDescription || "Loading"}
            </Typography>

            <Box padding={'10px'}>

                {isNominating ? (<CircularProgress />) : (<Chip label={nominationIsActive ? "Click here to nominate yourself" : "Nomination is closed"}
                    onClick={onNominate}
                    variant={nominationIsActive ? "filled" : "outlined"} />)}
                <br />
                <br />
                <br />
                <Chip label={votingIsActive ? "Currently Accepting Votes" : "Voting is closed"} variant={votingIsActive ? "filled" : "outlined"} />

            </Box>
        </Container>

        <Spacer />

        <Box sx={{ borderBottom: 1, borderColor: 'divider', }} alignContent={'center'} alignItems={'center'} display="flex" justifyContent={'center'}>
            <Box sx={{ maxWidth: 500 }}>
                <Tabs value={value} onChange={handleChange} aria-label="basic tabs example" textColor="inherit"
                    variant="fullWidth">
                    <Tab label="Candidates" {...a11yProps(0)} />

                    <Tab label="Nominees" {...a11yProps(1)} />
                </Tabs>
            </Box>
        </Box>
        <Container>
            <TabPanel value={value} index={0}>
                <CandidateList candidates={candidates}
                    user={user!}
                    category={currentCategory!}
                />
            </TabPanel>


            <TabPanel value={value} index={1}>
                <NomineesList nominees={nominees} user={user!} />
            </TabPanel>
        </Container>

    </Box>);
};

export default VotingCategoryUserPage;
