<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Tab 3</ion-title>
        </ion-toolbar>
      </ion-header>
      {{ folderName }}
        <ion-button @click="goBack()">
            Go Back
        </ion-button>
      <ExploreContainer name="Editing" />
    </ion-content>
  </ion-page>
</template>


<script lang="ts">
import { defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';

import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton
} from '@ionic/vue';

import ExploreContainer from '@/components/ExploreContainer.vue';

import router from '@/router';

export default defineComponent({
  name: 'TabAccount',

  components: { 
     
    IonHeader, IonToolbar, IonTitle, IonContent, IonPage,
    ExploreContainer, IonButton
  },

  props:{
      folderName: String
  },


  setup(){
    // multi-lingual support
    const { t } = useI18n();

  const goBack = ()=>{
      router.back();
  }
    return { t, goBack }
  }
});
</script>