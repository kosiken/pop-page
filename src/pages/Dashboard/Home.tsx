import React, { useState, useEffect } from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { useDispatch } from "react-redux";
import Badge from '@mui/material/Badge';
import FaceIcon from '@mui/icons-material/Person';
import DialogTitle from '@mui/material/DialogTitle';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { collection, query, getDocsFromServer as getDocs, } from "firebase/firestore";
import { VotingCategory,  DefaultUser } from '../../models';
import Header from '../../components/Header';
import Spacer from '../../components/Spacer';
import { reduceString, titleCase } from '../../helpers';
import AddCategoryForm from '../../components/AddCategoryForm';
import { HomeAction } from '../../store/reducers';

import { LionAppDb } from '../../firebaseObjects';
import LoadingPageIndicator from '../../components/LoadingPageIndicator';



const Home = () => {
    const tableName = "app-voting-category";
    const [categories, setCategories] = useState<VotingCategory[]>([]);
    const [open, setOpen] = React.useState(false);
    const [loading, setLoading] = useState(true);
    const [currentCategory, setCurrentCategory] = useState<VotingCategory | undefined>();
    const [index, setIndex] = useState(-1);


    const dispatch = useDispatch();

    useEffect(() => {
        async function getData() {
            try {
                const q = query(collection(LionAppDb, tableName));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    setCategories(querySnapshot.docs.map(d => {

                        let c = {
                            ...d.data(),
                            id: d.id
                        }
                        return c as VotingCategory;
                    }))
                }
                else {
                    messageUser("No categories found")
                }
            }
            catch (err) {
                messageUser("An error occurred");
                console.log("err");
            }

            setLoading(false);

        }

        getData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
      if(!!currentCategory)  setOpen(!!currentCategory);
    }, [currentCategory])

    useEffect(()=> {
        if(!open) {
            setIndex(-1);
            setCurrentCategory(undefined)
        }
    }, [open])

    const handleClickOpen = () => {
        setOpen(true);
    };



    const handleClose = () => {
        setOpen(false);
    };



    const user = DefaultUser;

    const messageUser = (message: string) => {
        dispatch<HomeAction>({ type: 'show-error', errorMessage: message });

    }


    if (loading) {
        return <LoadingPageIndicator />
    }
    return (<Box>
        <Header user={user} title="Admin" />
        <Container>
            <Spacer />
            <List>
                {categories.map((c, i) => {
                    const selected = !!c.winner;
                    return (
                        <ListItem key={'voting-category-' + i} button onClick={() => {
                            setIndex(i);
                            setCurrentCategory(c);
                            
                        }} >
                            <ListItemIcon>
                                <FaceIcon />
                            </ListItemIcon>

                            <ListItemText primary={titleCase(c.name)} sx={{
                                color: selected ? "#336CFB" : "inherit",
                                "& .MuiTypography-root": {
                                    fontSize: 14
                                }

                            }}
                                secondary={reduceString(c.categoryShortText || c.categoryDescription, 15)}
                            />
                            {(c.numOfNominationEntries > 0)
                                && <Badge color="primary" badgeContent={c.numOfNominationEntries} />
                            }

                        </ListItem>
                    )
                })}
            </List>

            <Dialog open={open} onClose={handleClose} >
                <DialogTitle>Create Category</DialogTitle>
                <DialogContent>
                    <AddCategoryForm user={user} onCreate={(s, r, v, i) => {
                        console.log(s, r, v)
                        if (s) {
                            setCategories([...categories, v]);
                        }
                        else {
                            let c = [...categories];
                            c[i!] = v;
                            setCategories(c);
                        }

                        messageUser(r);
                    }}
                        db={LionAppDb}
                        onError={(reason) => {

                            messageUser(reason)
                        }}
                        index={index}
                        votingCategory={currentCategory}
                    />
                </DialogContent>
            </Dialog>
            <Box sx={{
                position: 'fixed', width: 100, height: 100,
                bottom: -35,
                right: 0,
                zIndex: 9999
            }}>
                <Fab
                    aria-label="save"
                    color="primary"
                    onClick={handleClickOpen}
                >
                    <AddIcon />
                </Fab>
            </Box>
        </Container>
    </Box>
    );
};

export default Home;
