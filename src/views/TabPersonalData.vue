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
            Geburtstag
          </ion-label>
        <ion-input
        v-model:type="dateType"
        v-model="birthday" @ionBlur="safe()"
        ></ion-input>
        </ion-item>

        <ion-item>
          <ion-label>
            Beruf
          </ion-label>
        <ion-input v-model="job" @ionBlur="safe()"
        ></ion-input>
        </ion-item>

        <ion-list-header>
          <ion-label>
            Sprachen
          </ion-label>
        </ion-list-header>

        <ion-item>
          <MultipleElementsParent text="Erstsprache hinzufügen" @valuesChanged="updateFirstLanguages" ref="lng1" />
        </ion-item>

        <ion-item>
          <MultipleElementsParent text="Zweitsprache hinzufügen" @valuesChanged="updateSecondLanguages" ref="lng2"/>
        </ion-item>

        <ion-item>
          <ion-label>
            Dialekt
          </ion-label>
        <ion-input v-model="dialect" @ionBlur="safe()"
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
            v-model:type="numberType" @ionBlur="safe()"
        >
        </ion-input>
        </ion-item>

        <ion-item>
          <ion-button @click="safe()">Speichern</ion-button>
        </ion-item>
        <ion-button @click="triggerChildMethod()">test</ion-button>
      </ion-list>
    </ion-content>

  </ion-page>
</template>


<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import PageHeader from '@/components/layout/PageHeader.vue';
import {loadUserSettings, setBirthday, setJob,setFirstLanguage,setSecondLanguage,setDialect,setZipCode, getBirthday,getJob,getFirstLanguage,getSecondLanguage,getDialect,getZipCode} from "@/scripts/UserSettingsStorage";
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
  methods: {
    //läd geladene Sprachen und setzt die Einträge, bisschen unübersichtliches spaghetti aber seh keinen andere lösung
    async setupLanguages() {
      await loadUserSettings(); //läd user settinmg
      await this.$refs.lng1.onInit(getFirstLanguage()); //erstellt kinder erstSprache
      this.$refs.lng1.itemRefs.forEach((entrys: any, index: number) =>{ //füllt bei kinder die geladenen namen ein
        entrys.initName(getFirstLanguage()[index],index);
      })

      await this.$refs.lng2.onInit(getSecondLanguage()); //erstellt kinder zweite Sprache
      this.$refs.lng2.itemRefs.forEach((entrys: any, index: number) =>{ //füllt bei kinder die geladenen namen ein
        entrys.initName(getSecondLanguage()[index],index);
      })
    }
  },

  mounted() {//kinder erst nach setup laden

    this.setupLanguages();

  },
//TODO upload data

  setup(props: any, context: any){
    // multi-lingual support
    const { t } = useI18n();

    const currentUser = firebase.auth().currentUser;
    if (currentUser == null) return;
    const UserUID = currentUser.uid;
    console.log(currentUser.uid);


    const birthday = ref('');
    const job=ref('');
    const firstLanguage =ref(['']);
    const secondLanguage=ref(['']);
    const dialect=ref('');
    const zipCode=ref(-1);

    const shownZipCode=ref("");

    const numberType = ref('number');
    const dateType = ref('date');

    const loadData = async () =>{

      const user = firebase.auth().currentUser;
      if (user == null) return;
      await loadUserSettings();
      birthday.value=getBirthday();

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
        birthday: birthday.value,
        job: job.value,
        firstLanguage:firstLanguage.value,
        secondLanguage:secondLanguage.value,
        dialect:dialect.value,
        zipCode:zipCode.value
      },{merge: true});
      console.log("wrote to database");
    }

    const safe = ()=>{
      console.log(birthday.value)
      const user = firebase.auth().currentUser;
      if (currentUser == null) return;

      if(isNaN(parseInt(shownZipCode.value)) || parseInt(shownZipCode.value)<0) {//zip code legaler wert?
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

      setBirthday(birthday.value)
      setJob(job.value);
      setFirstLanguage(firstLanguage.value); //redundant wird eigentlich automatisch gemacht aber zu testzwecken noch hier
      setSecondLanguage(secondLanguage.value);
      setDialect(dialect.value);
      uploadUserSettings();

    }


    const initData = async () =>{

      await loadData();
      uploadUserSettings();

    }
    initData();

    const updateFirstLanguages = (languages: string[])=>{
      console.log(languages);
      firstLanguage.value=languages;
      setFirstLanguage(languages)
    }

    const updateSecondLanguages = (languages: string[])=>{
      console.log(languages);
      secondLanguage.value=languages;
      setSecondLanguage(languages);
    }

    return { t, safe, job,firstLanguage,secondLanguage,dialect,zipCode,numberType, shownZipCode, dateType,birthday, updateFirstLanguages, updateSecondLanguages }
  }
})
</script>