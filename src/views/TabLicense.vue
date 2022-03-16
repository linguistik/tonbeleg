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
            Wenn du willst, dass deine Daten unter einer beliebigen Lizenz verwendet werden dürfen, dann aktiviere diese Einstellung.
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

          <p>
            Durch die obigen Angaben werden deine Daten unter der folgenden Lizenz gespeichert:
            <strong>{{licenseLicenseTab}}</strong>
          </p>
        </ion-label>
        </div>
    </ion-content>

  </ion-page>
</template>



<script lang="ts">
import { defineComponent} from 'vue';
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
  onIonViewDidEnter,
} from '@ionic/vue';

import '@firebase/firestore'
import {
  getLicense,
} from "@/scripts/UserSettingsStorage";
import 'firebase/firestore';
import {evaluateButtonSettingsFromLicense,
  uploadLicense,exportedLicensePTR,
        loadLocalData, isComerciallyUseAllowed, isComerciallyUseAllowedDeactivated,
        isMentioningActivated, isMentioningActivatedDeactivated, isRemixingAllowedDeactivated,
        isRemixingAllowed, isSharingAllowed, isSharingAllowedDeactivated, optionChanged, licenseLicenseTab} from "@/scripts/LicenseSettings";

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
    uploadLicense();//overrides database

    /**
     * when the license page is entered the license chosen by the user is loaded
     */
    onIonViewDidEnter(async () => { //e
      console.log('Entering license tab');
      exportedLicensePTR.value = getLicense(); //fetching license from usersettings
      evaluateButtonSettingsFromLicense();     //setting toggles according to license
    });


    return { t, optionChanged,
    isSharingAllowedDeactivated,
    isRemixingAllowedDeactivated,
    isComerciallyUseAllowedDeactivated,
    isMentioningActivatedDeactivated,
    isMentioningActivated,
    isComerciallyUseAllowed,
    isRemixingAllowed,
    isSharingAllowed, exportedLicensePTR, licenseLicenseTab,
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
