<template>

  <ion-menu side="start" menu-id="sidemenu" content-id="sidemenu-content">
    <ion-header>
      <ion-toolbar color="primary" @click="close()">
        <ion-title>Side Menu</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-list>
        <ion-list-header @click="close()">
          Sub Header
        </ion-list-header>

        <ion-menu-toggle auto-hide="false">
        <ion-item button @click="toPage('/tabs/tabsettings')">
          <ion-icon :icon="settingsOutline" slot="start"></ion-icon>
          <ion-label>Einstellungen</ion-label>
        </ion-item>
        </ion-menu-toggle>

        <ion-menu-toggle auto-hide="false">
        <ion-item button @click="toPage('/tabs/tabpersonaldata')">
          <ion-icon :icon="personOutline" slot="start"></ion-icon>
          <ion-label>Persönliche Daten</ion-label>
        </ion-item>
        </ion-menu-toggle>

        <ion-menu-toggle auto-hide="false">
        <ion-item button @click="toPage('/tabs/tabdataprotection')">
          <ion-icon :icon="documentLockOutline" slot="start"></ion-icon>
          <ion-label>Datenschutz</ion-label>
        </ion-item>
        </ion-menu-toggle>

        <ion-menu-toggle auto-hide="false">
        <ion-item button @click="toPage('/tabs/tabimprint')">
          <ion-icon :icon="bookOutline" slot="start"></ion-icon>
          <ion-label>Impressum</ion-label>
        </ion-item>
        </ion-menu-toggle>


      </ion-list>
    </ion-content>
  </ion-menu>

</template>


<script lang="ts">
import { defineComponent } from 'vue';
import router from '@/router';

import { 
  IonMenu, 
  menuController, 
  IonHeader, IonTitle, IonToolbar,
  IonContent, IonList, IonListHeader,
  IonMenuToggle, IonItem, IonIcon, IonLabel
} from '@ionic/vue';

import { settingsOutline, personOutline, documentLockOutline, bookOutline } from 'ionicons/icons';


export default defineComponent({
  name: "Menu",

  components: {
    IonMenu, 
    IonHeader, IonTitle, IonToolbar,
    IonContent, IonList, IonListHeader,
    IonMenuToggle, IonItem, IonIcon, IonLabel
  },


  setup() {

    const toPage = async(path: string) => {
      console.log("from sidemenu move to ", path )
      menuController.close('sidemenu');
      router.push(path);
    }

    const close = ()=>{
      menuController.close('sidemenu');
    }

    const openSidemenu = async() => {
      await menuController.enable(true, 'sidemenu');
      await menuController.open('sidemenu');
    }
    // menuController.close('sidemenu');


    return {
      openSidemenu,
      toPage,
      close,
      // icons
      settingsOutline, personOutline, documentLockOutline, bookOutline
    }
  }
});
</script>


<style>
/* .my-sidemenu-menu {
  --width: 500px;
} */
</style>
