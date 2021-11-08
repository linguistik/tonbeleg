<template>
  <ion-app>
    <SideMenu/>
    <ion-router-outlet :animated="true" id="sidemenu-content" />
  </ion-app>
</template>


<script lang="ts">
import { defineComponent } from 'vue';

import { 
  IonApp, 
  IonRouterOutlet
} from '@ionic/vue';

import SideMenu from '@/components/layout/SideMenu.vue';


export default defineComponent({
  name: 'App',
  components: {
    IonApp,
    IonRouterOutlet,
    SideMenu,
  }
});
</script>