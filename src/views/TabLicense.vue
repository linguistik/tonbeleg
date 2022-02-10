<template>
  <ion-page>
    <PageHeader v-bind:title="t('general.appname')" />


    <ion-content :fullscreen="true">
      
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Lizenz</ion-title>
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
            <strong>{{exportedLicensePTR}}</strong>
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
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonLabel,
  IonItem,
  IonToggle,
  toastController,
  onIonViewDidEnter,
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
import {evaluateLicenseAndDeactivations, evaluateButtonSettingsFromLicense,
        saveLocalData, uploadLicense,exportedLicensePTR, downloadLicense,
        loadLocalData, options, isComerciallyUseAllowed, isComerciallyUseAllowedDeactivated,
        isMentioningActivated, isMentioningActivatedDeactivated, isRemixingAllowedDeactivated,
        isRemixingAllowed, isSharingAllowed, isSharingAllowedDeactivated, optionChanged} from "@/scripts/LicenseSettings";
import {UploadToFirebase} from "@/scripts/RecordingUpload";
export default defineComponent({
  name: "TabLicense",

  components: { 
    PageHeader, 
    IonHeader, IonToolbar, IonTitle, IonContent, IonPage, IonList, IonLabel, IonItem,IonToggle,
    
  },
  setup(){
    // multi-lingual support
    const { t } = useI18n();

    loadLocalData();
    uploadLicense();//überschreibt datenbank

    onIonViewDidEnter(async () => { //e
      console.log('Home page will be left');
      await loadUserSettings();
      exportedLicensePTR.value = getLicense();
      evaluateButtonSettingsFromLicense();
    });


    return { t, optionChanged,
    isSharingAllowedDeactivated,
    isRemixingAllowedDeactivated,
    isComerciallyUseAllowedDeactivated,
    isMentioningActivatedDeactivated,
    isMentioningActivated,
    isComerciallyUseAllowed,
    isRemixingAllowed,
    isSharingAllowed, exportedLicensePTR,
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
