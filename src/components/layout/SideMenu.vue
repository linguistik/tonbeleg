<template>

  <ion-menu side="start" menu-id="sidemenu" content-id="sidemenu-content">
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Side Menu</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-list>
        <ion-list-header>
          Sub Header
        </ion-list-header>

        <ion-menu-toggle auto-hide="false">
        <ion-item button @click="toPage('/tabs/tab3')">
          <ion-icon :icon="mail" slot="start"></ion-icon>
          <ion-label>Inbox</ion-label>
        </ion-item>
        </ion-menu-toggle>

        <ion-menu-toggle auto-hide="false">
        <ion-item button @click="toPage('/tabs/tab3')">
          <ion-icon :icon="paperPlane" slot="start"></ion-icon>
          <ion-label>Outbox</ion-label>
        </ion-item>
        </ion-menu-toggle>

        <ion-menu-toggle auto-hide="false">
        <ion-item button @click="toPage('/tabs/tab3')">
          <ion-icon :icon="heart" slot="start"></ion-icon>
          <ion-label>Favorites</ion-label>
        </ion-item>
        </ion-menu-toggle>

        <ion-menu-toggle auto-hide="false">
        <ion-item button @click="toPage('/tabs/tab3')">
          <ion-icon :icon="archive" slot="start"></ion-icon>
          <ion-label>Archived</ion-label>
        </ion-item>
        </ion-menu-toggle>

        <ion-menu-toggle auto-hide="false">
        <ion-item button @click="toPage('/tabs/tab3')">
          <ion-icon :icon="trash" slot="start"></ion-icon>
          <ion-label>Trash</ion-label>
        </ion-item>
        </ion-menu-toggle>

        <ion-menu-toggle auto-hide="false">
        <ion-item button @click="toPage('/tabs/tab3')">
          <ion-icon :icon="warning" slot="start"></ion-icon>
          <ion-label>Spam</ion-label>
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

import { mail, paperPlane, heart, archive, trash, warning } from 'ionicons/icons';


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
      console.log("Hello")
      menuController.close('sidemenu');
      router.push(path);
    }

    const openSidemenu = async() => {
      await menuController.enable(true, 'sidemenu');
      await menuController.open('sidemenu');
    }
    // menuController.close('sidemenu');


    return {
      openSidemenu,
      toPage,
      // icons
      mail, paperPlane, heart, archive, trash, warning
    }
  }
});
</script>


<style>
/* .my-sidemenu-menu {
  --width: 500px;
} */
</style>
