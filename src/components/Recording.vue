<template>
  <ion-card v-if="isOpen">
    <ion-card-header>
      <ion-card-title>{{ recording.name }}</ion-card-title>
    </ion-card-header>
    <ion-card-content>
      Aufgenommen am:
      {{ getRecordingDate() }}<br />
      Anzahl Aufnahmen:
      {{ recording.parts.length }}
    </ion-card-content>
    <ion-item>
    
      <ion-icon
        Left-icon
        :icon="playing ? pause : play"
        @click="playRec()"
        v-if="provideFunctionality"
      ></ion-icon>
      <ion-icon
        :color="
          alreadyUploaded ? 'success' : selectedForUpload ? 'warning' : 'black'
        "
        :icon="arrowUp"
        @click="upload()"
        v-if="provideFunctionality"
      ></ion-icon>
      <ion-icon :icon="trash" @click="deleteRecording()" v-if="provideFunctionality"></ion-icon>
      <ion-icon :icon="pencil" @click="rename()" v-if="provideFunctionality"></ion-icon>
      <ion-icon :icon="cut" @click="edit()" v-if="provideFunctionality"></ion-icon>
      <ion-icon :icon="help" @click="changeLicense()" v-if="provideFunctionality"></ion-icon>


      <ion-icon
        :icon="chevronUpOutline"
        @click="toggleOpen()"
        slot="end"
      ></ion-icon>

    </ion-item>
  </ion-card>

  <ion-card v-else>
    <ion-card-content @click="toggleOpen()">
      {{ recording.name }}
    </ion-card-content>
  </ion-card>
</template>


<script lang="ts">
import { ref } from "vue";

import { useI18n } from "vue-i18n";

import {
  arrowUp,
  chevronUpOutline,
  cut,
  help,
  pause,
  pencil,
  play,
  trash,
} from "ionicons/icons";

import {
  alertController,
  IonIcon,
  IonCard,
  IonItem,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
} from "@ionic/vue";

import router from "@/router";
import firebase from "@/backend/firebase-config";
import { replayAudioData, audioDaten } from "@/scripts/ReplayData";
import {
  getRecordingEntryUploadBoolean,
  removeRecordingEntry,
  setRecordingEntryName,
  setSelectedForUpload,
} from "@/scripts/RecordingStorage";

export default {
  name: "Recording",
  components: {
    IonCard,
    IonIcon,
    IonItem,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
  },

   /*methods: {
    async setEverything() {
      await loadUserSettings();
      await loadRecordings();
    },
  },
  mounted() {
    this.setEverything();
  },*/

  props: {
    recording: Object,
    provideFunctionality:{//pass false to disable interative elements. default is true
      type: Boolean,
      required: false,
      default: true
    }
  },
  //methods & mounted glaube doch nicht

  setup(props: any, context: any) {
    // multi-lingual support
    const { t } = useI18n();

    const currentUser = firebase.auth().currentUser;
    if (currentUser == null) return;

    const alreadyUploaded = ref(props.recording.upload);
    let audioString = new Audio();

    const isOpen = ref(false);
    let currentTime = 0;
    let counter = 0;
    const playing = ref(false);
    const selectedForUpload = ref(props.recording.selectedForUpload);

    const toggleOpen = () => {
      isOpen.value = !isOpen.value;
    };

    const getRecordingDate = () => {
      const date = new Date(parseInt(props.recording.timestamp));
      let day = date.getDate().toString();
      let month = (date.getMonth() + 1).toString();
      const year = date.getFullYear().toString();
      let hours = date.getHours().toString();
      let minutes = date.getMinutes().toString();

      if (minutes.length == 1) {
        minutes = "0" + minutes;
      }
      if (hours.length == 1) {
        hours = "0" + hours;
      }
      if (month.length == 1) {
        month = "0" + month;
      }
      if (day.length == 1) {
        day = "0" + day;
      }

      return day + "." + month + "." + year + ", " + hours + ":" + minutes;
    }; //method: getRecordingDate

    const edit = () => {
      router.push("/edit/" + props.recording.timestamp);
    };

    const changeLicense = async () => {
      const alert = await alertController.create({
        message: "Select a License for this recording.",
        buttons: [
          {
            text: "Cancel",
            handler: () => {
              console.log("confirm Cancel");
            },
          },
          {
            text: "OK",
            handler: () => {
              //TODO
            },
          },
        ],
      });
      await alert.present();
    };

    const upload = async () => {
      //TODO
      const currentUser = firebase.auth().currentUser;
      if (currentUser == null) return;

      console.log("upload this thing", props.recording.upload);
      selectedForUpload.value = !selectedForUpload.value;
      setSelectedForUpload(props.recording.timestamp, selectedForUpload.value);
      /*if(selectedForUpload.value) {
        addToUploadArray((await Filesystem.readFile({
          path: "/" + currentUser.uid + "/" + props.recording.timestamp + "/" + "0.raw",
          directory: Directory.Data,
          encoding: Encoding.UTF8,
        })).data, currentUser.uid, props.recording.timestamp.toString()); //warum nur aaaaaa's
      }
      else{
        deleteFromUploadArray(currentUser.uid.concat(props.recording.timestamp.toString()));
      }*/
    };

    const playRec = async () => {
      if (playing.value == false) {
        //TODO
        if (counter == 0) {
          audioString = await replayAudioData(
            props.recording.timestamp,
            currentUser.uid
          );
          counter++;
        }
        if (currentTime != 0) {
          audioString.currentTime = currentTime;
        }
        audioString.oncanplay = () => audioString.play();
        playing.value = !playing.value;
        (audioString.onended = () => (playing.value = !playing.value)),
          (counter = 0);
      } else {
        audioString.pause();
        currentTime = audioString.currentTime;
        playing.value = !playing.value;
      }
    };

    const actualDelete = async () => {
      removeRecordingEntry(props.recording);
      context.emit("refreshEmit");
    }; //method: deleteFolder

    const actualRename = (name: string) => {
      //props.recording is just a copy of the real object
      setRecordingEntryName(props.recording.timestamp, name);
      context.emit("refreshEmit");
    }; //method: actualRename

    const rename = async () => {
      //TODO
      const alert = await alertController.create({
        message: "Choose a name",
        inputs: [
          {
            name: "textField",
            id: "textField",
            type: "text",
            attributes: {
              required: true,
              minlength: 1,
              maxlength: 20,
              inputMode: "text",
            },
            handler: () => {
              console.log("texteingabe erfolgt"); //is this handler really necessary? For some reason it is^^
            },
          },
        ], //inputs
        buttons: [
          {
            text: "cancel",
            handler: () => {
              console.log("confirm cancel");
            },
          },
          {
            text: "OK",
            handler: (data) => {
              const x = data.textField;
              console.log(x);
              if(!(x.length === 0) && x.length<=35){ //nur kleine und nicht leere eingaben
                actualRename(x);
              }
              else{
                console.log("not a valid name");
              }

            },
          },
        ], //buttons
      }); //create alert
      await alert.present();
    }; //method rename

    const deleteRecording = async () => {
      //TODO delete entry in outsourced
      const alert = await alertController.create({
        message: "Do you really want to delete this file?",
        buttons: [
          {
            text: "Cancel",
            handler: () => {
              console.log("confirm Cancel");
            },
          },
          {
            text: "OK",
            handler: () => {
              actualDelete();
            },
          },
        ],
      });
      await alert.present();
    }; //method: deleteRecording

    return {
      t,
      trash,
      arrowUp,
      pencil,
      cut,
      chevronUpOutline,
      isOpen,
      play,
      pause,
      help,
      toggleOpen,
      getRecordingDate,
      edit,
      upload,
      deleteRecording,
      rename,
      playRec,
      playing,
      selectedForUpload,
      getRecordingEntryUploadBoolean,
      changeLicense,
      currentTime,
      audioDaten,
      replayAudioData,
      alreadyUploaded,
    }; //return
  }, //setup
}; //export default
</script>
<style scoped>
ion-icon {
  margin: 5px;
}
</style>