<template>

  <ion-menu side="start" menu-id="sidemenu" content-id="sidemenu-content" :swipe-gesture="toggleSwipeMenu">
    <ion-header>
      <ion-toolbar color="primary" @click="close()">
        <ion-title>Menu</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-list>

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
          <ion-label>Lizenz</ion-label>
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
  IonContent, IonList, 
  IonMenuToggle, IonItem, IonIcon, IonLabel
} from '@ionic/vue';

import { settingsOutline, personOutline, documentLockOutline, bookOutline } from 'ionicons/icons';
import {useMenuSettings} from "@/scripts/ionicVueSettings/menuSettings";

export default defineComponent({
  name: "SideMenu",

  components: {
    IonMenu, 
    IonHeader, IonTitle, IonToolbar,
    IonContent, IonList, 
    IonMenuToggle, IonItem, IonIcon, IonLabel
  },


  setup() {

    /**
     * redirects user to given path
     * @param path, path user is redirected to
     */
    const toPage = async(path: string) => {
      console.log("from sidemenu move to ", path )
      menuController.close('sidemenu');
      router.push(path);
    }

    /**
     * closes sidemenu
     */
    const close = ()=>{
      menuController.close('sidemenu');
    }

    /**
     * opens the sidemenu
     */
    const openSidemenu = async() => {
      await menuController.enable(true, 'sidemenu');
      await menuController.open('sidemenu');
    }

    const {toggleSwipeMenu} = useMenuSettings();
    return {
      openSidemenu,
      toPage,
      close,
      toggleSwipeMenu,
      settingsOutline,
      personOutline,
      documentLockOutline,
      bookOutline
    }
  }
});
</script>


<style>
/* .my-sidemenu-menu {
  --width: 500px;
} */
</style>
