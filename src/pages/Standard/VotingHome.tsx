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

import { collection, query, getDocsFromServer as getDocs, } from "firebase/firestore";
import { VotingCategory } from '../../models';
import Header from '../../components/Header';

import { reduceString, titleCase } from '../../helpers';
import { HomeAction } from '../../store/reducers';

import { LionAppDb } from '../../firebaseObjects';
import LoadingPageIndicator from '../../components/LoadingPageIndicator';
import AppLink from '../../components/AppLink';



const VotingHome = () => {

    const tableName = "app-voting-category";
    const [categories, setCategories] = useState<VotingCategory[]>([]);
    const [loading, setLoading] = useState(true);
    // const user = useSelector((state: AppState) => state.auth.user);

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


    const messageUser = (message: string) => {
        dispatch<HomeAction>({ type: 'show-error', errorMessage: message });

    }
    if (loading) {
        return <LoadingPageIndicator />
    }

    return (
        <Box>
            <Header title="Home" />
            <Container>
                <List>
                {categories.map((c, i) => {
                    const selected = !!c.winner;
                    return (
                        <AppLink doNotUseButton key={'voting-category-' + i} to={"/voting-category/" + c.id}  >
                        <ListItem  button >
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
                        </AppLink>
                    )
                })}
                </List>
            </Container>
        </Box>
    );
};

export default VotingHome;
