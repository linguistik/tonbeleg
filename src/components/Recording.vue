<template :key="updateKey" >
  <div v-if="exists">
    <ion-card v-if="isOpen">
      <ion-card-header>
        <ion-card-title>{{ displayName }}</ion-card-title>
      </ion-card-header>
      <ion-card-content>
        Aufgenommen am:
        {{ getRecordingDate() }}<br />
        Anzahl Tonbelege:
        {{ displayPartsLength }}
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
            alreadyUploaded
              ? 'success'
              : selectedForUpload
              ? 'warning'
              : 'black'
          "
          :icon="arrowUp"
          @click="upload()"
          v-if="provideFunctionality"
        ></ion-icon>
        <ion-icon
          :icon="trash"
          @click="deleteRecording()"
          v-if="provideFunctionality"
        ></ion-icon>
        <ion-icon
          :icon="pencil"
          @click="rename()"
          v-if="provideFunctionality"
        ></ion-icon>
        <ion-icon
          :icon="cut"
          @click="edit()"
          v-if="provideFunctionality"
        ></ion-icon>
        <ion-icon
          :icon="help"
          @click="changeLicense()"
          v-if="provideFunctionality"
        ></ion-icon>

        <ion-icon
          :icon="chevronUpOutline"
          @click="toggleOpen()"
          slot="end"
        ></ion-icon>
      </ion-item>
    </ion-card>

    <ion-card v-else>
      <ion-card-content @click="toggleOpen()">
        {{ displayName }}
      </ion-card-content>
    </ion-card>
  </div>
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
  IonCardContent, toastController,
} from "@ionic/vue";

import router from "@/router";
import firebase from "@/backend/firebase-config";
import { replayAudioData, audioDaten } from "@/scripts/ReplayData";
import {
  getRecordingEntryUploadBoolean,
  removeRecordingEntry,
  setRecordingEntryName,
  setSelectedForUpload,
  insertUpdateFunction,
} from "@/scripts/RecordingStorage";
import RecordingData from '@/scripts/RecordingData';
import {UploadToFirebase} from "@/scripts/RecordingUpload";

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
  
  props: {
    recording: Object,
    provideFunctionality: {
      //pass false to disable interative elements. default is true
      type: Boolean,
      required: false,
      default: true,
    },
  },
  //methods & mounted glaube doch nicht

  setup(props: any, context: any) {
    // multi-lingual support
    const { t } = useI18n();

    const displayName = ref(props.recording.name);
    const displayPartsLength = ref(props.recording.parts.length==0 ? 1 : props.recording.parts.length);
    const exists = ref(true);
    const selectedForUpload = ref(props.recording.selectedForUpload);
    const alreadyUploaded = ref(props.recording.upload);

    const updateKey = ref(0);
    const forceUpdate = () => {
      updateKey.value += 1;
    };

    insertUpdateFunction(props.recording.timestamp, (editedEntry: RecordingData)=>{
      displayPartsLength.value = editedEntry.parts.length;
      selectedForUpload.value = editedEntry.selectedForUpload;
      alreadyUploaded.value = editedEntry.upload;
    })

    const currentUser = firebase.auth().currentUser;
    if (currentUser == null) return;

    let audioString = new Audio();

    const isOpen = ref(false);
    let currentTime = 0;
    let counter = 0;
    const playing = ref(false);

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
      if(props.recording.upload){
        const toast = await toastController
            .create({
              message: 'Recording has been uploaded before!',
              duration: 1000
            })
        return toast.present();
      }
      else {
        const currentUser = firebase.auth().currentUser;
        if (currentUser == null) return;
        selectedForUpload.value = !selectedForUpload.value;
        setSelectedForUpload(props.recording.timestamp, selectedForUpload.value);
        await UploadToFirebase();
        if (props.recording.upload) {
          const toast = await toastController
              .create({
                message: 'Recording was uploaded successfully!',
                duration: 1000
              })
          return toast.present();
        }
        console.log("upload this thing", props.recording.upload);
      }
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
    /**
     * actual delete of the entry
     */
    const actualDelete = async () => {
      removeRecordingEntry(props.recording);
      //context.emit("refreshEmit");
      exists.value = false;
      forceUpdate();
    }; //method: deleteFolder
    /**
     * actual rename of the entry
     * @param name, new name for the entry
     */
    const actualRename = (name: string) => {
      //props.recording is just a copy of the real object
      setRecordingEntryName(props.recording.timestamp, name);
      displayName.value = name;
      //context.emit("refreshEmit");
      forceUpdate();
    }; //method: actualRename
    /**
     * opens rename message box for entry
     */
    const rename = async () => {
      //TODO
      const alert = await alertController.create({  //create an alert
        message: "Choose a name",
        inputs: [
          {                       //a textarea to write a new Name into
            name: "textField",
            id: "textField",
            type: "text",
            attributes: {
              required: true,
              minlength: 1,
              maxlength: 20,
              inputMode: "text",
              value: displayName.value,
            },
            handler: () => {
              console.log("texteingabe erfolgt"); //is this handler really necessary? For some reason it is^^
            },
          },
        ], //inputs
        buttons: [                            //button to cancel the new name operation
          {
            text: "cancel",
            handler: () => {
              console.log("confirm cancel");
            },
          },
          {
            text: "OK",           //button to confirm the new name
            handler: (data) => {  //handles the input to the alerts textfield
              const x = data.textField;
              console.log(x);
              if (!(x.length === 0) && x.length <= 35) {
                //nur kleine und nicht leere eingaben
                actualRename(x);
              } else {
                console.log("not a valid name");
              }
            },
          },
        ],
      });
      await alert.present(); //shows the alert described above
    };

    /**
     * opens message box to confirm delete of the entry
     */
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
      updateKey,
      displayName,
      displayPartsLength,
      exists,
    }; //return
  }, //setup
}; //export default
</script>
<style scoped>
ion-icon {
  margin: 5px;
}
</style>