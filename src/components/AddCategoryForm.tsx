import React from 'react';
import * as yup from "yup";
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import LinearProgress from "@mui/material/LinearProgress";
import Box from '@mui/material/Box';
import { collection, query, where, getDocsFromServer as getDocs, addDoc, setDoc, doc } from "firebase/firestore";
// import clone from 'lodash/clone'
import Button from '@mui/material/Button';
import { FieldValues, useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { User, VotingCategory } from '../models';


import Spacer from './Spacer';
import { Firestore } from 'firebase/firestore';
import { titleCase } from '../helpers';
import AppLink from './AppLink';




const schema = yup
    .object({
        categoryDescription: yup.string().required().min(4).max(30),
        categoryShortText: yup.string().min(4),
        name: yup.string().min(3).required(),


    })


const entries = [
    {
        name: "name",
        required: true,
        multiline: false,
        placeholder: "Name of the Category",
        title: "Name"
    },
    {
        name: "categoryDescription",
        title: "Category Description",
        required: true,
        multiline: true,
        placeholder: "Describe the Category"

    },
    {
        name: "categoryShortText",
        title: "Category Short",
        required: true,
        multiline: false,
        placeholder: "A short text for category"

    },

]

const AddCategoryForm: React.FC<{
    onCreate: (success: boolean, reason: string, category: VotingCategory, index?: number) => void;
    user: User;
    onError: (reason: string) => void;
    db: Firestore;
    votingCategory?: VotingCategory
    index?: number
}> = ({
    onCreate,
    user,
    onError, db, votingCategory,
    index = -1
}) => {
        const tableName = "app-voting-category";
        const [loading, setLoading] = React.useState(false);

        const {
            register,
            handleSubmit,
            formState: { errors },
        } = useForm({ resolver: yupResolver(schema) });

        const createCategory: SubmitHandler<FieldValues | {
            name: string;
            categoryDescription: string;
            categoryShortText: string;
        }> = async (data) => {

            setLoading(true);
            try {
                let categoryCreate = {

                    name: data.name.toLowerCase(),
                    categoryDescription: data.categoryDescription,
                    categoryShortText: data.categoryShortText,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                    createdBy: {
                        id: user.id,
                        name: user.name.toLowerCase()
                    },
                    numOfCandidates: 0,
                    numOfNominationEntries: 0,

                    votingIsActive: true,
                    nominationsIsActive: true

                }
                if (!votingCategory) {
                    const q = query(collection(db, tableName), where("name", "==", categoryCreate.name));

                    const querySnapshot = await getDocs(q);
                    if (!querySnapshot.empty) {
                        throw new Error(`Category ${data.name} already exist`)

                    }
                    const docRef = await addDoc(collection(db, tableName), categoryCreate);


                    let category: VotingCategory = {
                        ...categoryCreate,
                        name: titleCase(categoryCreate.name),
                        id: docRef.id
                    };

                    onCreate(true, category.name + " Created Successfully", category);
                }
                else {
                    const currentCategory = votingCategory!;
                    let categoryCreate: any = {

                        ...currentCategory,
                        name: data.name.toLowerCase(),
                        categoryDescription: data.categoryDescription,
                        categoryShortText: data.categoryShortText,
                        updatedAt: Date.now(),


                    }
                    console.log(votingCategory)
                    let id = currentCategory.id.slice()
                    delete categoryCreate.id;
                    const votingCategoryRef = collection(db, tableName);
                    await setDoc(doc(votingCategoryRef, id), categoryCreate);
                    categoryCreate.id = currentCategory.id;
                    onCreate(false, categoryCreate.name, categoryCreate as VotingCategory, index);


                }

            } catch (err: any) {
                onError(`An error occurred while ${!!votingCategory ? 'updating' : 'creating'}, please check your internet connection or contact support`)
                throw err;
            }

            setLoading(false);

        }
        return (
            <Box sx={{ minWidth: { sm: 450, xs: 300 } }}>
                {loading && <LinearProgress />}
                <form onSubmit={handleSubmit(createCategory)}>
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
                                defaultValue={!!votingCategory ? titleCase(votingCategory[entry.name]) : ""}

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

                {votingCategory && (
                    <React.Fragment>
                        <Spacer />

                        <AppLink to={"/voting-category/" + votingCategory.id} >
                            View</AppLink>
                    </React.Fragment>)}
            </Box>
        );
    };

export default AddCategoryForm;
