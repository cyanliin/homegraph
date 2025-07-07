<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Ref } from 'vue'
import type { device } from '../types'
import { useFetch } from '@vueuse/core'

const devices: Ref<device[]> = ref([]);
const status = ref('');

async function onRefresh() {
  status.value = 'loading...';
  const { isFetching, error, data } = await useFetch('http://192.168.0.246:3000/device/getList').json();

  if (error.value) {
    status.value = 'Error fetching device list.'
    console.error(error.value)
    return
  }

  // 取得解析後的 JSON 陣列
  const result = data.value
  if (Array.isArray(result)) {
    devices.value = result as device[] // 強制轉型成符合型別
    status.value = 'done'
  } else {
    status.value = 'Unexpected data format.'
    console.warn('Invalid data format:', result)
  }
}


onMounted(() => {
  onRefresh();
})

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
            <td>{{ device.device_id }}</td>
            <td>{{ device.device_name }}</td>
            <td>{{ device.location }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </main>
</template>