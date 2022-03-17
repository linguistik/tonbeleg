[![Join the chat at https://gitter.im/linguistik/community](https://badges.gitter.im/linguistik/community.svg)](https://gitter.im/linguistik/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)


![logo](https://github.com/linguistik/tonbeleg/blob/main/public/img/icons/android-chrome-512x512.png)


# Datenspende-App für Tonbelege
This app collects data to preserve dialects and languages and provides them to research facilities.
## Problem Analysis (UX)
This "Datenspende-App" offers the user the possibility to record, edit and release sound recordings for further use. The focus is on the preservation of rare languages and dialects. Users can provide precise information about their personal data for better sorting of the voice recordings. The licensing conditions can also be customised. There is also an interface for uploading external files into the database.

### Usage
This project is primarily intended to be used by people who speak a rare language or dialect in order to preserve it. The entry of personal data is recommended in order to simplify subsequent filtering of the data. Registration can be done with an email address in the app or with the help of an account previously registered with Google. 

### Selling Point
The current status of the app ensures a smooth recording of the audio documents. A view of the uploaded files with a suitable interface for uploading external audio files is also available. The local files are displayed in an extra view, where you can also cut, rename, delete and play back the audio slips.



### Firebase Credentials
Create the file `.env.local` and add the firebase configuration 
(See https://console.firebase.google.com/project/tonbeleg-9a18f/settings/general/web:OTFlNzcyZTYtODJmNi00Y2IwLWExODQtYzViOWIxYWY5N2Zh)

```
NODE_ENV=local
VUE_APP_APIKEY=TheApiKeyFromFirebase
VUE_APP_AUTHDOMAIN=TheAuthDomainInFirebase
VUE_APP_PROJECTID=TheGCPProjectID
VUE_APP_BUCKETID=TheBucketEndpoint
VUE_APP_MSGSENDID=ThemessagingSenderId
VUE_APP_APPID=TheFirebaseAppID
```

### Start the local development server
```sh
yarn install
yarn serve
# ionic serve
```

## Project Information

### Project Management
- [x] Github: [https://github.com/linguistik/tonbeleg](https://github.com/linguistik/tonbeleg)

### Licence
- [x] The project is licensed under [Apache License 2.0](LICENSE).
- [x] Contributors sign a CLA on the first PR

### Firebase Backend
- [x] SPA Website: [tonbeleg.web.de](https://tonbeleg-9a18f.web.app/)
- [x] [Firebase Console](https://console.firebase.google.com/project/tonbeleg-9a18f/)
- [x] [Cloud Firestore](https://console.firebase.google.com/project/tonbeleg-9a18f/firestore) is the Multi-Region `eur3` consisting of `europe-west1` (Belgium) and `europe-west4` (The Netherlands).

### Useful Commands
- Install Firebase globally on your computer: `npm install -g firebase-tools`
- Login into Google/Firebase: `firebase login`
- Initialize firebase project: `firebase init`
- Deploy web app: `yarn deploy`


## Folders and Files

### Git
- `.gitignore`

### Yarn
- `package.json`
- `yarn.lock`

### Javascript
- `babel.config.js` (ES2015)
- `tsconfig.json`  (TypeScript)
- `.browserslistrc` (Browsers)

### Unit Testing
- `.eslintrc.js`
- `cypress.json`
- `jest.config.ts`

### Firebase
- `.firebaserc`
- `firebase.json`
- `storage.rules` (Storage)
- `firestore.json` (FireStore)
- `firestore.indexes.json` (FireStore)
- `.github/workflows/firebase-hosting-merge.yml`  (Deployment)
- `.github/workflows/firebase-hosting-pull-request.yml`  (Deployment)

### Ionic
- `ionic.config.json` (UI Components)
- `capacitor.config.ts` 



