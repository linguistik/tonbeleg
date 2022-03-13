<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ t("general.appname") }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-card>
        <ion-card-header>
          <ion-card-title>Passwort zurücksetzen</ion-card-title>
          <ion-card-subtitle>Gib deine E-Mail ein. Wir werden dir ein neues Passwort an diese E-Mail schicken.</ion-card-subtitle>
        </ion-card-header>

        <ion-card-content v-if="errorMessage" class="error-message" >
           <ion-text color="danger"><h1> {{errorMessage }}</h1></ion-text>
        </ion-card-content>

        <ion-card-content>
          <form @submit.prevent="onSubmit">
            <ion-item>
              <ion-label position="floating">{{ t("auth.email") }}</ion-label>
              <ion-input v-model="email"></ion-input>
            </ion-item>
            <ion-button
              expand="block"
              color="primary"
              class="ion-margin-top"
              type="submit"
            >
              Abschicken
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
  IonText,
  alertController,
  onIonViewWillLeave,
  onIonViewDidEnter,
} from "@ionic/vue";
import { useMenuSettings } from "@/scripts/ionicVueSettings/menuSettings";

export default defineComponent({
  name: "ForgotPassword",

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
    IonText,
  },

  setup() {
    // multi-lingual support
    const { t } = useI18n();

    const {toggleSwipeMenu} = useMenuSettings();
    onIonViewWillLeave(()=>toggleSwipeMenu.value = true);
    onIonViewDidEnter(()=>toggleSwipeMenu.value = false);


    // other variables
    const debugVerbose = ref(true);

    // declare reactive variables
    const email = ref("");
    const password = ref("");
    const errorMessage = ref("");

    /**
     * if the user has forgot his password
     */
    const onSubmit = ()=>{
        console.log(email.value);
        firebase.auth().sendPasswordResetEmail(email.value).then(()=>{ //let firebase send a email to reset his password via email
            console.log("reset password");
            router.back();
        }).catch((err)=>{
            errorMessage.value = err.message;
        });
    }

    return {
      t,
      email,
      password,
      errorMessage,
      onSubmit,
    };
  },
});
</script>


<style scoped>
#google-button {
  color: white;
  background: #4285f4;
}
</style>
