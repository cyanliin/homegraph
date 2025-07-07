<script setup lang="ts">
import { ref } from 'vue'
import type { Ref } from 'vue'
import type { device } from '../types'
import { useFetch } from '@vueuse/core'

const devices: Ref<device[]> = ref([]);
const status = ref('');

async function onRefresh() {
  status.value = 'loading...';
  // const { isFetching, error, data } = await useFetch('http://192.168.0.246/api/')
}

</script>
<template>
  <main>
    <h1>Devices</h1>
    <button @click="onRefresh">Refesh</button>

    <div>
      <h2>Device List</h2>
      <div>{{ status }}</div>
      <table>
        <thead>
          <tr>
            <th>Id</th>
            <th>Name</th>
            <th>Location</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="device in devices" :key="device.device_id">
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
  </main>
</template>