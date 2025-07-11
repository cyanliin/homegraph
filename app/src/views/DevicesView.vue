<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Ref } from 'vue'
import { RouterLink } from 'vue-router'
import type { device } from '@/types'
import { useFetch } from '@vueuse/core'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const devices: Ref<device[]> = ref([]);
const status = ref('');

async function onRefresh() {
  status.value = 'loading...';
  const { error, data } = await useFetch(import.meta.env.VITE_API_BASE_URL + '/device/getList').json();

  if (error.value) {
    status.value = 'Error fetching device list.'
    console.error(error.value)
    return
  }

  const result = data.value
  if (Array.isArray(result)) {
    devices.value = result as device[]
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
  <main class="container p-4 mx-auto md:p-8">
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle>裝置列表</CardTitle>
            <CardDescription>目前系統中所有已註冊的感測裝置。</CardDescription>
          </div>
          <Button @click="onRefresh" :disabled="status === 'loading...'">
            {{ status === 'loading...' ? '載入中...' : '重新整理' }}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead class="w-[100px]">ID</TableHead>
              <TableHead>裝置名稱</TableHead>
              <TableHead>位置</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="status !== 'done' && devices.length === 0">
              <TableCell colspan="3" class="text-center text-muted-foreground">{{ status }}</TableCell>
            </TableRow>
            <TableRow v-for="device in devices" :key="device.device_id">
              <TableCell class="font-medium">{{ device.device_id }}</TableCell>
              <TableCell>
                <RouterLink :to="{ name: 'device-detail', params: { id: device.device_id } }" class="font-medium text-primary hover:underline">
                  {{ device.device_name }}
                </RouterLink>
              </TableCell>
              <TableCell>{{ device.location || 'N/A' }}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <div class="text-xs text-muted-foreground">
          總共 {{ devices.length }} 個裝置
        </div>
      </CardFooter>
    </Card>
  </main>
</template>