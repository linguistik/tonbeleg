# DELETE THIS LATER
Files to change
- [x] `package.json`, the name of the repo
- [x] `capacitor.config.ts`, the `appName`
- [x] `src/backend/firebase-config.ts`, the Firebase Auth settings
- [x] `.github/workflows/**`, run `firebase init hosting:github` again
- [x] `vue.config.ts`

# (Working Title)

## Problem Analysis (UX)

### Persona

### User Story

### Selling Point


## Getting Started


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


## Tips & Tricks

### Force Cache Refresh
Bump the `pwa.assetVersion` value up in `./vue.config.js`.

### Changing the App Name
- `./vue.config.js`: `pwa.name` value
- `./public/index.html`: `<title>` tag
- `./public/index.html`: `<meta name="apple-mobile-web-app-title" content="My app name">`
