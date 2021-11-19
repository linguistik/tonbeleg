<template>
  <ion-page>
    <PageHeader v-bind:title="t('general.appname')" />

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Record</ion-title>
        </ion-toolbar>
      </ion-header>
      <!--  Hier ist der Button in der Mitte  -->
      <ExploreContainer name="Aufnehmen" />
      <ion-fab vertical="center" horizontal="center" slot="fixed">
        <ion-fab-button v-if="!recordingStatus" color="success" v-on:click="startRecordingTrigger()">
          <ion-icon :name="caretForwardOutline"></ion-icon>
        </ion-fab-button>
        <ion-fab-button v-else color="danger" v-on:click="stopRecordingTrigger()">
          <ion-icon :name="stopSharp"></ion-icon>
        </ion-fab-button>
      </ion-fab>


    </ion-content>
  </ion-page>
</template>


<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import PageHeader from '@/components/layout/PageHeader.vue';

import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonFab, IonFabButton, IonIcon,
} from '@ionic/vue';

import ExploreContainer from '@/components/ExploreContainer.vue'

import { 
  VoiceRecorder, 
  GenericResponse, 
  RecordingData, 
  // VoiceRecorderPlugin, 
  // CurrentRecordingStatus 
} from 'capacitor-voice-recorder';

import { 
  caretForwardOutline,
  stopSharp
} from 'ionicons/icons';


export default defineComponent({
  name: 'Tab3',

  components: { 
    PageHeader, 
    IonHeader, IonToolbar, IonTitle, IonContent, IonPage,
    IonFab, IonFabButton, IonIcon, ExploreContainer
  },

  setup(){
    // multi-lingual support
    const { t } = useI18n();


    // Alles von hier: https://github.com/tchvu3/capacitor-voice-recorder#usage

    // Überprüfe ob ein Mic existiert.
    // z.B. Zeige eine Nachricht in der App an, dass ein Mic angeschlossen werden muss.
    VoiceRecorder.canDeviceVoiceRecord()
    .then((result: GenericResponse) => {
      console.log(`Gibt es ein Mic? ${result.value}`)
    });

    // Der Browser fragt den Benutzer ob das Mikrofon aktiviert werden darf. 
    // Das ist so ein kleines PopUp-Fenster im Browser.
    VoiceRecorder.requestAudioRecordingPermission()
    .then((result: GenericResponse) => {
      console.log(`Ist das Mic eingeschaltet? ${result.value}`)
    });

    // 
    VoiceRecorder.hasAudioRecordingPermission()
    .then((result: GenericResponse) => {
      console.log(`Darf die App aufzeichnen? ${result.value}`)
    });

    // Start & Stop Recoding
    const recordingStatus = ref(false);  // Für Button

    const startRecordingTrigger = async () => {
      await VoiceRecorder.startRecording()
        .then((result: GenericResponse) => {
          recordingStatus.value = true
          console.log(result.value)
        })
        .catch(error => {
          recordingStatus.value = false
          // "MISSING_PERMISSION", "ALREADY_RECORDING", "MICROPHONE_BEING_USED", "DEVICE_CANNOT_VOICE_RECORD", or "FAILED_TO_RECORD"
          console.log(error)
        });
    }

    const stopRecordingTrigger = async () => {
      await VoiceRecorder.stopRecording()
        .then((result: RecordingData) => {
          recordingStatus.value = false
          console.log(result.value)
        })
        .catch(error => {
          recordingStatus.value = false
          // "RECORDING_HAS_NOT_STARTED" or "FAILED_TO_FETCH_RECORDING"
          console.log(error)
        });
    }

    // VoiceRecorder.pauseRecording

    // VoiceRecorder.resumeRecording

    // Abspielen: https://github.com/tchvu3/capacitor-voice-recorder#playback


    return { 
      t, 
      recordingStatus, startRecordingTrigger, stopRecordingTrigger,
      caretForwardOutline, stopSharp
    }
  }
});
</script>