export interface device {
  device_id: number;
  device_name: string;
  location: number | null;
}

export interface sensor {
  sensor_id: number;
  sensor_name: string;
}

export interface reading {
  reading_id: number;
  value: number;
  timestamp: string;
  sensor_name: string;
}

export interface paginatedReadings {
  data: reading[];
  total: number;
  totalPages: number;
  currentPage: number;
}