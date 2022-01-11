<template>
  <ion-icon :icon="icon" :size="size" :class="color"></ion-icon>
</template>

<script lang="ts">
import { IonIcon } from "@ionic/vue";

export default {
  name: "ColoredIcon",
  components: {
    IonIcon,
  },
  props: {
    icon: String,
    color: String,
    size: String
  },

  setup(props: any) {
    return {};
  },
};
</script>

<style scoped>
.red{
    color: #ff0000;
}
.green{
    color: #26ff00;
}
.blue{
    color: #0000ff;
}
.pink{
    color: #ff00e6;
}
.yellow{
    color: #fff200;
}
.cyan{
    color: #00ffc8;
}
.purple{
    color: #7700ff;
}
.black{
    color: #000000;
}
</style>