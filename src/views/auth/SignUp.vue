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
          <ion-card-title>{{ t("auth.signup_noun") }}</ion-card-title>
          <ion-card-subtitle>{{ t("auth.signup_cta") }}</ion-card-subtitle>
        </ion-card-header>

        <ion-card-content>
          <form @submit.prevent="onEmailSignUp">
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
              {{ t("auth.signup") }}
            </ion-button>
          </form>
        </ion-card-content>

        <ion-card-content v-if="errorMessage" class="error-message" >
           <ion-text color="danger"> {{errorMessage }}</ion-text>
        </ion-card-content>

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
    IonText,
    IonCheckbox
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


    // other variables
    const debugVerbose = ref(true);

    // declare reactive variables
    const email = ref("");
    const password = ref("");
    const errorMessage = ref("");

    const onEmailSignUp = async () => {
      try {
        await firebase
          .auth()
          .setPersistence(
            rememberMe
              ? firebase.auth.Auth.Persistence.LOCAL
              : firebase.auth.Auth.Persistence.NONE
          );
        const username = await firebase
          .auth()
          .createUserWithEmailAndPassword(email.value, password.value);
        if (debugVerbose.value) {
          console.log(username);
        }
        //if a new user is created there is obviously no license set
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
      } catch (err) {
        errorMessage.value = err.message;
        if (debugVerbose.value) {
          console.log(err);
        }
      }
    };

    return {
      t,
      email,
      password,
      errorMessage,
      onEmailSignUp,
      changeRememberMe
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
