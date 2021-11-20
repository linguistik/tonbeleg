<template>
  <ion-page>
    <PageHeader v-bind:title="t('general.appname')" />


    <ion-content :fullscreen="true">
      
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Persönliche Daten</ion-title>
        </ion-toolbar>
      </ion-header>
    
      <ion-list lines="full">

        <ion-list-header>
          <ion-label>
            Persöliche Daten
          </ion-label>
        </ion-list-header>

        <ion-item>
          <ion-label>
            Alter
          </ion-label>
        <ion-input
        v-model:type="ageType"
        v-model="age"
        ></ion-input>
        </ion-item>

        <ion-item>
          <ion-label>
            Beruf
          </ion-label>
        <ion-input
        ></ion-input>
        </ion-item>

        <ion-list-header>
          <ion-label>
            Sprache
          </ion-label>
        </ion-list-header>

        <ion-item>
          <ion-label>
            Erstsprache
          </ion-label>
        <ion-input
        ></ion-input>
        </ion-item>

        <ion-item>
          <ion-label>
            Zweitsprache
          </ion-label>
        <ion-input
        ></ion-input>
        </ion-item>

        <ion-item>
          <ion-label>
            Dialekt
          </ion-label>
        <ion-input
        ></ion-input>
        </ion-item>

        <ion-list-header>
          <ion-label>
            Wohnorte
          </ion-label>
        </ion-list-header>

        <ion-item>
          <ion-label>
            Postleitzahl
          </ion-label>
        <ion-input
        type="number"></ion-input>
        </ion-item>

        <ion-item>
          <ion-button @click="safe()">Speichern</ion-button>
        </ion-item>

      </ion-list>
    </ion-content>

  </ion-page>
</template>


<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import PageHeader from '@/components/layout/PageHeader.vue';

import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonListHeader, IonLabel, IonInput,IonButton
} from '@ionic/vue';


import firebase from '@/backend/firebase-config';



export default defineComponent({
  name: 'Tab1',

  components: { 
    PageHeader, 
    IonHeader, IonToolbar, IonTitle, IonContent, IonPage, IonList, IonItem, IonListHeader, IonLabel, IonInput, IonButton
  },

  setup(){
    // multi-lingual support
    const { t } = useI18n();

    const age=ref('');

    const ageType = ref('number');
    const safe = ()=>{
      const user = firebase.auth().currentUser;
      if(user !=null){
        console.log(user.email);
      }
        //const store = firebase.firestore();
        const ref = firebase.database();
        //console.log(ref);
    }

    return { t, safe, age,ageType }
  }
})
</script>