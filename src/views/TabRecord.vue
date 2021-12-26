<template>
  <ion-page>
    <PageHeader v-bind:title="t('general.appname')" />

    <ion-content :fullscreen="true">

        <ion-card v-if= "openModal"><!---brauch eig nen modal das kann man nicht wegklicken--->
          <ion-item>
            <ion-label v-model:position="fixed" >Name:</ion-label>
            <ion-input v-model="newName" placeholder ="choose a Name" v-model:inputmode="text"  v-model:value="lastRecording.name"></ion-input>
          </ion-item>
          <ion-item>
            <ion-label>Select Language</ion-label>
            <ion-select v-model:value="getFirstLanguage()[0]">
              <!---ion-select-option--->
            </ion-select>
          </ion-item>
          <ion-select>Select license</ion-select>
          <ion-button color= "danger" @click="deleteLastRecording()">delete</ion-button>
          <ion-button color= "success" @click="saveChanges()"> ok</ion-button>
        </ion-card>


      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Aufnehmen</ion-title>
        </ion-toolbar>
      </ion-header>
      <!--  Hier ist der Button in der Mitte  -->
      <ion-fab vertical="center" horizontal="center" slot="fixed" >


        <ion-fab-button
          v-if="recordingStatus == recordingStatusEnums.NOT_RECORDING"
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
          <ion-icon :icon="pauseOutline"></ion-icon>
        </ion-fab-button>

        <ion-fab-button
            v-if="recordingStatus == recordingStatusEnums.RECORDING_PAUSED "
            color="primary-contrast"
            v-on:click="continueRecordingTrigger()"
        >
          <ion-icon :icon="playOutline"></ion-icon>
        </ion-fab-button>
      </ion-fab>
<div id="text">
        <!--  Timer  -->
        <p>Zeit: {{timerString}}</p>
</div>

    </ion-content>
  </ion-page>
</template>


<script lang="ts">
import { defineComponent, ref } from "vue";
import { useI18n } from "vue-i18n";
import PageHeader from "@/components/layout/PageHeader.vue";
import {setRecordingEntryLanguage, setRecordingEntryName, removeLastRecordingEntry, getRecordingEntry, setRecordingLicense} from "@/scripts/RecordingStorage";

import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonFab,
  IonFabButton,
  IonIcon, IonInput, IonLabel, IonItem, IonCard,
} from "@ionic/vue";

import {
  VoiceRecorder,
  GenericResponse,
  //RecordingData,
  // VoiceRecorderPlugin,
  // CurrentRecordingStatus
} from "capacitor-voice-recorder";

import { caretForwardOutline, stopSharp, playSkipForwardOutline, playOutline, pauseOutline } from "ionicons/icons";

import firebase from "@/backend/firebase-config";
import {
  Filesystem,
  Directory,
  //Encoding,
  //WriteFileResult,
  //ReaddirResult,
} from "@capacitor/filesystem";
//import { CapacitorException } from "@capacitor/core";

import {insertRecordingEntry} from "@/scripts/RecordingStorage";
import RecordingData from "@/scripts/RecordingData";
import {getLicense, getFirstLanguage} from "@/scripts/UserSettingsStorage";
import {Encoding} from "@capacitor/filesystem";
//import router from "@/router";

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
    IonInput,
    IonItem, IonLabel, IonCard,
  },

  setup() {
    // multi-lingual support
    const { t } = useI18n();
    //const timer =ref( 0);
    //PopUpValuesForRecording
    const lastRecording = ref(new RecordingData(0,"",[],0,false,false,"","",[]));
    const openModal = ref(false);
    const newName = ref("");
    const newLanguage = ref("");
    const newLicense = ref("");



    const timer = ref(new Date(0))
    const timerString=ref(timer.value.toISOString().substr(11, 8));
    //https://expertcodeblog.wordpress.com/2018/07/05/typescript-sleep-a-thread/
    //const delay = (ms: number)=>{return new Promise(resolve =>setTimeout(resolve,ms));};

    // Alles von hier: https://github.com/tchvu3/capacitor-voice-recorder#usage
    try {
      // Überprüfe ob ein Mic existiert.
      // z.B. Zeige eine Nachricht in der App an, dass ein Mic angeschlossen werden muss.
      VoiceRecorder.canDeviceVoiceRecord().then((result: GenericResponse) => {
        console.log(`Gibt es ein Mic? ${result.value}`);
      }).catch((error)=>{console.log(error)});//Do remove the .catch block. The test won't like that

      // Der Browser fragt den Benutzer ob das Mikrofon aktiviert werden darf.
      // Das ist so ein kleines PopUp-Fenster im Browser.
      VoiceRecorder.requestAudioRecordingPermission().then(
        (result: GenericResponse) => {
          console.log(`Ist das Mic eingeschaltet? ${result.value}`);
        }
      ).catch((error)=>{console.log(error)});//Do remove the .catch block. The test won't like that

      //
      VoiceRecorder.hasAudioRecordingPermission().then(
        (result: GenericResponse) => {
          console.log(`Darf die App aufzeichnen? ${result.value}`);
        }
      ).catch((error)=>{console.log(error)});//Do remove the .catch block. The test won't like that
    } catch (error) {
      console.log(error);
    }

    const recordingStatusEnums = {
      NOT_RECORDING:0,
      IS_RECORDING:1,
      RECORDING_PAUSED:3,
      DOING_SMT:4,
    }
    // Start & Stop Recoding
    const recordingStatus =ref( recordingStatusEnums.NOT_RECORDING);

    const pauseRecordingTrigger = async () => {
      await VoiceRecorder.pauseRecording().then(() => {
        recordingStatus.value= recordingStatusEnums.RECORDING_PAUSED;
        console.log(recordingStatus);

      }).catch((error) => {
        recordingStatus.value = recordingStatusEnums.NOT_RECORDING;
        // "MISSING_PERMISSION", "ALREADY_RECORDING", "MICROPHONE_BEING_USED", "DEVICE_CANNOT_VOICE_RECORD", or "FAILED_TO_RECORD"
        console.log(error);
      });
    }


    const continueRecordingTrigger = async () => {
      await VoiceRecorder.resumeRecording().then(() => {
        recordingStatus.value= recordingStatusEnums.IS_RECORDING;
       console.log(recordingStatus);

    }).catch((error) => {
      recordingStatus.value = recordingStatusEnums.NOT_RECORDING;
      // "MISSING_PERMISSION", "ALREADY_RECORDING", "MICROPHONE_BEING_USED", "DEVICE_CANNOT_VOICE_RECORD", or "FAILED_TO_RECORD"
      console.log(error);
    });

    }
    const startRecordingTrigger = async () => {
      timer.value.setSeconds(0);
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
    };

    /*let audioRef = new Audio();
    const stopRecordingTrigger = async () =>{
      let recordingData;
      VoiceRecorder.stopRecording()
          .then((result: RecordingData) => {
            console.log(result.value);
            audioRef = new Audio(result.value.recordDataBase64)
            audioRef.oncanplaythrough = () => audioRef.play()
            audioRef.load()
          })
          .catch(error => console.log(error))
    };*/

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

      console.log(
        "write to:" + "/" + userUID + "/" + timestamp + "/" + "0.raw"
      );

      //write file
      try {
        await Filesystem.writeFile({
          path: "/" + userUID + "/" + timestamp + "/" + "0.raw",
          data: recordingData.value.recordDataBase64,
          directory: Directory.Data,
          encoding: Encoding.UTF8,
        });
      } catch (error) {
        console.log(error);
        //TODO exception handling
      }
      const dateObject= new Date(timestamp);
      const shownName= dateObject.getUTCDate().toString()+"."+(dateObject.getMonth() + 1).toString() +"."+ dateObject.getFullYear().toString() +", " + dateObject.getHours().toString()+":"+(dateObject.getMinutes()<=9 ? +"0" +dateObject.getMinutes().toString():+dateObject.getMinutes().toString());
      //create Entry in RecordingStorage //evtl über alert
      insertRecordingEntry(new RecordingData(timestamp,shownName,["0.raw"],timer.value.getSeconds(), false, false, getLicense(), currentUser.uid, getFirstLanguage()));
      openModal.value = !openModal.value;
      lastRecording.value = getRecordingEntry(timestamp);
      timer.value =  (new Date(0));
      timerString.value=timer.value.toISOString().substr(11,8);
    };//method: stopRecordingTrigger

    //Timer

    const timerHandler = async () => {
      if(recordingStatus.value==recordingStatusEnums.IS_RECORDING) {
        timer.value.setSeconds(timer.value.getSeconds()+1)
        timerString.value=timer.value.toISOString().substr(11, 8);
        console.log(timer.value);
      }
    }

    const clearVariables = () =>{
      newName.value = "";
      newLanguage.value = "";
      newLicense.value = "";
    }

    const saveChanges = async () =>{
      //TODO
      if(newName.value != "") {
        setRecordingEntryName(lastRecording.value.timestamp, newName.value);
      }
      if(newLanguage.value != "") {
        setRecordingEntryLanguage(lastRecording.value.timestamp, [newLanguage.value]);
      }
      if(newLicense.value != "") {
        setRecordingLicense(lastRecording.value.timestamp, newLicense.value);
      }
      openModal.value = !openModal.value;
      clearVariables();
    }

    const deleteLastRecording = async () =>{
      //TODO
      removeLastRecordingEntry();
      openModal.value = !openModal.value;
    }


    setInterval(() => {
      timerHandler(); // Now the "this" still references the component
    }, 1000);

    // Abspielen: https://github.com/tchvu3/capacitor-voice-recorder#playback

    return {
      t,
      recordingStatus,
      startRecordingTrigger,
      stopRecordingTrigger,
      continueRecordingTrigger,
      pauseRecordingTrigger,
      getLicense,
      setRecordingEntryLanguage,
      setRecordingEntryName,
      setRecordingLicense,
      getFirstLanguage,
      caretForwardOutline,
      stopSharp,
      recordingStatusEnums,
      playSkipForwardOutline,
      playOutline,
      timerString,
      pauseOutline,
      openModal,
      saveChanges,
      deleteLastRecording,
      lastRecording,
      newName,
    };
  },
});
</script>
<style scoped>
ion-fab-button{
  margin-bottom:20px;
  padding:0px;
  height:80px;
  width: 80px;
}
p{
  font-size:x-large;
  text-align: center;
  position: relative;
  margin-top: 60px;

}
</style>