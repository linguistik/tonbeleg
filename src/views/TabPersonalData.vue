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
            Persönliche Daten
          </ion-label>
        </ion-list-header>

        <ion-item>
          <ion-label>
            Alter
          </ion-label>
        <ion-input
        v-model:type="numberType"
        v-model="shownAge"
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
        <ion-input v-model="shownZipCode"
            v-model:type="numberType"></ion-input>
        </ion-item>

        <ion-item>
          <ion-button @click="safe()">Speichern</ion-button>
        </ion-item>
<MultipleElementsParent text="Erstsprache hinzufügen" @valuesChanged="updateFirstLanguages"/>
<MultipleElementsParent text="Zweitsprache hinzufügen" />
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

import 'firebase/firestore';
import MultipleElementsParent from '@/components/dynamicElement/MultipleElementsParent.vue';

export default defineComponent({

  components: { 
    PageHeader, 
    IonHeader, IonToolbar, IonTitle, IonContent, IonPage, IonList, IonItem, IonListHeader, IonLabel, IonInput, IonButton,
    MultipleElementsParent
  },

//TODO upload data

  setup(){
    // multi-lingual support
    const { t } = useI18n();

    const currentUser = firebase.auth().currentUser;
    if (currentUser == null) return;
    const UserUID = currentUser.uid;
    console.log(currentUser.uid);


    const age=ref(-1); //-1 gibt ungültigen wert an, richtiges alter
    const shownAge=ref("");//angezeigtes alter als string
    const job=ref('');
    const firstLanguage=ref('');
    const secondLanguage=ref('');
    const dialect=ref('');
    const zipCode=ref(-1);
    const shownZipCode=ref("");

    const numberType = ref('number');

    const loadData = async () =>{
      const user = firebase.auth().currentUser;
      if (user == null) return;
      await loadUserSettings();
      age.value=getAge();
      if(age.value<0){
        shownAge.value="";
      }else{
        shownAge.value=age.value.toString();
      }
      job.value=getJob();
      firstLanguage.value=getFirstLanguage();
      secondLanguage.value=getSecondLanguage();
      dialect.value=getDialect();
      zipCode.value=getZipCode();
      if(zipCode.value<0){
        shownZipCode.value="";
      }else{
        shownZipCode.value=zipCode.value.toString();
      }
      //const store = firebase.firestore();
      //const ref = firebase.database();
      //console.log(ref);
    }

    const uploadUserSettings = ()=>{

      const db = firebase.firestore();
      const currentUser = firebase.auth().currentUser;
      if (currentUser == null) return;
      const userUID = currentUser.uid;


      console.log("Start uploading");


      db.collection("users").doc(userUID).set({
        age: age.value,
        job: job.value,
        firstLanguage:firstLanguage.value,
        secondLanguage:secondLanguage.value,
        dialect:dialect.value,
        zipCode:zipCode.value
      },{merge: true});
      console.log("wrote to database");
    }

    const safe = ()=>{
      const user = firebase.auth().currentUser;
      if (currentUser == null) return;

      if(isNaN(parseInt(shownAge.value)) || parseInt(shownAge.value)<0) {
        if(age.value<0)
          shownAge.value="";
        else
          shownAge.value=age.value.toString() //reset des alten wertes
        console.log("ungültiges alter")
      }

      else{//wert ist größer null und eine gültige number
        setAge(parseInt(shownAge.value));
        age.value=parseInt(shownAge.value);
      }


      if(isNaN(parseInt(shownZipCode.value)) || parseInt(shownZipCode.value)<0) {
        if(zipCode.value<0)
          shownZipCode.value="";
        else
          shownZipCode.value=zipCode.value.toString() //reset des alten wertes außer -1 da ungültiger wert
        console.log("ungültiger zipcode")
      }

     else{
        setZipCode(parseInt(shownZipCode.value));
        zipCode.value=parseInt(shownZipCode.value);
      }

      setJob(job.value);
      setFirstLanguage(firstLanguage.value);
      setSecondLanguage(secondLanguage.value);
      setDialect(dialect.value);

      uploadUserSettings();

    }

    loadData();
    uploadUserSettings();

    const updateFirstLanguages = (languages: string[])=>{
      console.log(languages);
    }

    return { t, safe, age,job,firstLanguage,secondLanguage,dialect,zipCode,numberType, shownAge, shownZipCode, updateFirstLanguages }
  }
})
</script>