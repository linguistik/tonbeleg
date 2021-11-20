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

  </ion-page>
</template>


<script lang="ts">
import { defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';
import PageHeader from '@/components/layout/PageHeader.vue';

import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent
} from '@ionic/vue';

import ExploreContainer from '@/components/ExploreContainer.vue';


export default defineComponent({
  name: 'TabSettings',

  components: { 
    PageHeader, 
    IonHeader, IonToolbar, IonTitle, IonContent, IonPage,
    ExploreContainer
  },

  setup(){
    // multi-lingual support
    const { t } = useI18n();

    return { t }
  }
})
</script>