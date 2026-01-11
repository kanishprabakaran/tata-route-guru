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
  },
  {
    id: 'cs6',
    name: 'Tata Power - Connaught Place Delhi',
    operator: 'Tata Power',
    lat: 28.6315,
    lng: 77.2167,
    chargerTypes: ['DC Fast', 'CCS2'],
    maxPower: 60,
    available: 4,
    total: 6,
    pricePerKwh: 19,
    rating: 4.6,
    amenities: ['Restroom', 'Cafe', 'WiFi', 'Mall'],
    status: 'available'
  },
  {
    id: 'cs7',
    name: 'EESL - Noida Sector 62',
    operator: 'EESL',
    lat: 28.6273,
    lng: 77.3714,
    chargerTypes: ['DC Fast', 'AC Slow'],
    maxPower: 50,
    available: 2,
    total: 4,
    pricePerKwh: 16,
    rating: 4.2,
    amenities: ['Restroom', 'WiFi'],
    status: 'available'
  },
  {
    id: 'cs8',
    name: 'ChargeZone - Gurugram Cyber Hub',
    operator: 'ChargeZone',
    lat: 28.4595,
    lng: 77.0266,
    chargerTypes: ['DC Fast', 'CCS2'],
    maxPower: 60,
    available: 3,
    total: 5,
    pricePerKwh: 20,
    rating: 4.8,
    amenities: ['Restroom', 'Cafe', 'WiFi', 'Lounge', 'Mall'],
    status: 'available'
  },
  {
    id: 'cs9',
    name: 'Tata Power - Mumbai BKC',
    operator: 'Tata Power',
    lat: 19.0654,
    lng: 72.8696,
    chargerTypes: ['DC Fast', 'CCS2', 'CHAdeMO'],
    maxPower: 60,
    available: 5,
    total: 8,
    pricePerKwh: 21,
    rating: 4.7,
    amenities: ['Restroom', 'Cafe', 'WiFi', 'Lounge'],
    status: 'available'
  },
  {
    id: 'cs10',
    name: 'Fortum - Pune Hinjewadi',
    operator: 'Fortum',
    lat: 18.5912,
    lng: 73.7380,
    chargerTypes: ['DC Fast', 'CCS2'],
    maxPower: 50,
    available: 2,
    total: 4,
    pricePerKwh: 18,
    rating: 4.4,
    amenities: ['Restroom', 'Cafe', 'WiFi'],
    status: 'available'
  },
  {
    id: 'cs11',
    name: 'EESL - Bangalore Electronic City',
    operator: 'EESL',
    lat: 12.8456,
    lng: 77.6603,
    chargerTypes: ['DC Fast', 'AC Slow'],
    maxPower: 50,
    available: 3,
    total: 6,
    pricePerKwh: 17,
    rating: 4.3,
    amenities: ['Restroom', 'Cafe'],
    status: 'available'
  },
  {
    id: 'cs12',
    name: 'Tata Power - Bangalore Whitefield',
    operator: 'Tata Power',
    lat: 12.9698,
    lng: 77.7500,
    chargerTypes: ['DC Fast', 'CCS2'],
    maxPower: 60,
    available: 4,
    total: 6,
    pricePerKwh: 19,
    rating: 4.5,
    amenities: ['Restroom', 'Cafe', 'WiFi', 'Mall'],
    status: 'available'
  },
  {
    id: 'cs13',
    name: 'ChargeZone - Chennai OMR',
    operator: 'ChargeZone',
    lat: 12.9516,
    lng: 80.2421,
    chargerTypes: ['DC Fast', 'CCS2'],
    maxPower: 50,
    available: 2,
    total: 4,
    pricePerKwh: 18,
    rating: 4.2,
    amenities: ['Restroom', 'WiFi'],
    status: 'available'
  },
  {
    id: 'cs14',
    name: 'Tata Power - Hyderabad HITEC City',
    operator: 'Tata Power',
    lat: 17.4435,
    lng: 78.3772,
    chargerTypes: ['DC Fast', 'CCS2', 'CHAdeMO'],
    maxPower: 60,
    available: 5,
    total: 8,
    pricePerKwh: 18,
    rating: 4.6,
    amenities: ['Restroom', 'Cafe', 'WiFi', 'Mall'],
    status: 'available'
  },
  {
    id: 'cs15',
    name: 'EESL - Kolkata Salt Lake',
    operator: 'EESL',
    lat: 22.5800,
    lng: 88.4179,
    chargerTypes: ['DC Fast', 'AC Slow'],
    maxPower: 50,
    available: 2,
    total: 4,
    pricePerKwh: 15,
    rating: 4.1,
    amenities: ['Restroom'],
    status: 'available'
  },
  {
    id: 'cs16',
    name: 'Fortum - Ahmedabad SG Highway',
    operator: 'Fortum',
    lat: 23.0469,
    lng: 72.5169,
    chargerTypes: ['DC Fast', 'CCS2'],
    maxPower: 60,
    available: 3,
    total: 5,
    pricePerKwh: 19,
    rating: 4.5,
    amenities: ['Restroom', 'Cafe', 'WiFi'],
    status: 'available'
  },
  {
    id: 'cs17',
    name: 'Tata Power - Jaipur MI Road',
    operator: 'Tata Power',
    lat: 26.9157,
    lng: 75.7997,
    chargerTypes: ['DC Fast', 'CCS2'],
    maxPower: 50,
    available: 2,
    total: 4,
    pricePerKwh: 17,
    rating: 4.3,
    amenities: ['Restroom', 'Cafe'],
    status: 'available'
  },
  {
    id: 'cs18',
    name: 'ChargeZone - Lucknow Gomti Nagar',
    operator: 'ChargeZone',
    lat: 26.8570,
    lng: 81.0139,
    chargerTypes: ['DC Fast', 'CCS2'],
    maxPower: 50,
    available: 1,
    total: 3,
    pricePerKwh: 16,
    rating: 4.0,
    amenities: ['Restroom', 'WiFi'],
    status: 'available'
  },
  {
    id: 'cs19',
    name: 'EESL - Chandigarh Sector 17',
    operator: 'EESL',
    lat: 30.7415,
    lng: 76.7836,
    chargerTypes: ['DC Fast', 'AC Slow'],
    maxPower: 50,
    available: 3,
    total: 4,
    pricePerKwh: 15,
    rating: 4.4,
    amenities: ['Restroom', 'Cafe'],
    status: 'available'
  },
  {
    id: 'cs20',
    name: 'Tata Power - Udaipur City Palace',
    operator: 'Tata Power',
    lat: 24.5764,
    lng: 73.6833,
    chargerTypes: ['DC Fast', 'CCS2'],
    maxPower: 50,
    available: 2,
    total: 3,
    pricePerKwh: 18,
    rating: 4.5,
    amenities: ['Restroom', 'Cafe', 'WiFi'],
    status: 'available'
  },
  {
    id: 'cs21',
    name: 'Fortum - Goa Panjim',
    operator: 'Fortum',
    lat: 15.4989,
    lng: 73.8278,
    chargerTypes: ['DC Fast', 'CCS2'],
    maxPower: 50,
    available: 2,
    total: 3,
    pricePerKwh: 20,
    rating: 4.6,
    amenities: ['Restroom', 'Cafe', 'WiFi', 'Beach Access'],
    status: 'available'
  },
  {
    id: 'cs22',
    name: 'ChargeZone - Surat Ring Road',
    operator: 'ChargeZone',
    lat: 21.1702,
    lng: 72.8311,
    chargerTypes: ['DC Fast', 'CCS2'],
    maxPower: 60,
    available: 4,
    total: 6,
    pricePerKwh: 17,
    rating: 4.3,
    amenities: ['Restroom', 'Cafe', 'WiFi'],
    status: 'available'
  },
  {
    id: 'cs23',
    name: 'Tata Power - Vadodara Alkapuri',
    operator: 'Tata Power',
    lat: 22.3072,
    lng: 73.1812,
    chargerTypes: ['DC Fast', 'CCS2'],
    maxPower: 50,
    available: 2,
    total: 4,
    pricePerKwh: 18,
    rating: 4.2,
    amenities: ['Restroom', 'Cafe'],
    status: 'available'
  },
  {
    id: 'cs24',
    name: 'EESL - Indore Vijay Nagar',
    operator: 'EESL',
    lat: 22.7533,
    lng: 75.8937,
    chargerTypes: ['DC Fast', 'AC Slow'],
    maxPower: 50,
    available: 2,
    total: 3,
    pricePerKwh: 15,
    rating: 4.1,
    amenities: ['Restroom'],
    status: 'available'
  },
  {
    id: 'cs25',
    name: 'Fortum - Nagpur Dharampeth',
    operator: 'Fortum',
    lat: 21.1458,
    lng: 79.0882,
    chargerTypes: ['DC Fast', 'CCS2', 'CHAdeMO'],
    maxPower: 60,
    available: 3,
    total: 5,
    pricePerKwh: 19,
    rating: 4.4,
    amenities: ['Restroom', 'Cafe', 'WiFi'],
    status: 'available'
  },
  {
    id: 'cs26',
    name: 'Tata Power - Nashik Mumbai Highway',
    operator: 'Tata Power',
    lat: 19.9975,
    lng: 73.7898,
    chargerTypes: ['DC Fast', 'CCS2'],
    maxPower: 50,
    available: 2,
    total: 4,
    pricePerKwh: 18,
    rating: 4.3,
    amenities: ['Restroom', 'Cafe'],
    status: 'available'
  },
  {
    id: 'cs27',
    name: 'ChargeZone - Coimbatore RS Puram',
    operator: 'ChargeZone',
    lat: 11.0168,
    lng: 76.9558,
    chargerTypes: ['DC Fast', 'CCS2'],
    maxPower: 50,
    available: 2,
    total: 3,
    pricePerKwh: 17,
    rating: 4.2,
    amenities: ['Restroom', 'WiFi'],
    status: 'available'
  },
  {
    id: 'cs28',
    name: 'EESL - Kochi Marine Drive',
    operator: 'EESL',
    lat: 9.9816,
    lng: 76.2757,
    chargerTypes: ['DC Fast', 'AC Slow'],
    maxPower: 50,
    available: 3,
    total: 4,
    pricePerKwh: 16,
    rating: 4.5,
    amenities: ['Restroom', 'Cafe', 'WiFi'],
    status: 'available'
  },
  {
    id: 'cs29',
    name: 'Tata Power - Mysore Palace Road',
    operator: 'Tata Power',
    lat: 12.3051,
    lng: 76.6551,
    chargerTypes: ['DC Fast', 'CCS2'],
    maxPower: 50,
    available: 2,
    total: 3,
    pricePerKwh: 17,
    rating: 4.4,
    amenities: ['Restroom', 'Cafe'],
    status: 'available'
  },
  {
    id: 'cs30',
    name: 'Fortum - Vizag Beach Road',
    operator: 'Fortum',
    lat: 17.7231,
    lng: 83.3013,
    chargerTypes: ['DC Fast', 'CCS2'],
    maxPower: 60,
    available: 3,
    total: 4,
    pricePerKwh: 18,
    rating: 4.6,
    amenities: ['Restroom', 'Cafe', 'WiFi', 'Beach View'],
    status: 'available'
  },
  {
    id: 'cs31',
    name: 'ChargeZone - Bhubaneswar Patia',
    operator: 'ChargeZone',
    lat: 20.3555,
    lng: 85.8245,
    chargerTypes: ['DC Fast', 'CCS2'],
    maxPower: 50,
    available: 2,
    total: 3,
    pricePerKwh: 16,
    rating: 4.1,
    amenities: ['Restroom'],
    status: 'available'
  },
  {
    id: 'cs32',
    name: 'Tata Power - Patna Kankarbagh',
    operator: 'Tata Power',
    lat: 25.5941,
    lng: 85.1376,
    chargerTypes: ['DC Fast', 'CCS2'],
    maxPower: 50,
    available: 1,
    total: 2,
    pricePerKwh: 17,
    rating: 3.9,
    amenities: ['Restroom'],
    status: 'available'
  },
  {
    id: 'cs33',
    name: 'EESL - Ranchi Main Road',
    operator: 'EESL',
    lat: 23.3441,
    lng: 85.3096,
    chargerTypes: ['DC Fast', 'AC Slow'],
    maxPower: 50,
    available: 2,
    total: 3,
    pricePerKwh: 15,
    rating: 4.0,
    amenities: ['Restroom'],
    status: 'available'
  },
  {
    id: 'cs34',
    name: 'Fortum - Dehradun Rajpur Road',
    operator: 'Fortum',
    lat: 30.3165,
    lng: 78.0322,
    chargerTypes: ['DC Fast', 'CCS2'],
    maxPower: 50,
    available: 2,
    total: 3,
    pricePerKwh: 19,
    rating: 4.5,
    amenities: ['Restroom', 'Cafe', 'WiFi'],
    status: 'available'
  },
  {
    id: 'cs35',
    name: 'Tata Power - Amritsar Golden Temple',
    operator: 'Tata Power',
    lat: 31.6200,
    lng: 74.8765,
    chargerTypes: ['DC Fast', 'CCS2'],
    maxPower: 50,
    available: 3,
    total: 4,
    pricePerKwh: 17,
    rating: 4.6,
    amenities: ['Restroom', 'Cafe', 'WiFi'],
    status: 'available'
  },
  {
    id: 'cs36',
    name: 'ChargeZone - Jammu Gandhi Nagar',
    operator: 'ChargeZone',
    lat: 32.7266,
    lng: 74.8570,
    chargerTypes: ['DC Fast', 'CCS2'],
    maxPower: 50,
    available: 1,
    total: 2,
    pricePerKwh: 18,
    rating: 4.0,
    amenities: ['Restroom'],
    status: 'available'
  },
  {
    id: 'cs37',
    name: 'EESL - Shimla Mall Road',
    operator: 'EESL',
    lat: 31.1048,
    lng: 77.1734,
    chargerTypes: ['DC Fast', 'AC Slow'],
    maxPower: 30,
    available: 1,
    total: 2,
    pricePerKwh: 16,
    rating: 4.3,
    amenities: ['Restroom', 'Cafe'],
    status: 'available'
  },
  {
    id: 'cs38',
    name: 'Tata Power - Manali Highway',
    operator: 'Tata Power',
    lat: 32.2396,
    lng: 77.1887,
    chargerTypes: ['DC Fast', 'CCS2'],
    maxPower: 50,
    available: 2,
    total: 2,
    pricePerKwh: 20,
    rating: 4.7,
    amenities: ['Restroom', 'Cafe', 'Mountain View'],
    status: 'available'
  },
  {
    id: 'cs39',
    name: 'Fortum - Guwahati GS Road',
    operator: 'Fortum',
    lat: 26.1445,
    lng: 91.7362,
    chargerTypes: ['DC Fast', 'CCS2'],
    maxPower: 50,
    available: 2,
    total: 3,
    pricePerKwh: 18,
    rating: 4.2,
    amenities: ['Restroom', 'Cafe'],
    status: 'available'
  },
  {
    id: 'cs40',
    name: 'ChargeZone - Siliguri Sevoke Road',
    operator: 'ChargeZone',
    lat: 26.7271,
    lng: 88.3953,
    chargerTypes: ['DC Fast', 'CCS2'],
    maxPower: 50,
    available: 2,
    total: 3,
    pricePerKwh: 17,
    rating: 4.1,
    amenities: ['Restroom', 'WiFi'],
    status: 'available'
  },
  {
    id: 'cs41',
    name: 'Tata Power - Raipur VIP Road',
    operator: 'Tata Power',
    lat: 21.2514,
    lng: 81.6296,
    chargerTypes: ['DC Fast', 'CCS2'],
    maxPower: 50,
    available: 2,
    total: 4,
    pricePerKwh: 17,
    rating: 4.2,
    amenities: ['Restroom', 'Cafe'],
    status: 'available'
  },
  {
    id: 'cs42',
    name: 'EESL - Thiruvananthapuram MG Road',
    operator: 'EESL',
    lat: 8.5241,
    lng: 76.9366,
    chargerTypes: ['DC Fast', 'AC Slow'],
    maxPower: 50,
    available: 2,
    total: 3,
    pricePerKwh: 16,
    rating: 4.4,
    amenities: ['Restroom', 'Cafe', 'WiFi'],
    status: 'available'
  },
  {
    id: 'cs43',
    name: 'Fortum - Mangalore Forum Mall',
    operator: 'Fortum',
    lat: 12.9141,
    lng: 74.8560,
    chargerTypes: ['DC Fast', 'CCS2'],
    maxPower: 60,
    available: 3,
    total: 4,
    pricePerKwh: 19,
    rating: 4.5,
    amenities: ['Restroom', 'Cafe', 'WiFi', 'Mall'],
    status: 'available'
  },
  {
    id: 'cs44',
    name: 'Tata Power - Mumbai-Pune Expressway',
    operator: 'Tata Power',
    lat: 18.7557,
    lng: 73.4091,
    chargerTypes: ['DC Fast', 'CCS2', 'CHAdeMO'],
    maxPower: 120,
    available: 6,
    total: 10,
    pricePerKwh: 22,
    rating: 4.8,
    amenities: ['Restroom', 'Cafe', 'WiFi', 'Lounge', 'Food Court'],
    status: 'available'
  },
  {
    id: 'cs45',
    name: 'ChargeZone - Delhi-Jaipur Highway',
    operator: 'ChargeZone',
    lat: 27.5530,
    lng: 76.6346,
    chargerTypes: ['DC Fast', 'CCS2'],
    maxPower: 60,
    available: 4,
    total: 6,
    pricePerKwh: 18,
    rating: 4.4,
    amenities: ['Restroom', 'Cafe', 'WiFi'],
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
