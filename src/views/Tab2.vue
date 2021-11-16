<template>
  <ion-page>
    <PageHeader v-bind:title="t('general.appname')" />

    <ion-content :fullscreen="true">
      <ion-fab vertical="bottom" horizontal="center" slot="fixed">
    <ion-fab-button @click="toggleRecording()" color="dark" size="large">
      <ion-icon :icon="micOutline">
      </ion-icon>
    </ion-fab-button>
  </ion-fab>
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large" >Aufnehmen</ion-title>
        </ion-toolbar>
      </ion-header>
      <div id="container">
        <ion-label id="aufnehmen">Not Recording   </ion-label>
        <ion-progress-bar value="0.25" buffer="0.5" paused></ion-progress-bar>
      </div>
    </ion-content>

  </ion-page>
</template>


<script lang="ts">
import { defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';
import PageHeader from '@/components/layout/PageHeader.vue';

import { micOutline } from 'ionicons/icons';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonFab, IonFabButton, IonIcon, IonProgressBar, IonLabel
} from '@ionic/vue';

import ExploreContainer from '@/components/ExploreContainer.vue';

import { VoiceRecorder, VoiceRecorderPlugin, RecordingData, GenericResponse, CurrentRecordingStatus } from 'capacitor-voice-recorder';

export default defineComponent({
  name: 'Tab2',

  components: { 
    PageHeader, 
    IonHeader, IonToolbar, IonTitle, IonContent, IonPage,
    IonFab, IonFabButton, IonIcon, IonProgressBar, IonLabel
  },



  setup(){
    // multi-lingual support
    const { t } = useI18n();

    let audioRef = new Audio();

    let isRecording = false;

  const startRecording = () =>{
    VoiceRecorder.canDeviceVoiceRecord().then((result: GenericResponse) => console.log(result.value));
    VoiceRecorder.requestAudioRecordingPermission().then((result: GenericResponse) => console.log(result.value));

    VoiceRecorder.startRecording()
    .then((result: GenericResponse) => console.log(result.value))
    .catch(error => console.log(error))
  };

  const stopRecording = () =>{
    VoiceRecorder.stopRecording()
.then((result: RecordingData) => {
  console.log(result.value);
  audioRef = new Audio(result.value.recordDataBase64)
audioRef.oncanplaythrough = () => audioRef.play()
audioRef.load()
})
.catch(error => console.log(error))
  };

  const toggleRecording = () => {
    stopRecording();
    if(isRecording){
      console.log('stop recording');
      document.documentElement.style.setProperty('---micColor', 'white');
      document.documentElement.style.setProperty('---textColor', 'black');
      const element = document.getElementById('aufnehmen');
      if(element != null){
        element.innerText = "Not Recording";
      }
    }else{
      if(audioRef != null){
        audioRef.pause();
      }
      startRecording();
      console.log('start recording');
      document.documentElement.style.setProperty('---micColor', 'red');
      document.documentElement.style.setProperty('---textColor', 'red');
      const element = document.getElementById('aufnehmen');
      if(element != null){
        element.innerText = "Recording";
      }
    }
    isRecording = !isRecording;
  };

    return { t, micOutline, isRecording, toggleRecording }
  }
});


</script>

<style scoped>
#container {
  text-align: center;
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}
ion-icon {
  color: var(---micColor);
}

ion-content ion-progress-bar {
  margin: 20px 0;
  size: 25px
}

ion-content ion-label {
  margin: 20px 0;
  color: var(---textColor);
  font-size: 45px;
}



</style>