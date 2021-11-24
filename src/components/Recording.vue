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
      <ion-button @click="edit(folder)"> Bearbeiten </ion-button>
      <ion-button @click="upload()"> Zum Hochladen markieren </ion-button>
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
import { ref } from "vue";

import { useI18n } from "vue-i18n";

import { chevronDownOutline, chevronBackOutline } from "ionicons/icons";

import { IonItem, IonIcon, IonLabel,  IonButton } from "@ionic/vue";

import router from '@/router';
export default {
  name: "Recording",
  components: {
    IonItem,
    IonIcon,
    IonLabel,
    
    IonButton,
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

    return {
      t,
      chevronDownOutline,
      chevronBackOutline,
      isOpen,
      open,
      getRecordingDate,
      edit,
      upload
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