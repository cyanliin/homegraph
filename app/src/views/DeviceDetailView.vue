<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFetch } from '@vueuse/core'
import type { device, paginatedReadings, sensor, reading } from '@/types'
import { formatInTimeZone, toDate } from 'date-fns-tz'
import { Calendar as CalendarIcon } from 'lucide-vue-next'
import type { DateRange } from 'radix-vue'
import { LineChart } from 'vue-chart-3'
import { Chart, registerables } from "chart.js";

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

Chart.register(...registerables);

const route = useRoute()
const router = useRouter()
const deviceId = route.params.id as string

const device: Ref<device | null> = ref(null)
const status = ref('loading...')

// --- 分頁與篩選的狀態管理 ---
// 直接從 URL 查詢參數初始化狀態，以防止掛載時不匹配。
// 這是解決重複請求/請求被取消問題的關鍵。
const currentPage = ref(Number(route.query.page) || 1)
const date = ref<DateRange | undefined>()
const sensors: Ref<sensor[]> = ref([])
const selectedSensor = ref((route.query.sensorId as string) || 'all')

const chartData = ref({
  labels: [] as string[],
  datasets: [] as any[],
});

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
  },
  scales: {
    x: {
      ticks: {
        // 自動跳過部分標籤以防止重疊
        autoSkip: true,
        // 設定 X 軸上最多顯示的刻度數量，例如 10 個
        maxTicksLimit: 10,
      },
    },
  },
});

// --- 資料擷取 ---
// 1. 取得所有可用的感測器類型，用於篩選下拉選單
useFetch(`${import.meta.env.VITE_API_BASE_URL}/sensor/getList`)
  .json<sensor[]>()
  .then(response => {
    if (response.data.value) {
      sensors.value = response.data.value
    }
  })
// 1. 取得裝置詳細資訊 (僅執行一次)
useFetch(`${import.meta.env.VITE_API_BASE_URL}/device/${deviceId}`)
  .json<device>()
  .then(response => {
    if (response.data.value) {
      device.value = response.data.value
    } else {
      status.value = 'Failed to load device details.'
      console.error(response.error)
    }
  })

const buildApiParams = (extraParams: Record<string, string> = {}) => {
  const params = new URLSearchParams();
  if (date.value?.from) {
    params.append('startDate', date.value.from.toISOString());
  }
  if (date.value?.to) {
    const endDate = new Date(date.value.to);
    endDate.setDate(endDate.getDate() + 1);
    params.append('endDate', endDate.toISOString());
  }
  if (selectedSensor.value && selectedSensor.value !== 'all') {
    params.append('sensorId', selectedSensor.value);
  }
  for (const key in extraParams) {
    params.append(key, extraParams[key]);
  }
  return params.toString();
};

// 2. 建立表格和圖表數據的響應式 URL
const readingsUrl = computed(() => 
  `${import.meta.env.VITE_API_BASE_URL}/reading/by-device/${deviceId}?${buildApiParams({ page: currentPage.value.toString(), limit: '60' })}`
);

// 建立圖表數據的響應式 URL
const chartApiUrl = computed(() => 
  `${import.meta.env.VITE_API_BASE_URL}/reading/by-device/${deviceId}?${buildApiParams({ limit: '300' })}`
);
// 3. 使用響應式 URL 搭配 useFetch。當 URL 變更時，它會自動重新擷取。
const { isFetching, error, data: readingsData } = useFetch(readingsUrl, {
  refetch: true, // This ensures it refetches when the URL changes
}).json<paginatedReadings>()

// --- 輔助函式 ---
const formatTimestamp = (timestamp: string) => {
  // 1. 確保字串是 new Date() 可以解析為 UTC 的格式。
  const utcDate = toDate(timestamp, { timeZone: 'UTC' });
  // 2. 將 UTC 日期格式化為目標時區。
  return formatInTimeZone(utcDate, 'Asia/Taipei', 'yyyy/MM/dd HH:mm:ss');
}

// 輔助函式，用於從 DOM 中取得解析後的 CSS 變數值。
// 這是必要的，因為 Chart.js 無法解析 `hsl(var(...))` 這樣的字串。
const getCssVar = (varName: string) => {
  if (typeof document === 'undefined') return '#000'; // Fallback for SSR
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
};

const processDataForChart = (readings: reading[]) => {
  if (!readings || readings.length === 0) {
    return { labels: [], datasets: [] };
  }

  // 反轉陣列，使其按時間順序排列 (從最舊到最新)
  const sortedReadings = [...readings].reverse();

  const labels = sortedReadings.map(r => formatInTimeZone(toDate(r.timestamp, { timeZone: 'UTC' }), 'Asia/Taipei', 'MM/dd HH:mm'));

  const dataBySensor = sortedReadings.reduce((acc, reading) => {
    if (!acc[reading.sensor_name]) {
      acc[reading.sensor_name] = [];
    }
    acc[reading.sensor_name].push(reading.value);
    return acc;
  }, {} as Record<string, number[]>);

  const chartColors: Record<string, string> = {
    temperature: getCssVar('--chart-1'),
    humidity: getCssVar('--chart-2'),
    co2: getCssVar('--chart-3'),
    light: getCssVar('--chart-4'),
    rain: getCssVar('--chart-5'),
  };

  const datasets = Object.entries(dataBySensor).map(([sensorName, data], index) => ({
    label: sensorName,
    data: data,
    borderColor: chartColors[sensorName.toLowerCase()] || getCssVar(`--chart-${(index % 5) + 1}`),
    tension: 0.1,
    fill: false,
    pointRadius: 2,
    borderWidth: 2,
  }));

  return { labels, datasets };
}

// 當日期範圍變更時，重設回第一頁
watch(date, () => {
  currentPage.value = 1
})

// 這個 watcher 是更新 URL 的唯一來源
// 當使用者變更篩選條件或頁面時。
watch([selectedSensor, currentPage], () => {
  const query: Record<string, string | undefined> = {};

  // 只有當感測器不是預設的 'all' 時，才將其加入查詢參數
  if (selectedSensor.value && selectedSensor.value !== 'all') {
    query.sensorId = selectedSensor.value;
  }

  // 只有當頁碼不是第一頁時，才將其加入查詢參數
  if (currentPage.value > 1) {
    query.page = String(currentPage.value);
  }
  
  // 使用 `router.replace` 來更新 URL，避免在瀏覽器歷史紀錄中留下大量項目。
  router.replace({ query });
});

// 這個 watcher 處理重設頁碼的業務邏輯
// 當主要篩選條件 (如感測器或日期) 變更時。
watch([selectedSensor, date], () => {
  if (currentPage.value !== 1) {
    currentPage.value = 1;
  }
});

// 監聽圖表 API 的 URL，並在變更時更新圖表數據
watch(chartApiUrl, async (newUrl) => {
  // 當篩選條件改變時，立即清除舊的圖表數據。
  // 這可以防止在等待新數據時，畫面上還殘留著舊的線條。
  chartData.value = { labels: [], datasets: [] };

  const { data } = await useFetch(newUrl).json<paginatedReadings>();
  if (data.value) {
    chartData.value = processDataForChart(data.value.data);
  }
}, { immediate: true }); // immediate: true 會讓它在元件掛載時立即執行一次

</script>

<template>
  <main class="container p-4 mx-auto md:p-8">
    <Breadcrumb class="mb-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">裝置列表</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{{ device?.device_name || '載入中...' }}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

    <Card class="mb-8">
      <CardHeader>
        <CardTitle>數據趨勢圖</CardTitle>
      </CardHeader>
      <CardContent>
        <LineChart v-if="chartData.datasets.length > 0" :chart-data="chartData" :options="chartOptions" />
        <div v-else class="flex items-center justify-center h-full text-muted-foreground">此範圍無圖表資料。</div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>{{ device?.device_name || '裝置詳情' }}</CardTitle>
            <CardDescription>
              顯示 {{ device?.device_name }} 的歷史感測數據。
            </CardDescription>
          </div>
          <div class="flex items-center gap-2">
            <Select v-model="selectedSensor">
              <SelectTrigger class="w-[180px]">
                <SelectValue placeholder="所有感測器" />
              </SelectTrigger>
              <SelectContent>
                <!-- 將 value 從空字串改為 "all" -->
                <SelectItem value="all">所有感測器</SelectItem>
                <SelectItem v-for="sensor in sensors" :key="sensor.sensor_id" :value="String(sensor.sensor_id)">
                  {{ sensor.sensor_name }}
                </SelectItem>
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger as-child>
                <Button
                  variant="outline"
                  :class="cn(
                    'w-[280px] justify-start text-left font-normal',
                    !date && 'text-muted-foreground',
                  )"
                >
                  <CalendarIcon class="w-4 h-4 mr-2" />
                  <template v-if="date?.from">
                    <template v-if="date.to">
                      {{ formatInTimeZone(date.from, 'Asia/Taipei', 'yyyy-MM-dd') }} - {{ formatInTimeZone(date.to, 'Asia/Taipei', 'yyyy-MM-dd') }}
                    </template>
                    <template v-else>
                      {{ formatInTimeZone(date.from, 'Asia/Taipei', 'yyyy-MM-dd') }}
                    </template>
                  </template>
                  <template v-else>
                    <span>選擇日期範圍</span>
                  </template>
                </Button>
              </PopoverTrigger>
              <PopoverContent class="w-auto p-0">
                <Calendar v-model.range="date" :columns="2" />
              </PopoverContent>
            </Popover>
            <Button variant="outline" @click="date = undefined" :disabled="!date">清除</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>感測器</TableHead>
              <TableHead>數值</TableHead>
              <TableHead class="text-right">時間</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="isFetching">
              <TableCell colspan="3" class="text-center text-muted-foreground">載入中...</TableCell>
            </TableRow>
            <TableRow v-else-if="error">
              <TableCell colspan="3" class="text-center text-destructive">讀取資料失敗。</TableCell>
            </TableRow>
            <TableRow v-else-if="!readingsData?.data || readingsData.data.length === 0">
              <TableCell colspan="3" class="text-center text-muted-foreground">此範圍無資料。</TableCell>
            </TableRow>
            <TableRow v-else v-for="reading in readingsData.data" :key="reading.reading_id">
              <TableCell class="font-medium">{{ reading.sensor_name }}</TableCell>
              <TableCell>{{ reading.value }}</TableCell>
              <TableCell class="text-right">{{ formatTimestamp(reading.timestamp) }}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter class="flex justify-center">
        <Pagination v-if="readingsData && readingsData.totalPages > 1" :total="readingsData.total || 0" :sibling-count="1" show-edges :items-per-page="60" v-model:page="currentPage">
          <PaginationContent v-slot="{ items }" class="flex items-center gap-1">
            <PaginationFirst />
            <PaginationPrevious />
            <template v-for="(item, index) in items">
              <PaginationItem v-if="item.type === 'page'" :key="index" :value="item.value" as-child>
                <Button class="w-10 h-10 p-0" :variant="item.value === currentPage ? 'default' : 'outline'">
                  {{ item.value }}
                </Button>
              </PaginationItem>
              <PaginationEllipsis v-else :key="item.type" :index="index" />
            </template>
            <PaginationNext />
            <PaginationLast />
          </PaginationContent>
        </Pagination>
      </CardFooter>
    </Card>
  </main>
</template>