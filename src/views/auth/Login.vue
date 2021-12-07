<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ t("general.appname") }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
<ion-loading
    :is-open="isOpenRef"
    cssClass="my-custom-class"
    message="Please wait..."
  >
  </ion-loading>

      <ion-card>
        <ion-card-header>
          <ion-card-title>{{ t("auth.signup_noun") }}</ion-card-title>
          <ion-card-subtitle>{{ t("auth.signup_cta") }}</ion-card-subtitle>
        </ion-card-header>

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
          <form @submit.prevent="onRegister">
            <ion-button
              expand="block"
              color="primary"
              class="ion-margin-top"
              type="submit"
            >
              Registrieren
            </ion-button>
          </form></ion-card-content
        >

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
  IonLoading
} from "@ionic/vue";

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
    IonLoading
  },

  setup() {
    // multi-lingual support
    const { t } = useI18n();



//2 threaded idea, problem: data races, we need something like atomic{...}

// wait                              //start getting redirect result
//stop if other thread found result  //tell other thread that we found result and set isOpenRef = false
//set isOpenRef = true

const isOpenRef = ref(true);
firebase.auth().getRedirectResult()
.then((results) => {
  console.log("redirect results:", results.user)
  isOpenRef.value = false;
  router.push("/tabs/record");
})



    // other variables
    const debugVerbose = ref(true);

    // declare reactive variables
    const email = ref("");
    const password = ref("");
    const errorMessage = ref("");

    const onEmailLogin = async () => {
      //console.log("user", firebase.auth().currentUser);
      try {
        await firebase
          .auth()
          .setPersistence(firebase.auth.Auth.Persistence.LOCAL)
          .then(() => {
            firebase
              .auth()
              .signInWithEmailAndPassword(email.value, password.value).then(()=>router.push("/tabs/record"));
        
          });
        //if(debugVerbose.value){console.log(username);}
      } catch (err) {
        errorMessage.value = err.message;
        if (debugVerbose.value) {
          console.log(err);
        }
      }
    };

    
    const onGoogleLogin = async () => {
      await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
      .then(()=>{
        const provider = new firebase.auth.GoogleAuthProvider();
        return firebase.auth().signInWithRedirect(provider);
      })
      .catch((error)=>{
        console.log(error)
      });
    };


    const onRegister = async () => {
      router.push("/signup");
    };

    return {
      t,
      email,
      password,
      errorMessage,
      onEmailLogin,
      onGoogleLogin,
      onRegister,
      isOpenRef
    };
  },
});
</script>

