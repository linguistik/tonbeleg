/** PWA */
import './registerServiceWorker';

/** Load packages */
import { createApp, h } from 'vue';
import App from './App.vue';

/** Add everything together */
const app = createApp({
  render: () => h(App)
});

/** Vue Router */
import router from '@/router';
app.use(router);

/** Ionic */
import { IonicVue } from '@ionic/vue';
app.use(IonicVue);

/** i18n */
import i18n from '@/translations';
app.use(i18n);

/** Mount the app */
router.isReady().then(() => {
  app.mount('#app');
});

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

/* Theme variables */
import './theme/variables.css';


/** Call `getRedirectResult` when app starts
 * see views/auth/Login.vue, onGoogleLogin/signInWithRedirect
 *//*
import firebase from '@/backend/firebase-config';
firebase.auth().getRedirectResult()
.then((results) => {
  console.log("redirect results:", results.user)
  router.push("/tabs/record");
})
*/