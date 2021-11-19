<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom">

        <ion-tab-button tab="saved" href="/tabs/saved">
          <ion-icon :icon="save" />
          <ion-label>Gespeichert</ion-label>
        </ion-tab-button>
          
        <ion-tab-button tab="record" href="/tabs/record">
          <ion-icon :icon="ellipse" />
          <ion-label>Aufnehmen</ion-label>
        </ion-tab-button>
        
        <ion-tab-button tab="account" href="/tabs/account">
          <ion-icon :icon="personCircle" />
          <ion-label>Account</ion-label>
        </ion-tab-button>

      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>


<script lang="ts">
import { 
  IonTabBar, IonTabButton, IonTabs, IonLabel, IonIcon, IonPage, IonRouterOutlet 
} from '@ionic/vue';

import { personCircle, save, ellipse } from 'ionicons/icons';


export default {
  name: 'Tabs',

  components: { 
    IonLabel, IonTabs, IonTabBar, IonTabButton, IonIcon, IonPage, IonRouterOutlet 
  },

  setup() {
    return {
      ellipse, 
      personCircle, 
      save,
    }
  }
}
</script>