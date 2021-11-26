<!--<template>
  <ion-item>
    <ion-label>
      <strong>
        {{ folder }}
      </strong>
      <h5>
        Aufgenommen am:
        {{ getRecordingDate(folder) }}
        <br>
      </h5>
    </ion-label>
    <ion-icon :icon="arrowUp" @click="upload()"></ion-icon>
    <ion-icon :icon="trash" @click="loeschen(folder)"></ion-icon>
    <ion-icon :icon="pencil" @click="rename(folder)"></ion-icon>
  </ion-item>

</template>-->
<template>
  <ion-item v-if="isOpen">
    <ion-label>
      <strong>
        {{ folder }}
      </strong>
      <h5>
        Aufgenommen am:
        {{ getRecordingDate(folder) }}
        <br>
      </h5>
    </ion-label>
    <ion-icon :icon="arrowUp" @click="upload()"></ion-icon>
    <ion-icon :icon="trash" @click="loeschen(folder)"></ion-icon>
    <ion-icon :icon="pencil" @click="rename(folder)"></ion-icon>
    <ion-icon :icon="chevronDownOutline" @click="open()"></ion-icon>
  </ion-item>

  <ion-item v-else>
    <ion-label text-wrap>
      <strong>
        {{ folder }}
      </strong> </ion-label>
    <ion-icon  :icon="chevronBackOutline" @click="open()"></ion-icon>
  </ion-item>
</template>


<script lang="ts">
import {ref} from "vue";

import {useI18n} from "vue-i18n";

import {arrowUp, pencil, trash, chevronDownOutline, chevronBackOutline} from "ionicons/icons";

import {IonIcon, IonItem, IonLabel} from "@ionic/vue";


import router from '@/router';
import {Directory, Filesystem} from "@capacitor/filesystem";
import firebase from "@/backend/firebase-config";

export default {
  name: "Recording",
  components: {
    IonItem,
    IonIcon,
    IonLabel,
  },

  props: {
    folder: String,
  },
  //const folder = this.folder;
  setup() {
    // multi-lingual support
    const { t } = useI18n();

    const isOpen = ref(false);

    const open = () => {
      isOpen.value = !isOpen.value;
    };

    const currentUser = firebase.auth().currentUser;
    if (currentUser == null) return;
    const UserUID = currentUser.uid;

    const getRecordingDate = (folder: string) => {
      const date = new Date(parseInt(folder));
      console.log(parseInt(folder));
      console.log(date.getMonth());
      return (
          date.getDate() +
          "." +
          (date.getMonth()+1) +
          "." +
          date.getFullYear() +
          ", " +
          date.getHours() +
          ":" +
          date.getMinutes()

      );
      /*Filesystem.stat({
        path: UserUID + "/" + folder,
        directory: Directory.Data,
      });*/
      //
      //Why do months start at 0?
      //TODO
      //
    };
    const getDisplayName = (folder: string) => {
      const date = new Date(parseInt(folder));
      console.log(parseInt(folder));
      console.log(date.getMonth());
      return (
          date.getDate() +
          "." +
          (date.getMonth()+1) +
          "." +
          date.getFullYear() +
          "_" +
          date.getHours() +
          ":" +
          date.getMinutes()
      );
      //
      //Why do months start at 0?
      //TODO
      //
    };
    const edit = (folder: string)=>{
      //router.options.
      //router.push("/edit?folderName=abc");
      router.push("/edit/" + folder);
    }

    const upload = ()=>{
      //TODO
      console.log("updload this thing");
    }

    const rename =(folder: string)=>{
      //TODO

      Filesystem.rename({
        from: UserUID + "/" + folder,
        to: UserUID + "/" + "bambus",
        directory:Directory.Data,
        toDirectory:Directory.Data,
      });
      console.log("rename data");
    }
    const loeschen = async (folder: string)=>{
      //TODO
      try{
        await Filesystem.rmdir({
          path: "/" + UserUID +  "/" + folder,
          directory: Directory.Data,
          recursive: true,
        })
        console.log("successfully deleted");
      }
      catch(error){
        console.log(error);
        //TODO
      }
      console.log("delete this thing");
    }

    return {
      t,
      trash,
      arrowUp,
      pencil,
      chevronDownOutline,
      chevronBackOutline,
      isOpen,
      open,
      getRecordingDate,
      edit,
      upload,
      loeschen,
      rename,

    };
  },
};
</script>
<style scoped>
ion-icon {
  position: unset;
  right: 0px;
  top: 0;
}
ion-item {
  /* --min-height: 100px;*/
}
ion-contenc {
  --scroll-x: false;
  --scroll-y: false;
  scroll-x: false;
  scroll-y: false;
}
</style>