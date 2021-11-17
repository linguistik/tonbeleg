<template>
  <ion-page>
    <PageHeader v-bind:title="t('general.appname')" />


    <ion-content :fullscreen="true">
      
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Impressum</ion-title>
        </ion-toolbar>
      </ion-header>
  <div id="container"><p>
    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
    </p></div>
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



export default defineComponent({
  name: 'Tab1',

  components: { 
    PageHeader, 
    IonHeader, IonToolbar, IonTitle, IonContent, IonPage,
    
  },

  setup(){
    // multi-lingual support
    const { t } = useI18n();

    return { t }
  }
})
</script>
<style scoped>
#container p{
  font-size: 16px;
  line-height: 22px;
  padding: 10px;
}
</style>