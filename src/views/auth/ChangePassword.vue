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
          <ion-card-title>Passwort ändern</ion-card-title>
          <ion-card-subtitle>Gib deine E-Mail, dein altes Passwort sowie dein neues Passwort ein, um dieses zu ändern.</ion-card-subtitle>
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
            <ion-item>
              <ion-label position="floating">Altes Passwort</ion-label>
              <ion-input v-model="oldPassword" type="password"></ion-input>
            </ion-item>
            <ion-item>
              <ion-label position="floating">Neues Passwort</ion-label>
              <ion-input v-model="newPassword1" type="password"></ion-input>
            </ion-item>
            <ion-item>
              <ion-label position="floating">Passwort bestätigen</ion-label>
              <ion-input v-model="newPassword2" type="password"></ion-input>
            </ion-item>
            <ion-button
              expand="block"
              color="primary"
              class="ion-margin-top"
              type="submit"
            >
              Bestätigen
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
    const oldPassword = ref("");
    const newPassword1 = ref("");
    const newPassword2 = ref("");
    const errorMessage = ref("");

    /**
     * when user submits his data to change his password
     */
    const onSubmit =()=>{
        if(newPassword1.value == ""){   //when the user hasn't entered a new password
            errorMessage.value = "Bitte gib ein neues Passwort ein";
            return; 
        }
        if(newPassword2.value == ""){  //when the user hasn't repeated the new password
            errorMessage.value = "Bitte bestätige dein neues Passwort";
            return;
        }
        if(newPassword1.value != newPassword2.value){ //if the new password and the repeated new password dont match
            errorMessage.value = "Passwörter stimmen nicht überein."
            return;
        }
        firebase                                     //if the new password and the repeated new password match
            .auth()
            .signInWithEmailAndPassword(email.value, oldPassword.value) //sign in with the old password
            .then(() => {
                const currentUser = firebase.auth().currentUser;        //check if the sign in was successful
                if( currentUser == null){
                    return;
                }
                currentUser.updatePassword(newPassword1.value);         //update the password
                firebase.auth().signOut();                              //log out the user
                router.push("/");                                       //send user to login page
            })
            .catch((err) => {
                errorMessage.value = err.message;
            });
    }

    return {
      t,
      email,
      oldPassword,
      newPassword1,
      newPassword2,
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
