<template>

  <ion-item>
    <ion-grid>
    <ion-row>
    <ion-col size="1">
    <ion-icon 
      :icon="removeCircle"
      @click="removeFromParent()"
      color="danger"
      size="large"
    ></ion-icon>
    </ion-col>
    <ion-col>
      <ion-item>
      <ion-label>
            Zweitsprache wählen
          </ion-label>
      <ion-select v-model="input" @ionChange="inputChanged()" >
        <ion-select-option 
            v-for="[short,language] in languages" 
            v-bind:key="short" 
            v-bind:value="short">
          {{language}}
        </ion-select-option>
      </ion-select>
      </ion-item>
    </ion-col>
    </ion-row>
    </ion-grid>
 </ion-item>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

import { IonIcon, IonItem, IonSelect, IonGrid, IonRow, IonCol, IonSelectOption, IonLabel } from "@ionic/vue";

import { removeCircle } from "ionicons/icons";
import firebase from '@/backend/firebase-config';
import 'firebase/firestore';

export default defineComponent({
  name: "MultipleElementsChild",
  components: {
    IonItem,
    IonIcon,
    IonSelect,
    IonGrid,
    IonRow,
    IonCol,
    IonSelectOption, IonLabel,

  },

  props: {
    id: Number,
  },


  setup(props: any, context: any) {
    const languages: string[][]=[];
    const input = ref("");
    let tempLanguage = " ";

    /**
     * läd mega scheiße progreamiert alle hardcoded languages
     */
    const loadLanguages = async() => {
      const db = firebase.firestore();
      const snapshot = await db.collection("data").doc("languages").get();
      const size = (await db.collection("data").doc("languages").get()).get("NoLanguages");
      for(let i=0;i<size;i++){
        languages[i]=snapshot.get(i.toString())
      }
    }

    /**
     *initializes child component with empty name and laods all languages
     */
    const initData = async () => {
      await loadLanguages();
      input.value=tempLanguage;
    };
    initData();

    /**
     * emits deletion of this child to parent element
     */
    const removeFromParent = () => {
      context.emit("remove", props.id);
    };

    /**
     * emits a changed input value of this child to parent element
     */
    const inputChanged = () => {
      context.emit("change", input.value, props.id);
    };

    /**
     * sets saved name on first load
     * @param name, saved name
     * @param index, index of child elements to make sure, correct child element gets the name
     */
    const initName = (name: string, index: number) => {
      if(props.id != index){console.log("err: shouldn`t exist")}
      tempLanguage=name;
    };


    return {
      removeCircle,
      removeFromParent,
      inputChanged,
      input,
      initName,
      languages,
      initData,
      loadLanguages
    };
  },
});
</script>

<style scoped>
ion-row{
  padding: 0px;
  margin: 0px;
}
ion-col{
  padding: 0px;
  margin: 0px;
}
ion-grid{
  padding: 0px;
  margin: 0px;
}

</style>