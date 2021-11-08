/** Firebase */
import firebase from 'firebase/app';
import '@firebase/auth';
import 'firebase/analytics';

// For Firebase JS SDK v7.20.0 and later
const firebaseConfig = {
  apiKey: process.env.VUE_APP_APIKEY || '',
  authDomain: process.env.VUE_APP_AUTHDOMAIN || '',
  projectId: process.env.VUE_APP_PROJECTID || '',
  storageBucket: process.env.VUE_APP_BUCKETID || '',
  messagingSenderId: process.env.VUE_APP_MSGSENDID || '',
  appId: process.env.VUE_APP_APPID || ''
};


// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

// load it by: `import firebase from '@/components/auth/firebase';`
export default firebase;
