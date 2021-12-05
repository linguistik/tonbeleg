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
        v-model:type="numberType"
        v-model="age"
        ></ion-input>
        </ion-item>

        <ion-item>
          <ion-label>
            Beruf
          </ion-label>
        <ion-input v-model="job"
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
        <ion-input v-model="firstLanguage"
        ></ion-input>
        </ion-item>

        <ion-item>
          <ion-label>
            Zweitsprache
          </ion-label>
        <ion-input v-model="secondLanguage"
        ></ion-input>
        </ion-item>

        <ion-item>
          <ion-label>
            Dialekt
          </ion-label>
        <ion-input v-model="dialect"
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
        <ion-input v-model="zipCode"
            v-model:type="numberType"></ion-input>
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
import {loadUserSettings, setAge, setJob,setFirstLanguage,setSecondLanguage,setDialect,setZipCode, getAge,getJob,getFirstLanguage,getSecondLanguage,getDialect,getZipCode} from "@/scripts/UserSettingsStorage";
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonListHeader, IonLabel, IonInput,IonButton
} from '@ionic/vue';


import firebase from '@/backend/firebase-config';



export default defineComponent({

  components: { 
    PageHeader, 
    IonHeader, IonToolbar, IonTitle, IonContent, IonPage, IonList, IonItem, IonListHeader, IonLabel, IonInput, IonButton
  },

//TODO upload data

  setup(){
    // multi-lingual support
    const { t } = useI18n();

    const currentUser = firebase.auth().currentUser;
    if (currentUser == null) return;
    const UserUID = currentUser.uid;
    console.log(currentUser.uid);


    const age=ref(0);
    const job=ref('');
    const firstLanguage=ref('');
    const secondLanguage=ref('');
    const dialect=ref('');
    const zipCode=ref(0);

    const numberType = ref('number');

    const loadData = async () =>{
      const user = firebase.auth().currentUser;
      if (currentUser == null) return;
      await loadUserSettings();
      age.value=getAge();
      job.value=getJob();
      firstLanguage.value=getFirstLanguage();
      secondLanguage.value=getSecondLanguage();
      dialect.value=getDialect();
      zipCode.value=getZipCode();
      //const store = firebase.firestore();
      //const ref = firebase.database();
      //console.log(ref);
    }
    const safe = ()=>{
      const user = firebase.auth().currentUser;
      if (currentUser == null) return;
      setAge(age.value);
      setJob(job.value);
      setFirstLanguage(firstLanguage.value);
      setSecondLanguage(secondLanguage.value);
      setDialect(dialect.value);
      setZipCode(zipCode.value);
      console.log(firstLanguage.value);

    }

    loadData();

    return { t, safe, age,job,firstLanguage,secondLanguage,dialect,zipCode,numberType }
  }
})
</script>