<template>
  <ion-page>
    <PageHeader v-bind:title="t('general.appname')" />


    <ion-content :fullscreen="true">
      
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Einstellungen</ion-title>
        </ion-toolbar>
      </ion-header>
    
      <ExploreContainer name="Settings" />
    </ion-content>

    <ion-item>
      <ion-label text-wrap>
        <h2>

        </h2>
        <p>
          Tonbelege nur im Wlan hochladen.
        </p>
      </ion-label>
      <ion-toggle
          slot="start"
          name = "RecordingWifi"
          v-bind:checked="wifiOnlyActivated"
          @IonChange="optionChanged($event)"
          v-bind:disabled="wifiOnlyDeactivated"
      ></ion-toggle>
    </ion-item>

  </ion-page>
</template>


<script lang="ts">
import { defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';
import PageHeader from '@/components/layout/PageHeader.vue';
import {ref} from "vue";
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent
} from '@ionic/vue';

import ExploreContainer from '@/components/ExploreContainer.vue';

import 'firebase/firestore';
import { setWifi, getWifi} from "@/scripts/UserSettingsStorage";
export default defineComponent({

  components: { 
    PageHeader, 
    IonHeader, IonToolbar, IonTitle, IonContent, IonPage,
    ExploreContainer
  },

  setup(){
    // multi-lingual support
    const { t } = useI18n();

    const wifiOnlyActivated = ref(false);

    const optionChanged = (event: any)=>{
      wifiOnlyActivated.value = !wifiOnlyActivated.value;
      setWifi(wifiOnlyActivated.value);
    }

    return { t,
    optionChanged,
      wifiOnlyActivated,
    }
  }
})
</script>