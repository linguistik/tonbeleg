<template>
  <ion-page>
    <PageHeader v-bind:title="t('general.appname')" />


    <ion-content :fullscreen="true">
      
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Datenschutz</ion-title>
        </ion-toolbar>
      </ion-header>
    <ion-list>

      <ion-item>
        <ion-label text-wrap>
          <h2>
            Namensnennung
          </h2>
          <p>
            Wenn du dir die Namensnennung wünschst, aktiviere diese Einstellung.
          </p>
        </ion-label>
        <ion-toggle 
        slot="start"
        name = "isMentioningActivated"
        v-bind:checked="isMentioningActivated"
        @IonChange="optionChanged($event)"
        v-bind:disabled="isMentioningActivatedDeactivated"
        ></ion-toggle>
      </ion-item>

      <ion-item>
        <ion-label text-wrap>
          <h2>
            Kommerzielle Nutzung
          </h2>
          <p>
            Wenn deine Aufnahmen kommerziell benutzt werden dürfen, aktiviere diese Einstellung.
          </p>
        </ion-label>
        <ion-toggle 
        slot="start" 
        name = "isComerciallyUseAllowed"
        v-bind:checked="isComerciallyUseAllowed"
        @IonChange="optionChanged($event)"
        v-bind:disabled="isComerciallyUseAllowedDeactivated"
        ></ion-toggle>
      </ion-item>

      <ion-item>
        <ion-label text-wrap>
          <h2>
            Bearbeitung
          </h2>
          <p>
            Wenn du anderen erlauben willst, dass deine Daten bearbeitet werden dürfen, dann aktiviere diese Einstellung.
          </p>
        </ion-label>
        <ion-toggle 
        slot="start" 
        name="isRemixingAllowed"
        @IonChange="optionChanged($event)"
         v-bind:checked="isRemixingAllowed"
        v-bind:disabled="isRemixingAllowedDeactivated"
         ></ion-toggle>
      </ion-item>

      <ion-item>
        <ion-label text-wrap>
          <h2>
            Weitergabe unter beliebigen Bedingungen
          </h2>
          <p>
            Wenn du willst, dass deine Daten unter einer beliebigen Lizenz, dann aktiviere diese Einstellung.
            Wenn du diese Option ausschaltest, werden deine Daten unter der von dir konfigurierten Lizenz weitergegeben.
          </p>
        </ion-label>
        <ion-toggle 
        slot="start" 
        name="isSharingAllowed"
        v-bind:checked="isSharingAllowed"
        @IonChange="optionChanged($event)"
        v-bind:disabled="isSharingAllowedDeactivated"
        ></ion-toggle>
      </ion-item>
      

    </ion-list>
          <div id="container">
        <ion-label text-wrap>
          <h2>
            Deine Lizenz
          </h2>
          <p>
            Durch die obigen Angaben werden deine Daten unter der folgenden Lizenz gespeichert:
            <strong>{{licensePTR}}</strong>
          </p>
        </ion-label>
        </div>
    </ion-content>

  </ion-page>
</template>

<!-- 
ion-toggle:
@ionChange=""
value
:checked
disabled
-->


<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import PageHeader from '@/components/layout/PageHeader.vue';

import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonLabel, IonItem,IonToggle,
} from '@ionic/vue';

import firebase from "@/backend/firebase-config";
//mport 'firebase/firestore';
import '@firebase/firestore'
import {

  getLicense,
  loadUserSettings,
  setDialect,
  setFirstLanguage,
  setJob,
  setLicense, setSecondLanguage, setZipCode
} from "@/scripts/UserSettingsStorage";
import 'firebase/firestore';
export default defineComponent({


  components: { 
    PageHeader, 
    IonHeader, IonToolbar, IonTitle, IonContent, IonPage, IonList, IonLabel, IonItem,IonToggle,
    
  },
  setup(){
    // multi-lingual support
    const { t } = useI18n();

//
// TODO:
// load these values from the server! and change the toggles
//

//TODO upload data

  const licensePTR = ref('CC0 1.0');

  const options = new Map<string, boolean>([
    ["isMentioningActivated", false],
    ["isComerciallyUseAllowed", true],
    ["isRemixingAllowed", true],
    ["isSharingAllowed", true],
  ]);

//since the checked property is one way bounded, these are only used for initialisation
  const isMentioningActivated = ref(false);
  const isComerciallyUseAllowed = ref(true);
  const isRemixingAllowed = ref(true);
  const isSharingAllowed = ref(true);

  const isMentioningActivatedDeactivated = ref(false);
  const isComerciallyUseAllowedDeactivated = ref(true);
  const isRemixingAllowedDeactivated = ref(true);
  const isSharingAllowedDeactivated = ref(true);


    //7 different licenses
    const evaluateLicenseAndDeactivations = ()=>{
      if(options.get("isMentioningActivated")){
        //user does not want attribution
        //deactivate all other toggles
        isComerciallyUseAllowedDeactivated.value = false;
        isRemixingAllowedDeactivated.value = false;
        isSharingAllowedDeactivated.value = false;
        //set license
        licensePTR.value = "CC BY 4.0";

        //if one of the lower toggles is unchecked, deactivate the top one
        if(!(options.get("isComerciallyUseAllowed") && options.get("isRemixingAllowed") && options.get("isSharingAllowed"))){
          isMentioningActivatedDeactivated.value = true;

          licensePTR.value = "something else";
          //combinations of the last 3 values
          if(options.get("isComerciallyUseAllowed") && options.get("isRemixingAllowed") && !options.get("isSharingAllowed")){
            //BY-SA
            isRemixingAllowedDeactivated.value = true;
            licensePTR.value = "CC BY-SA 4.0";
          }else if(options.get("isComerciallyUseAllowed") && !options.get("isRemixingAllowed") && options.get("isSharingAllowed")){
            //BY-ND
            isSharingAllowedDeactivated.value = true;
            licensePTR.value = "CC BY-ND 4.0";
          }else if(!options.get("isComerciallyUseAllowed") && options.get("isRemixingAllowed") && options.get("isSharingAllowed")){
            //BY-NC
            licensePTR.value = "CC BY-NC 4.0";
          }else if(!options.get("isComerciallyUseAllowed") && options.get("isRemixingAllowed") && !options.get("isSharingAllowed")){
            //BY-NC-SA
            isRemixingAllowedDeactivated.value =true;
            licensePTR.value = "CC BY-NC-SA 4.0";
          }else if(!options.get("isComerciallyUseAllowed") && !options.get("isRemixingAllowed") && options.get("isSharingAllowed")){
            //BY-NC-ND
            isSharingAllowedDeactivated.value = true;
            licensePTR.value = "CC BY-NC-ND 4.0";
          }else{
            console.log("ERROR");
          }
        }else{
          isMentioningActivatedDeactivated.value = false;
        }

      }else{
        isComerciallyUseAllowedDeactivated.value = true;
        isRemixingAllowedDeactivated.value = true;
        isSharingAllowedDeactivated.value = true;
        licensePTR.value = "CC0 1.0";
      }

    }


    const evaluateButtonSettingsFromLicense = ()=>{
      /*
      if(licensePTR.value=="CC0 1.0")

      */

      if(licensePTR.value == "CC0 1.0"){
        return;//leave everything default
      }
      options.set("isMentioningActivated", true);
      isMentioningActivated.value = true;
      if(licensePTR.value.includes("NC")){
        options.set("isComerciallyUseAllowed", false);
        isComerciallyUseAllowed.value = false;
      }
      if(licensePTR.value.includes("SA")){
        options.set("isSharingAllowed", false);
        isSharingAllowed.value = false;
      }
      if(licensePTR.value.includes("ND")){
        options.set("isRemixingAllowed", false);
        isRemixingAllowed.value = false;
      }
      evaluateLicenseAndDeactivations();


    }


    const uploadLicense = ()=>{

    const db = firebase.firestore();
      const currentUser = firebase.auth().currentUser;
      if (currentUser == null) return;
      const userUID = currentUser.uid;


      console.log("Start uploading");

      
      db.collection("users").doc(userUID).set({
        license: licensePTR.value
      },{merge: true});
      console.log("wrote to database");
    }


    const downloadLicense = () =>{ //nicht mehr benötigt eigentlich im moment, kann aber vielleicht noch sinnvoll werden
    const db = firebase.firestore();
      const currentUser = firebase.auth().currentUser;
      if (currentUser == null) return;
      const userUID = currentUser.uid;

/*  const options = new Map<string, boolean>([
    ["isMentioningActivated", false],
    ["isComerciallyUseAllowed", true],
    ["isRemixingAllowed", true],
    ["isSharingAllowed", true],
  ]);

  */
      db.collection("users").doc(userUID).get().then((doc)=>{
        console.log(doc.get('license'));
        const license = doc.get('license');
        if(license == "CC0 1.0"){
          return;//leave everything default
        }
        options.set("isMentioningActivated", true);
        isMentioningActivated.value = true;
        if(license.includes("NC")){
          options.set("isComerciallyUseAllowed", false);
          isComerciallyUseAllowed.value = false;
        }
        if(license.includes("SA")){
          options.set("isSharingAllowed", false);
          isSharingAllowed.value = false;
        }
        if(license.includes("ND")){
          options.set("isRemixingAllowed", false);
          isRemixingAllowed.value = false;
        }
        evaluateLicenseAndDeactivations();
      });
    }



    const loadLocalData = async () =>{
      const user = firebase.auth().currentUser;
      if (user == null) return;
      await loadUserSettings();
      licensePTR.value=getLicense();
      evaluateButtonSettingsFromLicense();

    }

    const saveLocalData = async () =>{
      const user = firebase.auth().currentUser;
      if (user == null) return;
      setLicense(licensePTR.value);

    }

    const optionChanged = (event: any)=>{
      options.set(event.target.name, event.target.checked);
      evaluateLicenseAndDeactivations();
      setLicense(licensePTR.value);
      saveLocalData();
      uploadLicense();
    }


    loadLocalData();
    uploadLicense();//überschreibt datenbank



    return { t, licensePTR, optionChanged, 
    isSharingAllowedDeactivated,
    isRemixingAllowedDeactivated,
    isComerciallyUseAllowedDeactivated,
    isMentioningActivatedDeactivated,
    isMentioningActivated,
    isComerciallyUseAllowed,
    isRemixingAllowed,
    isSharingAllowed
    }
  }
})
</script>

<style scoped>
#container p{
  font-size: 16px;
  line-height: 22px;
  padding: 10px;
}
#container h2{
  padding-top: 25px;
  font-size: 24px;
  text-align:center;
}
</style>
