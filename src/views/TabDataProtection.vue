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
        <ion-label text-wrap>
          <h2>
            Namensnennung
          </h2>
          <p>
            Wenn du dir die Namensnennung wünschst, aktiviere diese Einstellung. 
            Dann passieren großartige Dinge.
            Bla
            Bla 
          </p>
        </ion-label>
        <ion-toggle 
        slot="start" 
        name="namensnennung" 
        unchecked
        @IonChange="somethingChanged()"></ion-toggle>
      </ion-item>
      <ion-item>
        <ion-label text-wrap>
          <h2>
            Weitergabe unter gleichen Bedingungen
          </h2>
          <p>
            Wenn du dir die Weitergabe unter gleichen Bedingungen wünschst, aktiviere diese Einstellung. 
            Dann passieren großartige Dinge.
            Bla
            Bla 
          </p>
        </ion-label>
        <ion-toggle slot="start" name="weitergabe" unchecked></ion-toggle>
      </ion-item>
      
      <ion-item>
        
        <ion-label text-wrap>
          <h2>
            Keine Bearbeitung
          </h2>
          <p>
            Wenn du dir wünschst, dass deine Daten nicht bearbeitet werden, dann aktiviere diese Einstellung. 
            Dann passieren großartige Dinge.
            Bla
            Bla 
          </p>
        </ion-label>
        <ion-toggle slot="start" name="bearbeitung" unchecked></ion-toggle>
      </ion-item>

    </ion-list>
          <div id="container">
        <ion-label text-wrap>
          <h2>
            Deine Lizenz
          </h2>
          <p>
            Durch die obigen Angaben werden deine Daten unter der folgenden Lizenz gespeichert:
            {{licensePTR}}
          </p>
        </ion-label>
        </div>
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
import { defineComponent, ref } from 'vue';
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

    const licensePTR = ref('Deine Mega geile Lizenz');

    let i =0;
    const somethingChanged = ()=>{
      licensePTR.value = licensePTR.value + i;
      i=i+1;
      console.log(licensePTR.value);
    }

    return { t,somethingChanged, licensePTR }
  }
})
</script>

<style scoped>
#container p{
  font-size: 16px;
  line-height: 22px;
  padding: 10px;
}
#container h2{
  font-size: 24px;
  text-align:center;
}
</style>
