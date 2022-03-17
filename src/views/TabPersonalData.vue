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
          <ion-label> Geburtstag: </ion-label>
          <ion-input
            v-model:type="dateType"
            v-model="birthday"
            @ionBlur="save()"
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-label> Beruf: </ion-label>
          <ion-input
              v-model="job"
              @ionBlur="save()"
              placeholder="ihr Beruf"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label>
            Erstsprache wählen
          </ion-label>
           <ion-select v-model="firstLanguage" @ionChange="save()">
              <ion-select-option v-for="[short,language] in languagesGlobal" v-bind:key="short" v-bind:value="short">{{language}}</ion-select-option>
            </ion-select>
        </ion-item>

          <MultipleElementsParent text="Zweitsprache hinzufügen" @valuesChanged="updateSecondLanguages" ref="lng2"/>

        <ion-item>
          <ion-label> Dialekt: </ion-label>
          <ion-input
              v-model="dialect"
              placeholder="Ihr Dialekt"
              @input = "justAddedDialect = false"
              @ionBlur="save()"></ion-input>
          <ion-button v-show="(justAddedDialect==false) && dialect != '' && suggestDialects(dialect)[0] != dialect" @click="saveNewDialect()"
          >Dialekt Hinzufügen</ion-button>
        </ion-item>

        <ion-item v-if="dialect != '' && suggestDialects(dialect)[0] != dialect && suggestDialects(dialect).length != 0">
          <ion-list v-show="suggestDialects(dialect).length > 0">
            <ion-item
              v-for="item in suggestDialects(dialect)"
              :key="item"
              button
              @click="fillDialect(item)"
            >
              <ion-label>
                {{ item }}
              </ion-label>
            </ion-item>
          </ion-list>

        </ion-item>

        <ion-item>
          <ion-label> Postleitzahl: </ion-label>
          <ion-input
            v-model="shownZipCode"
            v-model:inputmode="numberType"
            maxlength="3"
            placeholder="000"
            @ionBlur="save()"
          ></ion-input>
        </ion-item>


        <ion-item>
          <ion-button @click="save()">Speichern</ion-button>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>


<script lang="ts">

import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import PageHeader from '@/components/layout/PageHeader.vue';
import {loadUserSettings,setFirstLanguage,setSecondLanguage,setZipCode, getBirthday,getJob,
  getFirstLanguage,getSecondLanguage,getDialect,getZipCode, setPersonalData} from "@/scripts/UserSettingsStorage";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonListHeader,
  IonLabel,
  IonInput,
  IonButton,
  IonSelect,
  IonSelectOption,
  toastController,
} from '@ionic/vue';


import firebase from '@/backend/firebase-config';
import {loadLanguagesFromFirebase, loadDialectsFromFirebase, languagesGlobal, dialectsGlobal} from "@/scripts/loadingFromDataBase";
import 'firebase/firestore';
import MultipleElementsParent from '@/components/dynamicElement/MultipleElementsParent.vue';

export default defineComponent({
  name: "TabPersonalData",
  components: { 
    PageHeader, 
    IonHeader, IonToolbar, IonTitle, IonContent, IonPage, IonList, IonItem,
    IonListHeader, IonLabel, IonInput, IonButton, IonSelect,IonSelectOption, MultipleElementsParent
  },
  methods: {

    /**
     * loads saved languages and sets entrys in child components
     */
    async setupLanguages() {
      await loadUserSettings(); //loads user settings
      await this.$refs.lng2.onInit(getSecondLanguage()); //creates child components for second language
      this.$refs.lng2.itemRefs.forEach((entrys: any, index: number) =>{ //sets names for child components
        entrys.initName(getSecondLanguage()[index],index);

      })
    }
  },

  mounted() {
    //load child components after setup
    this.setupLanguages();
  },


  setup() {
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
    //let languages: string[][]=[];

    const firstVisit = ref(true);

    const justAddedDialect = ref(false);

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
      await loadDialectsFromFirebase();
      dialects = dialectsGlobal;
      await loadLanguagesFromFirebase();
      //languages = languagesGlobal;
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
     * saves userdata local in usersettings.json and uploads data to firebase
     */
    const save = async ()=>{
      if (currentUser == null) return;

      if (isNaN(parseInt(shownZipCode.value)) || parseInt(shownZipCode.value) < 0) { //checks wether the entered zip code has a valid value
        if (zipCode.value < 0) {
          shownZipCode.value = ""; //reset zip code in case it is invalid
        }
        if(shownZipCode.value != "") {
          console.log("invalid zipcode");
          const toast = await toastController
              .create({
                message: 'Invalid zip code',
                duration: 1500
              })
          return toast.present();
        }
      }
      else {
        setZipCode(parseInt(shownZipCode.value));     //saves zip code if valid
        zipCode.value = parseInt(shownZipCode.value);
      }

      setPersonalData(birthday.value, job.value, firstLanguage.value, secondLanguage.value, dialect.value);
      uploadUserSettings();

      if(firstVisit.value==false) {
        const toast = await toastController
            .create({
              message: 'Your personal data has been saved',
              duration: 1500
            })
        return toast.present();
      }
      else {
        firstVisit.value = false;
      }
    };

    /**
     * loads dialects from firebase
     */
    const loadDialects = async () => {
      const db = firebase.firestore();
      const snapshot = await db.collection("data").doc("dialects").get();
      dialects = snapshot.get("dialects");
    };


    /**
     * loads languages from firebase
     *//*/
    const loadLanguages = async () => {
      const db = firebase.firestore();
      const snapshot = await db.collection("data").doc("languages").get();
      const size = (await db.collection("data").doc("languages").get()).get("NoLanguages");
      for(let i=0;i<size;i++){
          languages[i] = snapshot.get(i.toString())
      }
      console.log(languages)
    };
    */

    /**
     * loads user settings initially when tab is first opened
     */
    const initData = async () => {
      await loadLanguagesFromFirebase();
      await loadDialectsFromFirebase();
      dialects = dialectsGlobal;
      await loadData();
      uploadUserSettings();
    };
    initData();



    /**
     * first language childcomponents call this method when their language is changed
     * @param languages, list with all languges from all child compontents with updated entrys
     *//*
    const updateFirstLanguages = (languages: string[]) => {
      console.log(languages);
      firstLanguage.value = languages;
      setFirstLanguage(languages);
    };*/

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

    /**
     * checks wether a dialect entered by the user already exists and suggests it to the user
     * @param input the name of the dialect entered by the user
     */
    function suggestDialects(input: string) {
      if(items == null ){
        return [];
      }
      const val = input;
      items = dialects;
      if (val.trim() != "") {
        items = items.filter((item) => {
          if(item.toLowerCase()==dialect.value.toLowerCase()){
            return false;
          }
          return item.toLowerCase().indexOf(val.toLowerCase()) > -1;
        });
      } else {
        items.splice(0,);
      }
      let retItems: string[]=[];
      if (items.length>5){      //shorten the list of possible dialects to suggest 5 dialects only
        for(let i=0; i<5;i++){
          retItems[i]=items[i]
        } 
      }
      else{
        retItems=items
      }
      return retItems;
    }

    /**
     * if a user selects one of the suggested dialects
     * @param item is one of the dialects suggested to the user
     */
    function fillDialect(item: string) {
      dialect.value = item;
      justAddedDialect.value = true;
      console.log("filling Dialect");
    }

    /**
     * if a user enters a dialect that doesn't exist already
     * it is added to the database
     */
    async function saveNewDialect() {
      items = dialects;
      let isDialectNew = true;
      if (items != null) {           //checks wether there are dialects already existing, checks for null instead of undefined but seems to work
        items.forEach((item) => {   //each existing dialect is compared to the one entered by the user
          if (item == dialect.value) {
            isDialectNew = false;   //if entry already exists message user
          }
        });
      }
      if(isDialectNew){                 //if dialect already exists
        const db = firebase.firestore();
        justAddedDialect.value = true;
        if(dialects != null) {
          dialects[dialects.length] = dialect.value;
        }
        else{
          dialects = [];
          dialects[0] = dialect.value;
        }
        db.collection("data").doc("dialects").set(
          {
            dialects: dialects,
          },
          { merge: true }
        );
        const toast = await toastController
            .create({
              message: 'Der Dialekt wurde hinzugefügt',
              duration: 1500
            })
        return toast.present();
      }
      else{
        justAddedDialect.value = true;
        const toast = await toastController //informs user that dialect already exists
            .create({
              message: 'Der Dialekt ist bereits vorhanden und wurde gespeichert',
              duration: 1500
            })
        return toast.present();
      } 
    }

    return {
      t,
      save,
      job,
      firstLanguage,
      secondLanguage,
      dialect,
      zipCode,
      numberType,
      shownZipCode,
      dateType,
      birthday,
      //updateFirstLanguages,
      updateSecondLanguages,
      suggestDialects,
      fillDialect,
      saveNewDialect,
      items,
      dialects,
      firstVisit,
      justAddedDialect,
      languagesGlobal
    };
  },
});

</script>