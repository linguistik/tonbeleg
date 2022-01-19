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
          <ion-label> Persönliche Daten </ion-label>
        </ion-list-header>

        <ion-item>
          <ion-label> Geburtstag </ion-label>
          <ion-input
            v-model:type="dateType"
            v-model="birthday"
            @ionBlur="safe()"
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-label> Beruf </ion-label>
          <ion-input v-model="job" @ionBlur="safe()"></ion-input>
        </ion-item>

        <ion-list-header>
          <ion-label> Sprachen </ion-label>
        </ion-list-header>

        <ion-item>
          <ion-label>
            Erstsprache wählen
          </ion-label>
           <ion-select v-model="firstLanguage" @ionChange="safe()">
              <ion-select-option v-for="[short,language] in languages" v-bind:key="short" v-bind:value="short">{{language}}</ion-select-option>
            </ion-select>
        </ion-item>

          <MultipleElementsParent text="Zweitsprache hinzufügen" @valuesChanged="updateSecondLanguages" ref="lng2"/>


        <ion-item>
          <ion-label> Dialekt </ion-label>
          <ion-input v-model="dialect" @ionBlur="safe()"></ion-input>
        </ion-item>
        <ion-item v-if="dialect != '' && getFiveItems(dialect)[0] != dialect">
          <ion-list v-if="getFiveItems(dialect).length != 0">
            <ion-item
              v-for="item in getFiveItems(dialect)"
              :key="item"
              button
              @click="fillDialect(item)"
            >
              <ion-label>
                {{ item }}
              </ion-label>
            </ion-item>
          </ion-list>
          <ion-button v-else @click="safeNewDialect()"
            >Dialekt Hinzufügen</ion-button
          >
        </ion-item>

        <ion-list-header>
          <ion-label> Wohnorte </ion-label>
        </ion-list-header>

        <ion-item>
          <ion-label> Postleitzahl </ion-label>
          <ion-input
            v-model="shownZipCode"
            v-model:type="numberType"
            @ionBlur="safe()"
          >
          </ion-input>
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
import {loadUserSettings, setBirthday, setJob,setFirstLanguage,setSecondLanguage,setDialect,setZipCode, getBirthday,getJob,getFirstLanguage,getSecondLanguage,getDialect,getZipCode} from "@/scripts/UserSettingsStorage";
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonListHeader, IonLabel, IonInput,IonButton, IonSelect, IonSelectOption,
} from '@ionic/vue';


import firebase from '@/backend/firebase-config';

import 'firebase/firestore';
import MultipleElementsParent from '@/components/dynamicElement/MultipleElementsParent.vue';

export default defineComponent({

  components: { 
    PageHeader, 
    IonHeader, IonToolbar, IonTitle, IonContent, IonPage, IonList, IonItem, IonListHeader, IonLabel, IonInput, IonButton, IonSelect,IonSelectOption,    MultipleElementsParent
  },
  methods: {
    /**
     * laods saved languages and sets entrys in child components
     */
    async setupLanguages() {
      await loadUserSettings(); //läd user settinmg
      await this.$refs.lng2.onInit(getSecondLanguage()); //erstellt kinder zweite Sprache
      this.$refs.lng2.itemRefs.forEach((entrys: any, index: number) =>{ //füllt bei kinder die geladenen namen ein
        entrys.initName(getSecondLanguage()[index],index);
        console.log(index)
      })
    }
  },

  mounted() {
    //kinder erst nach setup laden
    this.setupLanguages();
  },
  //TODO upload data

  setup(props: any, context: any) {
    // multi-lingual support
    const { t } = useI18n();

    const currentUser = firebase.auth().currentUser;

    const birthday = ref("");
    const job = ref("");
    const firstLanguage = ref([""]);
    const secondLanguage = ref([""]);
    const dialect = ref("");
    const zipCode = ref(-1);

    const shownZipCode = ref("");

    const numberType = ref("number");
    const dateType = ref("date");

    let dialects: string[] = [];
    const languages: string[][]=[];

    /**
     * loads data about the user from database
     */
    const loadData = async () => {
      const user = firebase.auth().currentUser;
      if (user == null) return;
      await loadUserSettings();
      birthday.value = getBirthday();

      job.value = getJob();
      firstLanguage.value = getFirstLanguage();
      secondLanguage.value = getSecondLanguage();
      dialect.value = getDialect();
      zipCode.value = getZipCode();
      if (zipCode.value < 0) {
        shownZipCode.value = "";
      } else {
        shownZipCode.value = zipCode.value.toString();
      }
      //const store = firebase.firestore();
      //const ref = firebase.database();
      //console.log(ref);
    };
    /**
     * upload userdata on database
     */
    const uploadUserSettings = () => {
      const db = firebase.firestore();
      const currentUser = firebase.auth().currentUser;
      if (currentUser == null) return;
      const userUID = currentUser.uid;

      console.log("Start uploading");

      db.collection("users").doc(userUID).set(
        {
          birthday: birthday.value,
          job: job.value,
          firstLanguage: firstLanguage.value,
          secondLanguage: secondLanguage.value,
          dialect: dialect.value,
          zipCode: zipCode.value,
        },
        { merge: true }
      );
      console.log("wrote to database");
    };
    /**
     * saves userdata local in usersettings.json and upload to firebase
     */
    const safe = ()=>{
      console.log(birthday.value)
      console.log(firstLanguage.value)

      if (currentUser == null) return;

      if (
        isNaN(parseInt(shownZipCode.value)) ||
        parseInt(shownZipCode.value) < 0
      ) {
        //zip code legaler wert?
        if (zipCode.value < 0) shownZipCode.value = "";
        else shownZipCode.value = zipCode.value.toString(); //reset des alten wertes außer -1 da ungültiger wert
        console.log("ungültiger zipcode");
      } else {
        setZipCode(parseInt(shownZipCode.value));
        zipCode.value = parseInt(shownZipCode.value);
      }

      setBirthday(birthday.value);
      setJob(job.value);
      setFirstLanguage(firstLanguage.value); //redundant wird eigentlich automatisch gemacht aber zu testzwecken noch hier
      setSecondLanguage(secondLanguage.value);
      setDialect(dialect.value);
      uploadUserSettings();
    };

    const loadDialects = async () => {
      const db = firebase.firestore();
      const snapshot = await db.collection("data").doc("dialects").get();
      dialects = snapshot.get("dialects");
    };

    const loadLanguages = async () => {
      const db = firebase.firestore();
      const snapshot = await db.collection("data").doc("languages").get();
      for(let i=0;i<18;i++){
        
        languages[i]=snapshot.get(i.toString())
      }
      console.log(languages)
    };

    /**
     * loads user settings initially when tab is first opened
     */
    const initData = async () => {
      await loadDialects();
      await loadLanguages();
      await loadData();

      // console.log("Languages in method call: " + languages)
      
      uploadUserSettings();
    };
    initData();

    /**
     * first language childcomponents call this method when their language is changed,
     * @param languages, list with all languges from all child compontents with updated entrys
     */
    const updateFirstLanguages = (languages: string[]) => {
      console.log(languages);
      firstLanguage.value = languages;
      setFirstLanguage(languages);
    };
    /**
     * second language childcomponents call this method when their language is changed,
     * @param languages, list with all languges from all child compontents with updated entrys
     */
    const updateSecondLanguages = (languages: string[]) => {
      console.log(languages);
      secondLanguage.value = languages;
      setSecondLanguage(languages);
    };

    let items = dialects;
    function getFiveItems(input: string) {
      const val = input;
      items = dialects;
      if (val.trim() != "") {
        items = items.filter((item) => {
          return item.toLowerCase().indexOf(val.toLowerCase()) > -1;
        });
      } else {
        items = [""];
      }
      let retItems: string[]=[];
      if (items.length>5){
        for(let i=0; i<5;i++){
          retItems[i]=items[i]
        } 
      }
      else{
        retItems=items
      }
      return retItems;
    }
    function fillDialect(item: string) {
      dialect.value = item;
    }
    function safeNewDialect() {
      const db = firebase.firestore();
      dialects[dialects.length] = dialect.value;
      db.collection("data").doc("dialects").set(
        {
          dialects: dialects,
        },
        { merge: true }
      );
    }

    // console.log("Languages at end of setup: " + languages)

    return {
      t,
      safe,
      job,
      firstLanguage,
      secondLanguage,
      dialect,
      zipCode,
      numberType,
      shownZipCode,
      dateType,
      birthday,
      updateFirstLanguages,
      updateSecondLanguages,
      getFiveItems,
      fillDialect,
      safeNewDialect,
      items,
      dialects,
      languages
    };
  },
});

</script>