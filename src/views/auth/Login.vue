<template>
  <ion-page>

    <ion-header>
      <ion-toolbar>
        <ion-title>{{ t('general.appname') }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-card>

        <ion-card-header>
          <ion-card-title>{{ t('auth.signup_noun') }}</ion-card-title>
          <ion-card-subtitle>{{ t('auth.signup_cta') }}</ion-card-subtitle>
        </ion-card-header>

        <ion-card-content>
          <form @submit.prevent="onEmailLogin">
            <ion-item>
              <ion-label position="floating">{{ t('auth.email') }}</ion-label>
              <ion-input v-model="email"></ion-input>
            </ion-item>
            <ion-item>
              <ion-label position="floating">{{ t('auth.password') }}</ion-label>
              <ion-input v-model="password" type="password"></ion-input>
            </ion-item>
            <ion-button expand="block" color="primary" class="ion-margin-top" type="submit">
              {{ t('auth.signup') }}
            </ion-button>
          </form>
        </ion-card-content>

        <ion-card-content>
          <form @submit.prevent="onGoogleLogin">
            <ion-button expand="block" color="primary" class="ion-margin-top" type="submit">
              Google Login
            </ion-button>
          </form>
        </ion-card-content>

        <ion-card-content v-if="errorMsg" class="error-message">
          {{ errorMessage }}
        </ion-card-content>

      </ion-card>
    </ion-content>

  </ion-page>
</template>


<script lang="ts">
import firebase from '@/backend/firebase-config';

import { defineComponent, ref } from 'vue';
import router from '@/router';
import { useI18n } from 'vue-i18n';

import {
  IonPage, IonHeader, IonContent, IonCard,
  IonToolbar, IonTitle,
  IonCardSubtitle, IonCardTitle, IonCardHeader, IonCardContent,
  IonInput, IonButton, IonLabel, IonItem
} from "@ionic/vue";


export default defineComponent({
  name: "LoginForm",

  components: {
    IonPage, IonHeader, IonContent, IonCard,
    IonToolbar, IonTitle,
    IonCardSubtitle, IonCardTitle, IonCardHeader, IonCardContent,
    IonInput, IonButton, IonLabel, IonItem
  },

  setup(){
    // multi-lingual support
    const { t } = useI18n();

    // other variables
    const debugVerbose = ref(true);

    // declare reactive variables
    const email = ref("");
    const password = ref("");
    const errorMessage = ref("");

    const onEmailLogin = async () => {
      try{
        const username = await firebase.auth().signInWithEmailAndPassword(
          email.value, password.value);
        if(debugVerbose.value){console.log(username);}
        router.push("/tabs/record");
      }catch(err){
        errorMessage.value = err.message;
        if(debugVerbose.value){console.log(err);}
      }
    }

    const onGoogleLogin = async () => {
      try{
        const provider = new firebase.auth.GoogleAuthProvider();
        const username = await firebase.auth().signInWithPopup(provider);
        if(debugVerbose.value){console.log(username);}
        router.push("/tabs/record");
      }catch(err){
        errorMessage.value = err.message;
        if(debugVerbose.value){console.log(err);}
      }
    }

    return { 
      t, 
      email, 
      password, 
      errorMessage, 
      onEmailLogin, 
      onGoogleLogin 
    }
  }
});
</script>


<style scoped>
#google-button {
  color: white;
  background: #4285F4;
}
</style>
