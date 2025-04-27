<template>
  <v-container
    pa-1
  >
    <v-row>
      <v-col cols="1">
        <slot
          name="dragHandle"
        />
      </v-col>
      <v-col cols="3">
        <slot
          name="playerList"
        />
      </v-col>
      <v-col cols="6">
        <slot
          name="playerCode"
        />
      </v-col>
      <v-col cols="2">
        <slot
          name="playerDeleteItem"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'PlayerInput'
}
</script>
