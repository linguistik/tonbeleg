<template>
  <ion-page>
    <PageHeader v-bind:title="t('general.appname')" />

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">{{ t('record.record_noun') }}</ion-title>
        </ion-toolbar>
      </ion-header>
      <!--  Hier ist der Button in der Mitte  -->
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


import firebase from '@/backend/firebase-config';
import { Filesystem, Directory, Encoding, WriteFileResult, ReaddirResult, FilesystemDirectory } from '@capacitor/filesystem';

export default defineComponent({

  components: { 
    PageHeader, 
    IonHeader, IonToolbar, IonTitle, IonContent, IonPage,
    IonFab, IonFabButton, IonIcon
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
      try{
        const recordingData = await VoiceRecorder.stopRecording()
        recordingStatus.value = false
        console.log(recordingData.value)

        //create folder for the specific user and safe to Directory.Data if it does not exist already
        const currentUser = firebase.auth().currentUser;
        if(currentUser==null)
          return;
        const userUID = currentUser.uid;
        //create timestamp
        const timestamp = Date.now();
        //write file using timestamp
        await Filesystem.writeFile({
          path:userUID+'/'+timestamp,
          data: recordingData.value.recordDataBase64,
          directory: Directory.Data,
          recursive: true
        });

        //const audio = new Audio(recordingData.value.recordDataBase64);
        
        //then(async(result: RecordingData) => {
         /* await Filesystem.writeFile({
            path: 'test1',
            data: result.value.recordDataBase64
          }).then((writeFileResult: WriteFileResult)=>{console.log(writeFileResult)});*/
          /*await Filesystem.deleteFile({path: 'test1'});
          await Filesystem.readdir({
            path: "",
            //directory: Directory.ExternalStorage
          }).then((readDirResult: ReaddirResult)=>{console.log(readDirResult.files)});

          await Filesystem.getUri({path:'',directory: Directory.Data}).then(res=>{console.log(res.uri)});*/
        }
        catch (error){
          recordingStatus.value = false
          // "RECORDING_HAS_NOT_STARTED" or "FAILED_TO_FETCH_RECORDING"
          console.log(error)
        }
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