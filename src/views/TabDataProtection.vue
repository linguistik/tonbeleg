<template>
  <ion-page>
    <PageHeader v-bind:title="t('general.appname')" />


    <ion-content :fullscreen="true">
      
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Datenschutz</ion-title>
        </ion-toolbar>
      </ion-header>
    <ion-list>

      <ion-item>
        <ion-label text-wrap>Namensnennung</ion-label>
        <ion-toggle slot="start" name="namensnennung" unchecked></ion-toggle>
      </ion-item>

      <ion-item>
        <ion-label text-wrap>Weitergabe unter gleichen Bedingungen</ion-label>
        <ion-toggle slot="start" name="weitergabe" unchecked></ion-toggle>
      </ion-item>
      
      <ion-item>
        <ion-label text-wrap>Keine Bearbeitung</ion-label>
        <ion-toggle slot="start" name="bearbeitung" unchecked></ion-toggle>
      </ion-item>

    </ion-list>
    ABC
    </ion-content>

  </ion-page>
</template>

<!-- 
ion-toggle:
@ionChange=""
value
:checked
disabled
-->


<script lang="ts">
import { defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';
import PageHeader from '@/components/layout/PageHeader.vue';

import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonLabel, IonItem,IonToggle,
} from '@ionic/vue';



export default defineComponent({
  name: 'TabDataProtection',

  components: { 
    PageHeader, 
    IonHeader, IonToolbar, IonTitle, IonContent, IonPage, IonList, IonLabel, IonItem,IonToggle,
    
  },

  setup(){
    // multi-lingual support
    const { t } = useI18n();

    return { t }
  }
})
</script>
