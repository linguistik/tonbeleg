<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-menu-button menu="sidemenu"></ion-menu-button>
      </ion-buttons>
      <ion-title>{{ title }}</ion-title>
    </ion-toolbar>
  </ion-header>
</template>


<script lang="ts">
import { defineComponent } from 'vue';

import { 
  IonHeader, IonToolbar, 
  IonButtons, IonMenuButton, IonTitle
} from '@ionic/vue';


export default defineComponent({
  name: "PageHeader",

  components: {
    IonHeader, IonToolbar, 
    IonButtons, IonMenuButton, IonTitle
  },

  props: {
    title: {
      type: String,
      required: true
    }
  }

});
</script>
