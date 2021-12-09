<template>
  <ion-item>
    <ion-input v-model="input" @ionBlur="inputChanged"></ion-input>
    <ion-icon
      :icon="removeCircle"
      @click="removeFromParent()"
      color="danger"
    ></ion-icon>
  </ion-item>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

import { IonIcon, IonItem, IonInput } from "@ionic/vue";

import { removeCircle } from "ionicons/icons";

export default defineComponent({
  components: {
    IonItem,
    IonIcon,
    IonInput,
  },

  props: {
    id: Number,
  },


  setup(props: any, context: any) {
    const input = ref();
    const removeFromParent = () => {
      context.emit("remove", props.id);
    };
    const inputChanged = () => {
      context.emit("change", input.value, props.id);
    };



    const initName = (name: string, index: number) => {

      if(props.id != index){console.log("hier is5t was schief gegangen")}
      input.value=name;

    };

    return { removeCircle, removeFromParent, inputChanged, input, initName };
  },
});
</script>