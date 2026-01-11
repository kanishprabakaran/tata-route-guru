export interface TataEV {
  id: string;
  name: string;
  batteryCapacity: number; // kWh
  range: number; // km (ARAI certified)
  efficiency: number; // km per kWh
  fastChargeRate: number; // kW max DC
  slowChargeRate: number; // kW AC
  image: string;
}

export const tataEVs: TataEV[] = [
  {
    id: 'nexon-ev-max',
    name: 'Tata Nexon EV Max',
    batteryCapacity: 40.5,
    range: 437,
    efficiency: 10.8,
    fastChargeRate: 50,
    slowChargeRate: 7.2,
    image: '/nexon-ev.png'
  },
  {
    id: 'nexon-ev',
    name: 'Tata Nexon EV',
    batteryCapacity: 30.2,
    range: 312,
    efficiency: 10.3,
    fastChargeRate: 50,
    slowChargeRate: 7.2,
    image: '/nexon-ev.png'
  },
  {
    id: 'tiago-ev',
    name: 'Tata Tiago EV',
    batteryCapacity: 24,
    range: 315,
    efficiency: 13.1,
    fastChargeRate: 50,
    slowChargeRate: 7.2,
    image: '/tiago-ev.png'
  },
  {
    id: 'tigor-ev',
    name: 'Tata Tigor EV',
    batteryCapacity: 26,
    range: 315,
    efficiency: 12.1,
    fastChargeRate: 25,
    slowChargeRate: 7.2,
    image: '/tigor-ev.png'
  },
  {
    id: 'punch-ev',
    name: 'Tata Punch EV',
    batteryCapacity: 35,
    range: 421,
    efficiency: 12,
    fastChargeRate: 50,
    slowChargeRate: 7.2,
    image: '/punch-ev.png'
  }
];

export interface ChargingStation {
  id: string;
  name: string;
  operator: string;
  lat: number;
  lng: number;
  chargerTypes: ('DC Fast' | 'AC Slow' | 'CCS2' | 'CHAdeMO')[];
  maxPower: number; // kW
  available: number;
  total: number;
  pricePerKwh: number; // INR
  rating: number;
  amenities: string[];
  status: 'available' | 'busy' | 'offline';
}

export const mockChargingStations: ChargingStation[] = [
  {
    id: 'cs1',
    name: 'Tata Power EZ Charge - Mathura',
    operator: 'Tata Power',
    lat: 27.4924,
    lng: 77.6737,
    chargerTypes: ['DC Fast', 'CCS2'],
    maxPower: 50,
    available: 2,
    total: 4,
    pricePerKwh: 18,
    rating: 4.5,
    amenities: ['Restroom', 'Cafe', 'WiFi'],
    status: 'available'
  },
  {
    id: 'cs2',
    name: 'EESL Charging Hub - Agra',
    operator: 'EESL',
    lat: 27.1767,
    lng: 78.0081,
    chargerTypes: ['DC Fast', 'AC Slow'],
    maxPower: 30,
    available: 1,
    total: 2,
    pricePerKwh: 15,
    rating: 4.0,
    amenities: ['Restroom'],
    status: 'available'
  },
  {
    id: 'cs3',
    name: 'Fortum Charge - Gwalior',
    operator: 'Fortum',
    lat: 26.2183,
    lng: 78.1828,
    chargerTypes: ['DC Fast', 'CCS2', 'CHAdeMO'],
    maxPower: 60,
    available: 3,
    total: 4,
    pricePerKwh: 20,
    rating: 4.7,
    amenities: ['Restroom', 'Cafe', 'WiFi', 'Lounge'],
    status: 'available'
  },
  {
    id: 'cs4',
    name: 'ChargeZone - Jhansi',
    operator: 'ChargeZone',
    lat: 25.4484,
    lng: 78.5685,
    chargerTypes: ['DC Fast'],
    maxPower: 50,
    available: 0,
    total: 2,
    pricePerKwh: 16,
    rating: 3.8,
    amenities: ['Restroom'],
    status: 'busy'
  },
  {
    id: 'cs5',
    name: 'Tata Power - Bhopal Highway',
    operator: 'Tata Power',
    lat: 23.2599,
    lng: 77.4126,
    chargerTypes: ['DC Fast', 'CCS2'],
    maxPower: 50,
    available: 2,
    total: 3,
    pricePerKwh: 18,
    rating: 4.3,
    amenities: ['Restroom', 'Cafe'],
    status: 'available'
  }
];

export interface RouteStop {
  id: string;
  type: 'start' | 'charging' | 'destination';
  name: string;
  lat: number;
  lng: number;
  arrivalBattery: number;
  departureBattery: number;
  chargeTime?: number; // minutes
  station?: ChargingStation;
  distance: number; // km from previous stop
  eta: string;
}

export interface RouteOption {
  id: string;
  type: 'fastest' | 'cheapest' | 'safest' | 'greenest';
  name: string;
  description: string;
  totalDistance: number;
  totalTime: number; // minutes
  totalCost: number; // INR
  chargingStops: number;
  co2Saved: number; // kg
  fuelSaved: number; // liters
  greenScore: number; // 0-100
  stops: RouteStop[];
  riskLevel: 'safe' | 'caution' | 'danger';
}

export interface Location {
  name: string;
  lat: number;
  lng: number;
}

export const indianCities: Location[] = [
  { name: 'New Delhi', lat: 28.6139, lng: 77.2090 },
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
  { name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
  { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
  { name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
  { name: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
  { name: 'Pune', lat: 18.5204, lng: 73.8567 },
  { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
  { name: 'Jaipur', lat: 26.9124, lng: 75.7873 },
  { name: 'Lucknow', lat: 26.8467, lng: 80.9462 },
  { name: 'Agra', lat: 27.1767, lng: 78.0081 },
  { name: 'Bhopal', lat: 23.2599, lng: 77.4126 },
  { name: 'Chandigarh', lat: 30.7333, lng: 76.7794 },
  { name: 'Goa', lat: 15.2993, lng: 74.1240 },
  { name: 'Udaipur', lat: 24.5854, lng: 73.7125 },
];
