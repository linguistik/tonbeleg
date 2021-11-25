<template>
  <ion-page>
    <PageHeader v-bind:title="t('general.appname')" />

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">{{ t("record.record_noun") }}</ion-title>
        </ion-toolbar>
      </ion-header>
      <!--  Hier ist der Button in der Mitte  -->
      <ion-fab vertical="center" horizontal="center" slot="fixed">


        <ion-fab-button
          v-if="recordingStatus == recordingStatusEnums.NOT_RECORDING "
          color="success"
          v-on:click="startRecordingTrigger()"
        >
          <ion-icon :icon="caretForwardOutline"></ion-icon>
        </ion-fab-button>

        <ion-fab-button
            v-else-if="recordingStatus == recordingStatusEnums.DOING_SMT "
            color="medium-shade"
        >
          <ion-icon :icon="caretForwardOutline"></ion-icon>
        </ion-fab-button>

        <ion-fab-button
            v-else
          color="danger"
          v-on:click="stopRecordingTrigger()"
        >
          <ion-icon :icon="stopSharp"></ion-icon>
        </ion-fab-button>

        <!--  Pause and Resume  -->
        <ion-fab-button
            v-if="recordingStatus == recordingStatusEnums.IS_RECORDING "
            color="primary-contrast"
            v-on:click="pauseRecordingTrigger()"
        >
          <ion-icon :icon="playSkipForwardOutline"></ion-icon>
        </ion-fab-button>

        <ion-fab-button
            v-if="recordingStatus == recordingStatusEnums.RECORDING_PAUSED "
            color="primary-contrast"
            v-on:click="continueRecordingTrigger()"
        >
          <ion-icon :icon="playOutline"></ion-icon>
        </ion-fab-button>
      </ion-fab>






    </ion-content>
  </ion-page>
</template>


<script lang="ts">
import { defineComponent, ref } from "vue";
import { useI18n } from "vue-i18n";
import PageHeader from "@/components/layout/PageHeader.vue";

import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonFab,
  IonFabButton,
  IonIcon,
} from "@ionic/vue";

import {
  VoiceRecorder,
  GenericResponse,
  //RecordingData,
  // VoiceRecorderPlugin,
  // CurrentRecordingStatus
} from "capacitor-voice-recorder";

import { caretForwardOutline, stopSharp, playSkipForwardOutline, playOutline } from "ionicons/icons";

import firebase from "@/backend/firebase-config";
import {
  Filesystem,
  Directory,
  //Encoding,
  //WriteFileResult,
  //ReaddirResult,
} from "@capacitor/filesystem";
//import { CapacitorException } from "@capacitor/core";

export default defineComponent({
  components: {
    PageHeader,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonPage,
    IonFab,
    IonFabButton,
    IonIcon,
  },

  setup() {
    // multi-lingual support
    const { t } = useI18n();

    //https://expertcodeblog.wordpress.com/2018/07/05/typescript-sleep-a-thread/
    //const delay = (ms: number)=>{return new Promise(resolve =>setTimeout(resolve,ms));};


    // Alles von hier: https://github.com/tchvu3/capacitor-voice-recorder#usage

    // Überprüfe ob ein Mic existiert.
    // z.B. Zeige eine Nachricht in der App an, dass ein Mic angeschlossen werden muss.
    VoiceRecorder.canDeviceVoiceRecord().then((result: GenericResponse) => {
      console.log(`Gibt es ein Mic? ${result.value}`);
    });

    // Der Browser fragt den Benutzer ob das Mikrofon aktiviert werden darf.
    // Das ist so ein kleines PopUp-Fenster im Browser.
    VoiceRecorder.requestAudioRecordingPermission().then(
      (result: GenericResponse) => {
        console.log(`Ist das Mic eingeschaltet? ${result.value}`);
      }
    );

    //
    VoiceRecorder.hasAudioRecordingPermission().then(
      (result: GenericResponse) => {
        console.log(`Darf die App aufzeichnen? ${result.value}`);
      }
    );


    const recordingStatusEnums = {
      NOT_RECORDING:0,
      IS_RECORDING:1,
      RECORDING_PAUSED:3,
      DOING_SMT:4,
    }
    // Start & Stop Recoding
    const recordingStatus =ref( recordingStatusEnums.NOT_RECORDING);

    const pauseRecordingTrigger = async () => {
      await VoiceRecorder.pauseRecording().then((result: GenericResponse) => {
        recordingStatus.value= recordingStatusEnums.RECORDING_PAUSED;
        console.log(recordingStatus);

      }).catch((error) => {
        recordingStatus.value = recordingStatusEnums.NOT_RECORDING;
        // "MISSING_PERMISSION", "ALREADY_RECORDING", "MICROPHONE_BEING_USED", "DEVICE_CANNOT_VOICE_RECORD", or "FAILED_TO_RECORD"
        console.log(error);
      });
    }


    const continueRecordingTrigger = async () => {
      await VoiceRecorder.resumeRecording().then((result: GenericResponse) => {
        recordingStatus.value= recordingStatusEnums.IS_RECORDING;
       console.log(recordingStatus);

    }).catch((error) => {
      recordingStatus.value = recordingStatusEnums.NOT_RECORDING;
      // "MISSING_PERMISSION", "ALREADY_RECORDING", "MICROPHONE_BEING_USED", "DEVICE_CANNOT_VOICE_RECORD", or "FAILED_TO_RECORD"
      console.log(error);
    });

    }
    const startRecordingTrigger = async () => {
      recordingStatus.value=recordingStatusEnums.DOING_SMT;
      await VoiceRecorder.startRecording()
        .then((result: GenericResponse) => {

          console.log(recordingStatus);
          console.log(result.value);
        })
        .catch((error) => {
          recordingStatus.value = recordingStatusEnums.NOT_RECORDING;
          // "MISSING_PERMISSION", "ALREADY_RECORDING", "MICROPHONE_BEING_USED", "DEVICE_CANNOT_VOICE_RECORD", or "FAILED_TO_RECORD"
          console.log(error);
        });
      recordingStatus.value= recordingStatusEnums.IS_RECORDING;
    };/*
    const pauseRecordingTrigger = async () => {
      try{
      await VoiceRecorder.pauseRecording()
          .then((result: GenericResponse) => console.log(result.value))
          .catch(error => console.log(error))

      }
      catch(error){
        console.log(error);
        recordingStatus.value=false;

      }

    }*/






    const stopRecordingTrigger = async () => {
      recordingStatus.value=recordingStatusEnums.DOING_SMT;
      let recordingData;
      console.log(recordingStatus);
      try {
        recordingData = await VoiceRecorder.stopRecording();
        recordingStatus.value = recordingStatusEnums.NOT_RECORDING;
        console.log(recordingData.value);
      } catch (error) {
        recordingStatus.value = recordingStatusEnums.NOT_RECORDING;
        // "RECORDING_HAS_NOT_STARTED" or "FAILED_TO_FETCH_RECORDING"
        console.log(error);

        //TODO error handling
        return;
      }








      //get userUID
      const currentUser = firebase.auth().currentUser;
      if (currentUser == null) return;
      const userUID = currentUser.uid;

      //create timestamp
      const timestamp = Date.now();

      //create folder for the specific user and safe to Directory.Data if it does not exist already
      try {
        await Filesystem.mkdir({
          path: "/" + userUID,
          directory: Directory.Data,
        });
      } catch (error) {
        if (error.message == "Current directory does already exist.") {
          //do nothing
          console.log("ahh yes the file is already created :D");
        } else {
          console.log(error);
        }
      }
      // create folder for the timestamp
      try {
        await Filesystem.mkdir({
          path: "/" + userUID + "/" + timestamp,
          directory: Directory.Data,
        });
      } catch (error) {
        console.log(error);
        //if that folder does already exist or cannot be created, we stop here. The data will be lost
        //TODO fix this
        return;
      }

      console.log("write to:"+ "/" + userUID + "/" + timestamp + "/" + "0.raw");

      //write file
      try {
        await Filesystem.writeFile({
          path: "/" + userUID + "/" + timestamp + "/" + "0.raw",
          data: recordingData.value.recordDataBase64,
          directory: Directory.Data,
        });
      } catch (error) {
        console.log(error);
        //TODO exception handling
      }
    
      //await delay(3000);
      console.log("read folder:"+ "/" + userUID + "/" + timestamp + "/");

      const readdir = await Filesystem.readdir({
        path: "/" + userUID,
        directory: Directory.Data
      });
      console.log("path:" + userUID + "/" + timestamp);
      console.log(readdir.files);
    };

    // VoiceRecorder.pauseRecording

    // VoiceRecorder.resumeRecording

    // Abspielen: https://github.com/tchvu3/capacitor-voice-recorder#playback



    return {
      t,
      recordingStatus,
      startRecordingTrigger,
      stopRecordingTrigger,
      continueRecordingTrigger,
      pauseRecordingTrigger,
      caretForwardOutline,
      stopSharp,
      recordingStatusEnums,
      playSkipForwardOutline,
      playOutline
    };
  },
});
</script>