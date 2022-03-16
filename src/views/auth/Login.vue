<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ t("general.appname") }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-loading
        :is-open="waitingForRedirectResult"
        cssClass="my-custom-class"
        message="Please wait..."
      >
      </ion-loading>

      <ion-card>
        <ion-card-header>
          <ion-card-title>{{ t("auth.login_noun") }}</ion-card-title>
          <ion-card-subtitle>{{ t("auth.login_cta") }}</ion-card-subtitle>
        </ion-card-header>

        <ion-card-content v-if="errorMessage" class="error-message">
          <ion-text color="danger"> <h1>{{ errorMessage }}</h1></ion-text>
        </ion-card-content>

        <ion-card-content>
          <form @submit.prevent="onEmailLogin">
            <ion-item>
              <ion-label position="floating">{{ t("auth.email") }}</ion-label>
              <ion-input v-model="email"></ion-input>
            </ion-item>
            <ion-item>
              <ion-label position="floating">{{
                t("auth.password")
              }}</ion-label>
              <ion-input v-model="password" type="password"></ion-input>
            </ion-item>

            <form @submit.prevent="onForgotPassword">
              <ion-button
                  type="submit"
                  fill="clear"
                  color="blue"
                  size="small"
                  style="font-size: 8px;"
              >
               Passwort vergessen
              </ion-button>
            </form>


            <ion-button
              expand="block"
              color="primary"
              class="ion-margin-top"
              type="submit"
            >
              Anmelden
            </ion-button>
          </form>
        </ion-card-content>

        <ion-card-content>
          <form @submit.prevent="onGoogleLogin">
            <ion-button
                expand="block"
                color="primary"
                class="ion-margin-top"
                type="submit"
            >
              Google Login
            </ion-button>
          </form>
        </ion-card-content>

        <ion-card-content>
          <form @submit.prevent="onRegister">
            <ion-button
              expand="block"
              color="success"
              class="ion-margin-top"
              type="submit"
            >
              Registrieren
            </ion-button>
          </form></ion-card-content
        >

        <ion-card-content>
          <ion-checkbox @ionChange="changeRememberMe"> </ion-checkbox>
          <ion-text> Eingeloggt bleiben </ion-text>
        </ion-card-content>
      </ion-card>
    </ion-content>
  </ion-page>
</template>


<script lang="ts">
import firebase from "@/backend/firebase-config";

import { defineComponent, ref } from "vue";
import router from "@/router";
import { useI18n } from "vue-i18n";

import {
  IonPage,
  IonHeader,
  IonContent,
  IonCard,
  IonToolbar,
  IonTitle,
  IonCardSubtitle,
  IonCardTitle,
  IonCardHeader,
  IonCardContent,
  IonInput,
  IonButton,
  IonLabel,
  IonItem,
  IonLoading,
  IonCheckbox,
  IonText,
  alertController,
  onIonViewWillLeave,
  onIonViewDidEnter,
} from "@ionic/vue";
import { useMenuSettings } from "@/scripts/ionicVueSettings/menuSettings";

export default defineComponent({
  name: "LoginForm",

  components: {
    IonPage,
    IonHeader,
    IonContent,
    IonCard,
    IonToolbar,
    IonTitle,
    IonCardSubtitle,
    IonCardTitle,
    IonCardHeader,
    IonCardContent,
    IonInput,
    IonButton,
    IonLabel,
    IonItem,
    IonLoading,
    IonCheckbox,
    IonText,
  },

  setup() {
    // multi-lingual support
    const { t } = useI18n();

    const {toggleSwipeMenu} = useMenuSettings();
    onIonViewWillLeave(()=>toggleSwipeMenu.value = true);
    onIonViewDidEnter(()=>toggleSwipeMenu.value = false);

    let rememberMe = false;
    const changeRememberMe = (event: any) => {
      rememberMe = event.detail.checked;
    };

    /**
     * sends user to license page on first login
     */
    const routeToTabs = async () => {
      const db = firebase.firestore();
      const currentUser = firebase.auth().currentUser;
      if (currentUser == null) return;
      const userUID = currentUser.uid;
      db.collection("users")
        .doc(userUID)
        .get()
        .then(async (doc) => {
          if (doc.exists && doc.get("license")) {
            router.push("/tabs/record");
          } else {
            const alert = await alertController.create({
              message: "Bitte stelle deine Lizenz ein.",
              buttons: [
                {
                  text: "OK",
                },
              ],
            });
            await alert.present();
            router.push("/tabs/tabdataprotection");
          }
        });
    };

    const waitingForRedirectResult = ref(true);

    //waits for firebase authentification result
    firebase
      .auth()
      .getRedirectResult()
      .then((results) => {
        console.log("redirect results:", results.user);
        waitingForRedirectResult.value = false;
        routeToTabs();
      });

    // declare reactive variables
    const email = ref("");
    const password = ref("");
    const errorMessage = ref("");

    /**
     * logs in with email and password
     */
    const onEmailLogin = async () => {
      try {
        await firebase
          .auth()
          .setPersistence(
            rememberMe
              ? firebase.auth.Auth.Persistence.LOCAL
              : firebase.auth.Auth.Persistence.NONE
          )
          .then(() => {
            firebase
              .auth()
              .signInWithEmailAndPassword(email.value, password.value)
              .then(() => {
                routeToTabs();
              })
              .catch((err) => {
                errorMessage.value = err.message;
              });
          });

      } catch (err) {
        errorMessage.value = err.message;
        console.log("error", errorMessage.value);

      }
    };

    /**
     * logs in with google account
     */
    const onGoogleLogin = async () => {
      await firebase
        .auth()
        .setPersistence(
          rememberMe
            ? firebase.auth.Auth.Persistence.LOCAL
            : firebase.auth.Auth.Persistence.NONE
        )
        .then(() => {
          const provider = new firebase.auth.GoogleAuthProvider();
          return firebase.auth().signInWithRedirect(provider);
        })
        .catch((error) => {
          console.log(error);
        });
    };

    /**
     * redirects to signup page
     */
    const onRegister = async () => {
      router.push("/signup");
    };

    /**
     * redirects to forgotPassword page
     */
    const onForgotPassword = ()=>{
      router.push("/forgotPassword");
    };

    /**
     * redirects to changePassword page
     */
    const onChangePassword = ()=>{
      router.push("/changePassword");
    }

    return {
      t,
      email,
      password,
      errorMessage,
      onEmailLogin,
      onGoogleLogin,
      onRegister,
      onForgotPassword,
      onChangePassword,
      waitingForRedirectResult,
      changeRememberMe,
    };
  },
});
</script>

