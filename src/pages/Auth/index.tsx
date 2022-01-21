import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import LinearProgress from "@mui/material/LinearProgress";
import { getAuth, signInWithPopup, GoogleAuthProvider} from 'firebase/auth'
import Button from '@mui/material/Button';
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import GoogleIcon from '@mui/icons-material/Google';
import SignUp from './SignUp';
import Centered from '../../components/Centered';
import Login from './Login';
import { LionApp, LionAppDb } from '../../firebaseObjects';
import { AuthAction, HomeAction } from '../../store/reducers';
import { useDispatch } from "react-redux";
import Spacer from '../../components/Spacer';
import { User } from '../../models';

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
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}



const Auth = () => {
  const dispatch = useDispatch();
  const [value, setValue] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const authentication = getAuth(LionApp);
  authentication.useDeviceLanguage();
  const provider = new GoogleAuthProvider();

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    if (loading) return;
    setValue(newValue);
  };

  const onSuccess = async(email: string, name?: string) => {
    let user: User;
    const q = query(collection(LionAppDb, "app-users"), where("email", "==", email));
    const querySnapshot = await getDocs(q);
    if(querySnapshot.empty) {
      let userData = {
        name: name || "Empty",
        email,
        createdAt: Date.now(),
        updatedAt:  Date.now(),
        profile: "",
        votes: 0, isCandidate: false, isAdmin: false, isInstantUser: false
      }
      try {  const docRef = await addDoc(collection(LionAppDb, "app-users"), {
        ...userData

      });
     

      console.log("Document written with ID: ", docRef.id);
      user = new User({...userData, id: docRef.id})

    } catch (e: any) {
      console.error("Error adding document: ", e);
      dispatch<HomeAction>({ type: 'show-error', errorMessage: "Couldn't complete sign in"});
      return;
    }
  
    }
    else {
      let doc = querySnapshot.docs[0];
      let data: any = {...doc.data(), id: doc.id};
      user = new User(data);
   
    }
    dispatch<AuthAction>({ type: "login", user, token: user.id, shouldSet: true })
    dispatch<HomeAction>({ type: 'show-error', errorMessage: "Signed In"});
  }

  // Color.fromRGBO(0x73, 0x80, 0xf3, 1),
  // Color.fromRGBO(0x56, 0x69, 0xff, 1),
  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }

  const onLoginWithGoogle = async () => {
      try {
        const result = await signInWithPopup(authentication, provider);
        
          // This gives you a Google Access Token. You can use it to access the Google API.
          const credential = GoogleAuthProvider.credentialFromResult(result);
          const token = credential?.accessToken || "none";
          // The signed-in user info.
          const user = result.user;
          console.log(user, token);
          onSuccess(user.email || "invalid@gmail.com", user.displayName || "NONE");

  
      
      }
      catch(error: any) {

       console.log(error);
       dispatch<HomeAction>({ type: 'show-error', errorMessage: "Couldn't complete sign in"});
      }
  }

  return (
    <Centered sx={{
      minHeight: '100vh',
      backgroundColor: 'rgb(115,128,243)',
      background: 'linear-gradient(90deg, rgba(115,128,243,1) 0%, rgba(86,105,255,1) 35%, rgba(54,122,255,1) 100%)',
      p: 3
    }}>

      <Card sx={{
        minWidth: 300,
        width: "90%",
        maxWidth: 400
      }}>
        {loading && <LinearProgress />}
        <Box sx={{
          borderBottom: 1, borderColor: 'divider', display: "flex",
          pt: 1,
          alignItems: "center",
          justifyContent: "center"
        }}>
          <Tabs value={value} onChange={handleChange} aria-label="basic tabs example" sx={{

          }}>
            <Tab label="Log In" {...a11yProps(0)} />
            <Tab label="Sign Up" {...a11yProps(1)} />

          </Tabs>
        </Box >

        <TabPanel value={value} index={0}>
          <Login onLoading={setLoading} onSuccess={onSuccess}  />

        </TabPanel>
        <TabPanel value={value} index={1}>
          <SignUp onLoading={setLoading} onSuccess={onSuccess} />
        </TabPanel>
        <Button sx={{backgroundColor:"#d93025"}} variant="contained"  onClick={(e) => {
                        e.preventDefault();
                        onLoginWithGoogle();
                        }}>
                       
                  
                                <GoogleIcon/>
                                <span style={{marginLeft: '10px'}}>Continue with Google </span>
                            </Button>
                            <Spacer />
      </Card>

    </Centered>
  )
}

export default Auth
