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
.gold{
    color: #ffd700;
}
.mediumspringgreen{
    color: #00fa9a;
}
.gray{
    color:  #808080;
}
.skyblue{
    color: #87ceeb;
}
.khaki{
    color: #f0e68c;
}
.rosybrown{
    color: #bc8f8f;
}
.thistle{
    color: #d8bfd8;
}
.hotpink{
    color: #ff69b4;
}
</style>