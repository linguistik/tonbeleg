<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom">

        <ion-tab-button tab="saved" href="/tabs/saved"
        v-on:click="loadData()" >
          <ion-icon :icon="save" />
          <ion-label>{{t('general.saved') }}</ion-label>
        </ion-tab-button>
          
        <ion-tab-button tab="record" href="/tabs/record">
          <ion-icon :icon="ellipse" />
          <ion-label>{{t('general.record')}}</ion-label>
        </ion-tab-button>
        
        <ion-tab-button tab="account" href="/tabs/account">
          <ion-icon :icon="cloud" />
          <ion-label>Hochgeladen</ion-label>
        </ion-tab-button>

      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>


<script lang="ts">
import { 
  IonTabBar, IonTabButton, IonTabs, IonLabel, IonIcon, IonPage, IonRouterOutlet 
} from '@ionic/vue';

import { cloud, save, ellipse } from 'ionicons/icons';
import { useI18n } from 'vue-i18n';


export default {
  name: 'Tabs',

  components: { 
    IonLabel, IonTabs, IonTabBar, IonTabButton, IonIcon, IonPage, IonRouterOutlet 
  },

  setup() {
    // multi-lingual support
    const { t } = useI18n();
    return {
      t,
      ellipse, 
      cloud, 
      save,
    }
  },
  
}
</script>