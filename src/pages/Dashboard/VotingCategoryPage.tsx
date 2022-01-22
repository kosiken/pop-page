import React, { useState, useEffect } from 'react';
import FormGroup from '@mui/material/FormGroup';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { useParams } from "react-router";
import List from '@mui/material/List';
import { blue, green, red } from '@mui/material/colors';
import IconButton from '@mui/material/IconButton';
// import VisibilityIcon from '@mui/icons-material/Visibility';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';

import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import AddIcon from '@mui/icons-material/Add';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import { collection, query, getDocsFromServer as getDocs, getDoc, addDoc, setDoc, doc, where } from "firebase/firestore";
import Fab from '@mui/material/Fab';
import * as yup from "yup";
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import LinearProgress from "@mui/material/LinearProgress";
import { VotingCategory, IEntry, Vote, NominationEntry, CandidateEntry, User, IUser } from '../../models';
import Header from '../../components/Header';
import Spacer from '../../components/Spacer';
import { LionAppDb } from '../../firebaseObjects';
import LoadingPageIndicator from '../../components/LoadingPageIndicator';

import { HomeAction } from '../../store/reducers';
import { useDispatch } from 'react-redux';
import { getDate, titleCase } from '../../helpers';
import { yupResolver } from '@hookform/resolvers/yup';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import AppLink from '../../components/AppLink';
// Header
const tableName1 = "app-voting-category";
const tableName2 = "app-candidate-entry";
const tableName3 = "app-nomination-entry";
const tableName4 = "app-votes";

const schema = yup
    .object({
        email: yup.string().email().required().min(4).max(40),
        profile: yup.string().min(4),
        name: yup.string().min(3).required(),
        stateCode: yup.string(),
        phoneNumber: yup.string().min(10).max(14).required()


    })


const entries: IEntry[] = [
    {
        name: "name",
        required: true,
        multiline: false,
        placeholder: "Name of the Candidate",
        title: "Name *",
        defaultValue: "",
        type: "text"
    },
    {
        name: "email",
        title: "Email *",
        required: true,
        multiline: false,
        placeholder: "Email of the  Category",
        defaultValue: `ins_${Date.now()}@quickvote.com`,
        type: "email"

    },
    {
        name: "profile",
        title: "Profile",
        required: false,
        multiline: true,
        placeholder: "The profile of the candidate",
        defaultValue: "No Profile",
        type: "text"
    },
    {
        name: "stateCode",
        title: "State Code",
        required: false,
        multiline: false,
        placeholder: "The state code of the candidate",
        defaultValue: "KD/21A/",
        type: "text"

    },
    {
        name: "phoneNumber",
        title: "Phone Number",
        required: true,
        multiline: false,
        placeholder: "081234567890",
        defaultValue: "",
        type: "tel"
    }



]

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




const VotersList: React.FC<{
    voters: Vote[]
}> = ({voters}) => {

    return (<Box style={{
        position: 'relative'
    }}>
        <List>
            {
                voters.map((v, i) => (
                    <ListItem>
                        <ListItemText primary={titleCase(v.voter.name)} secondary={getDate(v.createdAt)} />
                    </ListItem>
                ))
            }
        </List>


    </Box>);
}

const NomineePanel: React.FC<{

    onLoading: (loading: boolean) => void;
    loading: boolean;
    nominee: NominationEntry;
    onCreate: (entry: CandidateEntry) => void;
}> = ({ onLoading, loading, nominee, onCreate }) => {
    const [isApproved, setIsApproved] = useState(nominee.isApproved);

    const createCandidate = async () => {
        if (loading) return;
        onLoading(true);
        const q = query(collection(LionAppDb, tableName2), where("categoryId", "==", nominee.categoryId),
            where("candidateId", "==", nominee.userId));

        const snapshot = await getDocs(q);

        const date = Date.now();

        if (snapshot.empty) {
            let toCreate = {
                candidate: nominee.user,
                category: nominee.category,
                categoryId: nominee.categoryId,
                candidateId: nominee.userId,
                votes: 0,
                createdAt: date,
                updatedAt: date

            }

            const d = await addDoc(collection(LionAppDb, tableName2), toCreate);

            const candidateRef = collection(LionAppDb, tableName3);
            await setDoc(doc(candidateRef, nominee.id), {
                ...nominee,
                isApproved: true,
            })


            setIsApproved(true);
            onCreate({ ...toCreate, id: d.id });


        }
        onLoading(false);

    }
    return (<ListItem >
        <ListItemAvatar>
            <Avatar />
        </ListItemAvatar>
        <ListItemText primary={titleCase(nominee.user.name)} />

        <AppLink style={{
            marginRight: '10px'
        }}
            to={"/candidate/" + nominee.userId} doNotUseButton>

            <IconButton style={{ marginRight: '10px' }}>
                <VisibilityIcon />
            </IconButton>

        </AppLink>


        <IconButton disabled={isApproved || loading} onClick={createCandidate} >
            <ThumbUpIcon />
        </IconButton>

    </ListItem>
    )
}

const NomineesList: React.FC<{
    nominees: NominationEntry[]
    onCreate: (c: CandidateEntry) => void;
}> = ({ nominees, onCreate }) => {

    const [loading, setLoading] = useState(false);


    return (<Box style={{
        position: 'relative'
    }}>
        {loading && <LinearProgress />}
        <List>
            {
                // key={'nominee-' + i}
                nominees.map((c, i) => <NomineePanel key={'nominee-' + i} nominee={c} onLoading={setLoading} onCreate={onCreate} loading={loading} />
                )
            }
        </List>
    </Box>);
}

const CandidateList: React.FC<{
    candidates: CandidateEntry[];
    onCreate: (success: boolean, reason: string, category: CandidateEntry, index?: number) => void;
    category?: VotingCategory,
    onError: (message: string) => void;
}> = ({ candidates, onCreate, category, onError }) => {

    const [open, setOpen] = React.useState(false);

    const [loading, setLoading] = React.useState(false);
    const [candidateId, setCandidateId] = useState("");
    const [user, setUser] = useState<CandidateEntry | undefined>();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({ resolver: yupResolver(schema) });


    const handleClickOpen = () => {
        setOpen(true);
    };



    const handleClose2 = () => {
        setUser(undefined);
        setCandidateId("");

    };




    const handleClose = () => {
        setOpen(false);
    };

    const createCandidate: SubmitHandler<FieldValues | {
        name: string;
        email: string;
        profile: string;
        stateCode: string;
        phoneNumber: string;
    }> = async (data) => {
        if (!category) return;
        console.log(data)
        setLoading(true)
        try {
          
            let createUser: any = {
                ...data,
                name: data.name.trim().toLowerCase(),
                isInstantUser: true,
                isAdmin: false,
                createdAt: Date.now(),
                updatedAt: Date.now(),
                isCandidate: true,
                votes: 0,
                phoneNumber: data.phoneNumber.trim()

            }

            const docRef = await addDoc(collection(LionAppDb, "app-users"), {
                ...createUser

            });
            createUser.id = docRef.id

            const user = new User(createUser as IUser);

            let data2: any = {
                candidate: {
                    id: user.id,
                    name: user.name

                },
                category,
                categoryId: category.id,
                candidateId: user.id,
                createdAt: Date.now(),
                updatedAt: Date.now(),
                votes: 0,

            }
            const docRef2 = await addDoc(collection(LionAppDb, tableName2), data2)


            data2.id = docRef2.id;
            const categoriesRef = collection(LionAppDb, tableName1);
            let update: any = { ...category }
            delete update.id;
            update.numOfCandidates = category.numOfCandidates + 1;
            update.updatedAt = Date.now();

            await setDoc(doc(categoriesRef, category.id), update)

            onCreate(true, `Candidate ${titleCase(user.name)} created Successfully`, data2 as CandidateEntry, -1)



        }
        catch (err: any) {
            onError(err.message || "An error occurred")
        }
        setLoading(false)
    }

    const dialog = (
        <Dialog open={open} onClose={handleClose} >
            <DialogTitle>Create Category</DialogTitle>
            <DialogContent>
                <Box sx={{ minWidth: { sm: 450, xs: 300 } }}>
                    {loading && <LinearProgress />}
                    <form onSubmit={handleSubmit(createCandidate)}>
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
                                    defaultValue={entry.defaultValue}
                                   
                                />
                            </FormControl>
                        ))}

                        <Spacer />
                        <div style={{
                            textAlign: 'center'
                        }}>
                            <Button type="submit" variant="contained">Continue</Button>


                        </div>

                    </form>

                </Box>
            </DialogContent>


        </Dialog>
    )

    const dialog2 = (
        <Dialog open={!!user} onClose={handleClose2}>

            <DialogTitle>{!!user ? (titleCase(user.candidate.name)) : "Error"}</DialogTitle>
            <Box sx={{ minWidth: { sm: 450, xs: 300 } }}>
                <List sx={{ pt: 0 }}>
                    <AppLink to={"/view-user/" + candidateId} doNotUseButton>
                        <ListItem>
                            <ListItemAvatar> <Avatar sx={{ bgcolor: green[100], color: green[600] }}>
                                <ThumbUpIcon />
                            </Avatar>
                            </ListItemAvatar>
                            <ListItemText primary={`Votes -> ${user?.votes}`} />

                        </ListItem>

                        <ListItem button >
                            <ListItemAvatar>
                                <Avatar sx={{ bgcolor: blue[100], color: blue[600] }}>
                                    <VisibilityIcon />
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText primary={"View User"} />
                        </ListItem>
                    </AppLink>
                    <ListItem button onClick={() => {
                        window.alert("Call or send a message on whatsapp to 08146392214 to delete candidate")
                    }}>
                        <ListItemAvatar>
                            <Avatar sx={{ bgcolor: red[100], color: red[600] }}>
                                <DeleteIcon />
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText primary={"Delete Candidate"} />
                    </ListItem>

                </List>
            </Box>

            <Spacer />

        </Dialog>
    )
    return (<Box style={{
        position: 'relative'
    }}>

        <List>
            {
                candidates.map((c, i) => {
                    return (
                        <ListItem button onClick={() => {
                            setUser(c);
                            setCandidateId(c.candidateId);

                        }}
                            key={'candidate-' + i}
                        >
                            <ListItemAvatar>
                                <Avatar />
                            </ListItemAvatar>
                            <ListItemText primary={titleCase(c.candidate.name)} secondary={getDate(c.updatedAt)} />
                        </ListItem>
                    )
                })
            }
        </List>



        <Box sx={{
            position: 'fixed', width: 200, height: 100,
            bottom: -35,
            right: 0,
            zIndex: 9999
        }}>
            <Fab
                variant="extended" size="medium"
                aria-label="save"
                color="primary"
                onClick={handleClickOpen}
            >
                <AddIcon sx={{ mr: 1 }} />
                Add Candidate
            </Fab>
        </Box>
        {dialog}
        {dialog2}
    </Box>);
}

const VotingCategoryPage = () => {
   

    const [value, setValue] = React.useState(0);
    // const [title, setTitle] = useState("Admin");
    const [currentCategory, setCurrentCategory] = useState<VotingCategory | undefined>();

    const [nominationIsActive, setNominationIsActive] = useState(false);
    const [votingIsActive, setVotingIsActive] = useState(false);
    const [candidates, setCandidates] = useState<CandidateEntry[]>([]);
    const [nominees, setNominees] = useState<NominationEntry[]>([]);
    const [voters, setVoters] = useState<Vote[]>([]);
    const [loading, setLoading] = useState(true);
    const dispatch = useDispatch();
    let { id } = useParams<{ id: string }>();
    const messageUser = (message: string) => {
        dispatch<HomeAction>({ type: 'show-error', errorMessage: message });

    }

    useEffect(() => {
        console.log([currentCategory, candidates, nominees, voters]);

    }, [currentCategory, candidates, nominees, voters]);

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


                q = query(collection(LionAppDb, tableName4), where("categoryId", "==", id));
                const querySnapshot3 = await getDocs(q);

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


                setVoters(querySnapshot3.docs.map(d => {

                    return {
                        ...d.data(),
                        id: d.id
                    } as Vote;
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


    if (loading) {
        return <LoadingPageIndicator />
    }

    return (<Box>
        <Header title={"View Category"} />
        <Container>
            <Spacer />
            <Typography variant='h5' component={'h5'}>
                {!!currentCategory ? titleCase(currentCategory.name) : "Error"}
            </Typography>
   
            <Box padding={'10px'}>
                <FormGroup>
                    <FormControlLabel control={<Checkbox onChange={(e, checked) => {
                        setNominationIsActive(checked)
                    }} checked={nominationIsActive} />} label="Nomination is active" />



                    <FormControlLabel onChange={(e, checked) => {
                        setVotingIsActive(checked)
                    }} control={<Checkbox checked={votingIsActive} />} label="Voting is active" />
                </FormGroup>
            </Box>
        </Container>

        <Spacer />

        <Box sx={{ borderBottom: 1, borderColor: 'divider', }} alignContent={'center'} alignItems={'center'} display="flex" justifyContent={'center'}>
            <Box sx={{ maxWidth: 500 }}>
                <Tabs value={value} onChange={handleChange} aria-label="basic tabs example" textColor="inherit"
                    variant="fullWidth">
                    <Tab label="Candidates" {...a11yProps(0)} />

                    <Tab label="Nominees" {...a11yProps(1)} />
                    <Tab label="Votes" {...a11yProps(2)} />
                </Tabs>
            </Box>
        </Box>
        <Container>
        <TabPanel value={value} index={0}>
            <CandidateList onCreate={(s, r, c, i) => {
                console.log(s, r, c, i);
                messageUser(r);
                setCandidates([...candidates, c])
                if (!!currentCategory) setCurrentCategory({ ...currentCategory, numOfCandidates: currentCategory?.numOfCandidates + 1 || 1 });
            }} candidates={candidates}
                category={currentCategory}
                onError={messageUser}
            />
        </TabPanel>


        <TabPanel value={value} index={1}>
            <NomineesList nominees={nominees} onCreate={(c) => {
                setCandidates([...candidates, c]);
                messageUser("Candidate " + c.candidate.name + " created")
            }} />
        </TabPanel>

        <TabPanel value={value} index={2}>
            <VotersList voters={voters} />
        </TabPanel>
        </Container>
    </Box>);
};

export default VotingCategoryPage;
