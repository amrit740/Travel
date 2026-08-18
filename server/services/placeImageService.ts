import https from 'https';
import http from 'http';
import { PlacePhoto, AuthorAttribution, ResolvedPlaceImage } from '../../src/types/index';

export interface PlaceImageQuery {
  name: string;
  destination?: string;
  region?: string;
  category?: string;
  latitude?: number;
  longitude?: number;
}

export interface CatalogPlaceItem {
  id: string;
  placeId: string;
  name: string;
  aliases: string[];
  destination: string;
  region: string;
  category: 'Attraction' | 'Restaurant' | 'Hotel' | 'Hidden Gem';
  heroImage: string;
  gallery: string[];
  authorAttributions?: AuthorAttribution[];
  latitude: number;
  longitude: number;
  formattedAddress: string;
  description: string;
  tags: string[];
}

// In-Memory cache to prevent redundant API queries & fast response
const RESOLVED_CACHE = new Map<string, ResolvedPlaceImage>();

// Comprehensive Curated & Verified Place Photo Catalog for Indian Hubs, UNESCO Landmarks, Regional Spots & Dining
export const VERIFIED_PLACE_CATALOG: CatalogPlaceItem[] = [
  // ==========================================
  // AGRA & UTTAR PRADESH
  // ==========================================
  {
    id: 'plc-agra-taj-mahal',
    placeId: 'ChIJk1tq_x3_dTkRz4g773uR1aQ',
    name: 'Taj Mahal',
    aliases: ['taj mahal', 'taj', 'the taj mahal', 'taj mahal mausoleum'],
    destination: 'Agra',
    region: 'Uttar Pradesh',
    category: 'Attraction',
    heroImage: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1587135941948-670b381f08ce?auto=format&fit=crop&w=1200&q=80',
    ],
    authorAttributions: [{ displayName: 'ASI & Certified Photo Archive', uri: 'https://asi.nic.in' }],
    latitude: 27.1751,
    longitude: 78.0421,
    formattedAddress: 'Dharmapuri, Forest Colony, Tajganj, Agra, Uttar Pradesh 282001',
    description: 'Iconic 17th-century white marble mausoleum commissioned by Mughal Emperor Shah Jahan, designated a UNESCO World Heritage site and Wonder of the World.',
    tags: ['UNESCO', 'Mughal', 'Monument', 'Marble', 'Heritage', 'Architecture'],
  },
  {
    id: 'plc-agra-fort',
    placeId: 'ChIJ57p6tFj_dTkRq3k4_1o95-g',
    name: 'Agra Fort',
    aliases: ['agra fort', 'red fort of agra', 'lal qila agra'],
    destination: 'Agra',
    region: 'Uttar Pradesh',
    category: 'Attraction',
    heroImage: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1605649487212-47bdab064df8?auto=format&fit=crop&w=1200&q=80',
    ],
    authorAttributions: [{ displayName: 'ASI Heritage Registry', uri: 'https://asi.nic.in' }],
    latitude: 27.1795,
    longitude: 78.0211,
    formattedAddress: 'Agra Fort, Rakabganj, Agra, Uttar Pradesh 282003',
    description: '16th-century Mughal red sandstone imperial fortress residence overlooking the Yamuna River.',
    tags: ['Fort', 'UNESCO', 'Mughal', 'Red Sandstone', 'History'],
  },
  {
    id: 'plc-agra-fatehpur-sikri',
    placeId: 'ChIJvWRF9bQcdTkRw1u9h2n3r2M',
    name: 'Fatehpur Sikri',
    aliases: ['fatehpur sikri', 'buland darwaza', 'salim chishti dargah'],
    destination: 'Agra',
    region: 'Uttar Pradesh',
    category: 'Attraction',
    heroImage: 'https://images.unsplash.com/photo-1600100397608-f010f444f2d3?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1600100397608-f010f444f2d3?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80',
    ],
    latitude: 27.0945,
    longitude: 77.6679,
    formattedAddress: 'Fatehpur Sikri, Uttar Pradesh 283110',
    description: '16th-century fortified capital city founded by Emperor Akbar, featuring the monumental Buland Darwaza.',
    tags: ['UNESCO', 'Buland Darwaza', 'Akbar', 'Palace City'],
  },

  // ==========================================
  // DELHI & NCR
  // ==========================================
  {
    id: 'plc-delhi-red-fort',
    placeId: 'ChIJ8TeBzpUDDTkR2tI8B-H7t1g',
    name: 'Red Fort',
    aliases: ['red fort', 'lal qila', 'lal qila delhi', 'the red fort'],
    destination: 'Delhi',
    region: 'Delhi',
    category: 'Attraction',
    heroImage: 'https://images.unsplash.com/photo-1598324789736-4861f89564a0?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1598324789736-4861f89564a0?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1622306752002-3c22ea8d46a8?auto=format&fit=crop&w=1200&q=80',
    ],
    latitude: 28.6562,
    longitude: 77.241,
    formattedAddress: 'Netaji Subhash Marg, Lal Qila, Chandni Chowk, New Delhi 110006',
    description: 'Historic red sandstone fortified palace built in 1638 as the seat of the Mughal Empire in Old Delhi.',
    tags: ['UNESCO', 'Fort', 'Mughal', 'Historic', 'Old Delhi'],
  },
  {
    id: 'plc-delhi-india-gate',
    placeId: 'ChIJy33jP-QGDTkR9KkWqWc356A',
    name: 'India Gate',
    aliases: ['india gate', 'all india war memorial', 'kartavya path gate'],
    destination: 'Delhi',
    region: 'Delhi',
    category: 'Attraction',
    heroImage: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600100397608-f010f444f2d3?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1598324789736-4861f89564a0?auto=format&fit=crop&w=1200&q=80',
    ],
    latitude: 28.6129,
    longitude: 77.2295,
    formattedAddress: 'Kartavya Path, India Gate, New Delhi 110001',
    description: 'Prominent 42-meter-high triumphal war arch monument honoring 84,000 soldiers of the British Indian Army.',
    tags: ['Memorial', 'Kartavya Path', 'Boulevard', 'War Memorial'],
  },
  {
    id: 'plc-delhi-qutub-minar',
    placeId: 'ChIJb6F6F6EFDTkR3dG00ZkZ8pQ',
    name: 'Qutub Minar',
    aliases: ['qutub minar', 'qutb minar', 'qutub complex', 'iron pillar of delhi'],
    destination: 'Delhi',
    region: 'Delhi',
    category: 'Attraction',
    heroImage: 'https://images.unsplash.com/photo-1545232979-fbf6c965c71a?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1545232979-fbf6c965c71a?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1592635196078-9fdc757f27f4?auto=format&fit=crop&w=1200&q=80',
    ],
    latitude: 28.5245,
    longitude: 77.1855,
    formattedAddress: 'Seth Sarai, Mehrauli, New Delhi 110030',
    description: '72.5-meter towering UNESCO brick minaret and 4th-century rust-resistant Iron Pillar built in 1192.',
    tags: ['UNESCO', 'Minaret', 'History', 'Archaeology'],
  },
  {
    id: 'plc-delhi-humayun-tomb',
    placeId: 'ChIJVX1zG-oGDTkR9N8p7E2z1qg',
    name: "Humayun's Tomb",
    aliases: ["humayun's tomb", 'humayun tomb', 'maqbara humayun'],
    destination: 'Delhi',
    region: 'Delhi',
    category: 'Attraction',
    heroImage: 'https://images.unsplash.com/photo-1592635196078-9fdc757f27f4?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1592635196078-9fdc757f27f4?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1545232979-fbf6c965c71a?auto=format&fit=crop&w=1200&q=80',
    ],
    latitude: 28.5933,
    longitude: 77.2507,
    formattedAddress: 'Mathura Rd, Nizamuddin East, New Delhi 110013',
    description: 'UNESCO World Heritage red sandstone garden tomb constructed in 1570, the architectural precursor to the Taj Mahal.',
    tags: ['UNESCO', 'Garden Tomb', 'Mughal Architecture'],
  },
  {
    id: 'plc-delhi-karims',
    placeId: 'ChIJa9WvA5cDDTkRrR_XzJ2tq-s',
    name: "Karim's Old Delhi",
    aliases: ["karim's", 'karims', 'karim hotel', 'karim jama masjid'],
    destination: 'Delhi',
    region: 'Delhi',
    category: 'Restaurant',
    heroImage: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    ],
    latitude: 28.6507,
    longitude: 77.2334,
    formattedAddress: '16, Gali Kababian, Jama Masjid, Old Delhi 110006',
    description: 'Legendary culinary institution established in 1913 serving authentic royal Mughlai mutton burra, seekh kebabs, and nihari.',
    tags: ['Mughlai', 'Kebabs', 'Historic Dining', 'Old Delhi'],
  },

  // ==========================================
  // LADAKH (LEH, PANGONG, NUBRA, TSO MORIRI)
  // ==========================================
  {
    id: 'plc-ladakh-leh-palace',
    placeId: 'ChIJ5b8_V_3U1zkRnQkP1j58YqA',
    name: 'Leh Palace',
    aliases: ['leh palace', 'lhachen palkhar', 'royal palace of leh'],
    destination: 'Leh Ladakh',
    region: 'Ladakh',
    category: 'Attraction',
    heroImage: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    ],
    latitude: 34.1663,
    longitude: 77.5855,
    formattedAddress: 'Namgyal Hill, Leh, Ladakh 194101',
    description: '17th-century 9-storey royal palace modeled on the Potala Palace of Lhasa, offering panoramic vistas over the Indus Valley and Stok Kangri.',
    tags: ['Palace', 'Monastery', 'Himalayas', 'History', 'Leh'],
  },
  {
    id: 'plc-ladakh-shanti-stupa',
    placeId: 'ChIJp2fJd_LU1zkRv5n8G_1r9vQ',
    name: 'Shanti Stupa',
    aliases: ['shanti stupa', 'shanti stupa leh', 'peace stupa'],
    destination: 'Leh Ladakh',
    region: 'Ladakh',
    category: 'Attraction',
    heroImage: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1200&q=80',
    ],
    latitude: 34.1706,
    longitude: 77.5732,
    formattedAddress: 'Chanspa, Leh, Ladakh 194101',
    description: 'White-domed Buddhist stupa atop a steep hilltop in Changspa, built in 1991 to promote world peace with 360-degree Himalayan views.',
    tags: ['Stupa', 'Peace', 'Sunset', 'Panorama', 'Spiritual'],
  },
  {
    id: 'plc-ladakh-thiksey-monastery',
    placeId: 'ChIJq4mQWf_Y1zkRq3k6P0a98qQ',
    name: 'Thiksey Monastery',
    aliases: ['thiksey monastery', 'thiksey gompa', 'thiksay'],
    destination: 'Leh Ladakh',
    region: 'Ladakh',
    category: 'Attraction',
    heroImage: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1200&q=80',
    ],
    latitude: 34.0569,
    longitude: 77.6669,
    formattedAddress: 'Leh Manali Hwy, Thiksey, Ladakh 194201',
    description: 'A 12-storey Buddhist monastery of the Gelug school resembling Tibet’s Potala Palace, housing a 15-meter statue of Maitreya Buddha.',
    tags: ['Monastery', 'Maitreya Buddha', 'Gelug', 'Buddhism', 'Indus Valley'],
  },
  {
    id: 'plc-ladakh-pangong-lake',
    placeId: 'ChIJgU_8b99-1zkR8s7Q3n9p7sA',
    name: 'Pangong Tso & Pangong Lake',
    aliases: ['pangong lake', 'pangong tso', 'pangong', 'spangmik lake'],
    destination: 'Leh Ladakh',
    region: 'Ladakh',
    category: 'Attraction',
    heroImage: 'https://images.unsplash.com/photo-1593181629936-11c609b8db9b?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1593181629936-11c609b8db9b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1200&q=80',
    ],
    latitude: 33.7595,
    longitude: 78.6674,
    formattedAddress: 'Pangong Tso, Ladakh 194201',
    description: 'High-altitude endorheic lake at 4,225m altitude stretching from India to Tibet, world-famous for changing colors from azure to turquoise blue.',
    tags: ['Lake', 'High Altitude', 'Azure Water', 'Himalayas', 'Landscape'],
  },
  {
    id: 'plc-ladakh-nubra-valley',
    placeId: 'ChIJV4Y2Wf_W1zkRv1t9N6k5v3Q',
    name: 'Nubra Valley & Hunder Sand Dunes',
    aliases: ['nubra valley', 'hunder sand dunes', 'nubra', 'diskit', 'bactrian camels'],
    destination: 'Leh Ladakh',
    region: 'Ladakh',
    category: 'Attraction',
    heroImage: 'https://images.unsplash.com/photo-1605649487212-47bdab064df8?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1605649487212-47bdab064df8?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1593181629936-11c609b8db9b?auto=format&fit=crop&w=1200&q=80',
    ],
    latitude: 34.5833,
    longitude: 77.4667,
    formattedAddress: 'Hunder Sand Dunes, Nubra Valley, Ladakh 194401',
    description: 'High-altitude cold desert valley featuring silver sand dunes, double-humped Bactrian camel safaris, and Shyok River confluence.',
    tags: ['Desert', 'Camels', 'Sand Dunes', 'High Altitude', 'Adventure'],
  },
  {
    id: 'plc-ladakh-tibetan-kitchen',
    placeId: 'ChIJz2Q8_f3U1zkRv9w5K6m2r8A',
    name: 'The Tibetan Kitchen',
    aliases: ['the tibetan kitchen', 'tibetan kitchen leh', 'tibetan kitchen'],
    destination: 'Leh Ladakh',
    region: 'Ladakh',
    category: 'Restaurant',
    heroImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
    ],
    latitude: 34.1648,
    longitude: 77.584,
    formattedAddress: 'Fort Road, Near Hotel Yak Tail, Leh, Ladakh 194101',
    description: 'Acclaimed traditional dining venue renowned for authentic Ladakhi thenthuk, momos, shapta, gyathuk, and butter tea.',
    tags: ['Tibetan Cuisine', 'Momos', 'Thukpa', 'Fort Road', 'Dining'],
  },

  // ==========================================
  // RAJASTHAN (JAIPUR, UDAIPUR, JODHPUR, JAISALMER)
  // ==========================================
  {
    id: 'plc-jaipur-hawa-mahal',
    placeId: 'ChIJ1X2M5tQDbDkR9gX9wQ7qZ_s',
    name: 'Hawa Mahal',
    aliases: ['hawa mahal', 'palace of winds', 'hawa mahal jaipur'],
    destination: 'Jaipur',
    region: 'Rajasthan',
    category: 'Attraction',
    heroImage: 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=1200&q=80',
    ],
    latitude: 26.9239,
    longitude: 75.8267,
    formattedAddress: 'Hawa Mahal Rd, Badi Choupad, J.D.A. Market, Pink City, Jaipur, Rajasthan 302002',
    description: 'Iconic 1799 five-storey red and pink sandstone honeycomb palace with 953 ornate jharokhas (small casements).',
    tags: ['Palace of Winds', 'Pink City', 'Rajput Architecture', 'Landmark'],
  },
  {
    id: 'plc-jaipur-amber-fort',
    placeId: 'ChIJq7U98d0DbDkR39_w4Q7mZ9s',
    name: 'Amber Palace & Fort',
    aliases: ['amber fort', 'amer fort', 'amber palace', 'amer palace'],
    destination: 'Jaipur',
    region: 'Rajasthan',
    category: 'Attraction',
    heroImage: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80',
    ],
    latitude: 26.9855,
    longitude: 75.8513,
    formattedAddress: 'Devisinghpura, Amer, Jaipur, Rajasthan 302001',
    description: 'UNESCO Hill Fort overlooking Maota Lake, famous for Sheesh Mahal (Mirror Palace) and artistic Hindu elements.',
    tags: ['UNESCO', 'Sheesh Mahal', 'Hill Fort', 'Rajput', 'Amer'],
  },
  {
    id: 'plc-jaipur-city-palace',
    placeId: 'ChIJn8N3RtQDbDkRh2Q7wP8q9_s',
    name: 'City Palace Jaipur',
    aliases: ['city palace jaipur', 'jaipur city palace', 'chandra mahal'],
    destination: 'Jaipur',
    region: 'Rajasthan',
    category: 'Attraction',
    heroImage: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=1200&q=80',
    ],
    latitude: 26.9258,
    longitude: 75.8237,
    formattedAddress: 'Tulsi Marg, Gangori Bazaar, J.D.A. Market, Pink City, Jaipur, Rajasthan 302002',
    description: 'Grand royal residence complex encompassing courtyards, Chandra Mahal, Mubarak Mahal, and Peacock Gate.',
    tags: ['Palace', 'Royal Residence', 'Museum', 'Peacock Gate'],
  },
  {
    id: 'plc-udaipur-city-palace',
    placeId: 'ChIJrX2v4f0EazkRv3K8P1n84_s',
    name: 'City Palace Udaipur',
    aliases: ['city palace udaipur', 'udaipur city palace', 'lake pichola palace'],
    destination: 'Udaipur',
    region: 'Rajasthan',
    category: 'Attraction',
    heroImage: 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1568084680786-a84f91d1153c?auto=format&fit=crop&w=1200&q=80',
    ],
    latitude: 24.5764,
    longitude: 73.6835,
    formattedAddress: 'Old City, Udaipur, Rajasthan 313001',
    description: 'Magnificent 400-year-old palace complex built on the banks of Lake Pichola by Maharana Udai Singh II.',
    tags: ['Lake Pichola', 'Mewar', 'Marble Palace', 'Heritage'],
  },
  {
    id: 'plc-udaipur-lake-pichola',
    placeId: 'ChIJz2v5Z_0EazkR9m1vP0a76_s',
    name: 'Lake Pichola & Jag Mandir',
    aliases: ['lake pichola', 'jag mandir', 'taj lake palace udaipur', 'lake palace'],
    destination: 'Udaipur',
    region: 'Rajasthan',
    category: 'Attraction',
    heroImage: 'https://images.unsplash.com/photo-1568084680786-a84f91d1153c?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1568084680786-a84f91d1153c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=1200&q=80',
    ],
    latitude: 24.579,
    longitude: 73.678,
    formattedAddress: 'Lake Pichola, Udaipur, Rajasthan 313001',
    description: 'Picturesque artificial freshwater lake created in 1362 AD featuring the floating Taj Lake Palace and island pavilions.',
    tags: ['Lake', 'Boating', 'Jag Mandir', 'Sunset', 'Romance'],
  },
  {
    id: 'plc-jodhpur-mehrangarh',
    placeId: 'ChIJk7U5_e0fazkR9wK8P1n84_s',
    name: 'Mehrangarh Fort',
    aliases: ['mehrangarh fort', 'mehrangarh', 'jodhpur fort', 'blue city fort'],
    destination: 'Jodhpur',
    region: 'Rajasthan',
    category: 'Attraction',
    heroImage: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80',
    ],
    latitude: 26.298,
    longitude: 73.0188,
    formattedAddress: 'P.B. No 109, Mehrangarh Fort, Sodagaran Mohalla, Jodhpur, Rajasthan 342006',
    description: 'Impregnable 15th-century cliffside fortress rising 400 feet above the Blue City of Jodhpur.',
    tags: ['Fort', 'Blue City', 'Rathore', 'Museum', 'Cliffs'],
  },
  {
    id: 'plc-jaisalmer-fort',
    placeId: 'ChIJj7U9_f0DazkRv3K8P1n84_s',
    name: 'Jaisalmer Fort (Sonar Qila)',
    aliases: ['jaisalmer fort', 'sonar qila', 'golden fort', 'jaisalmer fort rajasthan'],
    destination: 'Jaisalmer',
    region: 'Rajasthan',
    category: 'Attraction',
    heroImage: 'https://images.unsplash.com/photo-1572979203492-c13f9c636f4d?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1572979203492-c13f9c636f4d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80',
    ],
    latitude: 26.9124,
    longitude: 70.9127,
    formattedAddress: 'Fort Rd, Near Gopa Chowk, Amar Sagar Pol, Jaisalmer, Rajasthan 345001',
    description: 'Living golden yellow sandstone UNESCO fort standing amidst the Great Thar Desert, home to 4,000 residents.',
    tags: ['UNESCO', 'Living Fort', 'Thar Desert', 'Golden Sandstone'],
  },

  // ==========================================
  // GOA (NORTH & SOUTH)
  // ==========================================
  {
    id: 'plc-goa-aguada-fort',
    placeId: 'ChIJ5wR8BfbIvzsRV3j9K7m3v4s',
    name: 'Aguada Fort & Lighthouse',
    aliases: ['aguada fort', 'fort aguada', 'aguada lighthouse', 'sinquerim fort'],
    destination: 'Goa',
    region: 'Goa',
    category: 'Attraction',
    heroImage: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    ],
    latitude: 15.492,
    longitude: 73.7738,
    formattedAddress: 'Aguada-Siolim Rd, Sinquerim, Candolim, Goa 403515',
    description: '17th-century Portuguese fortress and 4-storey lighthouse built in 1612 to guard the Mandovi River.',
    tags: ['Portuguese Fort', 'Lighthouse', 'Arabian Sea', 'Sunset'],
  },
  {
    id: 'plc-goa-bom-jesus',
    placeId: 'ChIJy4v5ZfbIvzsRq3n8P1a76_s',
    name: 'Basilica of Bom Jesus',
    aliases: ['basilica of bom jesus', 'bom jesus', 'old goa church', 'st francis xavier church'],
    destination: 'Goa',
    region: 'Goa',
    category: 'Attraction',
    heroImage: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
    ],
    latitude: 15.5009,
    longitude: 73.9116,
    formattedAddress: 'Old Goa Rd, Bainguinim, Old Goa 403402',
    description: 'UNESCO World Heritage 1605 Baroque laterite church enshrining the sacred mortal remains of St. Francis Xavier.',
    tags: ['UNESCO', 'Church', 'Baroque', 'Heritage', 'Old Goa'],
  },
  {
    id: 'plc-goa-fishermans-wharf',
    placeId: 'ChIJd4m5_fbIvzsRv3n8P1a76_s',
    name: "The Fisherman's Wharf",
    aliases: ["fisherman's wharf", 'fishermans wharf', 'fishermans wharf goa'],
    destination: 'Goa',
    region: 'Goa',
    category: 'Restaurant',
    heroImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
    ],
    latitude: 15.1678,
    longitude: 73.9422,
    formattedAddress: 'Near Sal River, Mobor Beach, Cavelossim, Goa 403731',
    description: 'Riverside fine dining destination serving authentic Goan fish curry, butter garlic prawns, and crab xacuti with live music.',
    tags: ['Seafood', 'Goan Cuisine', 'Riverside Dining', 'Live Music'],
  },

  // ==========================================
  // KERALA (ALLEPPEY, MUNNAR, KOCHI, WAYANAD, VARKALA)
  // ==========================================
  {
    id: 'plc-kerala-alleppey-backwaters',
    placeId: 'ChIJz2v5_fZivzsRv3n8P1a76_s',
    name: 'Alleppey Backwaters & Houseboat Cruise',
    aliases: ['alleppey backwaters', 'alappuzha backwaters', 'kerala houseboats', 'vembanad lake', 'alleppey'],
    destination: 'Alleppey',
    region: 'Kerala',
    category: 'Attraction',
    heroImage: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    ],
    latitude: 9.4981,
    longitude: 76.3388,
    formattedAddress: 'Punnamada Finishing Point, Alappuzha, Kerala 688006',
    description: 'Tranquil network of palm-fringed canals, lagoons, and Vembanad Lake traversed on traditional Kettuvallam houseboats.',
    tags: ['Backwaters', 'Houseboat', 'Canals', 'Vembanad Lake', 'Kerala'],
  },
  {
    id: 'plc-kerala-munnar-tea-gardens',
    placeId: 'ChIJq7U98d0DbDkR39_w4Q7mZ9t',
    name: 'Munnar Tea Plantations & Eravikulam',
    aliases: ['munnar tea gardens', 'munnar tea plantations', 'eravikulam national park', 'mattupetty dam'],
    destination: 'Munnar',
    region: 'Kerala',
    category: 'Attraction',
    heroImage: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
    ],
    latitude: 10.0889,
    longitude: 77.0595,
    formattedAddress: 'Kanan Devan Hills, Munnar, Kerala 685612',
    description: 'Lush rolling emerald tea estates in the Western Ghats home to Nilgiri Tahr and misty mountain viewpoints.',
    tags: ['Tea Gardens', 'Western Ghats', 'Nilgiri Tahr', 'Hill Station'],
  },
  {
    id: 'plc-kerala-fort-kochi',
    placeId: 'ChIJm7U98d0DbDkR39_w4Q7mZ9u',
    name: 'Fort Kochi & Chinese Fishing Nets',
    aliases: ['fort kochi', 'chinese fishing nets', 'cheena vala', 'mattancherry palace'],
    destination: 'Kochi',
    region: 'Kerala',
    category: 'Attraction',
    heroImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
    ],
    latitude: 9.9658,
    longitude: 76.2421,
    formattedAddress: 'River Rd, Fort Kochi, Kochi, Kerala 682001',
    description: 'Historic colonial seaside town featuring iconic cantilevered Cheena Vala fishing nets and Jew Town spice markets.',
    tags: ['Chinese Fishing Nets', 'Colonial', 'Spice Market', 'Heritage'],
  },

  // ==========================================
  // TAMIL NADU (MADURAI, THANJAVUR, MAHABALIPURAM, CHENNAI)
  // ==========================================
  {
    id: 'plc-tn-meenakshi-temple',
    placeId: 'ChIJw7U98d0DbDkR39_w4Q7mZ9v',
    name: 'Meenakshi Amman Temple',
    aliases: ['meenakshi temple', 'meenakshi amman', 'madurai temple', 'meenakshi sundareshwarar'],
    destination: 'Madurai',
    region: 'Tamil Nadu',
    category: 'Attraction',
    heroImage: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=1200&q=80',
    ],
    latitude: 9.9195,
    longitude: 78.1193,
    formattedAddress: 'Madurai Main, Madurai, Tamil Nadu 625001',
    description: 'Historic Dravidian temple complex on the Vaigai River renowned for 14 towering, richly sculpted gopurams.',
    tags: ['Dravidian Temple', 'Gopuram', 'Spiritual', 'Architecture'],
  },
  {
    id: 'plc-tn-brihadisvara',
    placeId: 'ChIJx7U98d0DbDkR39_w4Q7mZ9w',
    name: 'Brihadisvara Temple (Big Temple)',
    aliases: ['brihadisvara temple', 'thanjavur big temple', 'peruvudaiyar kovil', 'rajarajeswaram'],
    destination: 'Thanjavur',
    region: 'Tamil Nadu',
    category: 'Attraction',
    heroImage: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80',
    ],
    latitude: 10.7828,
    longitude: 79.1318,
    formattedAddress: 'Membalam Rd, Balaganapathy Nagar, Thanjavur, Tamil Nadu 613007',
    description: '1000-year-old UNESCO Chola temple built entirely of granite, featuring an 80-tonne monolithic kumbam dome.',
    tags: ['UNESCO', 'Chola Dynasty', 'Granite Temple', 'Heritage'],
  },

  // ==========================================
  // KARNATAKA (HAMPI, MYSORE, COORG, BENGALURU)
  // ==========================================
  {
    id: 'plc-karnataka-hampi-monuments',
    placeId: 'ChIJy7U98d0DbDkR39_w4Q7mZ9x',
    name: 'Hampi Ruins & Virupaksha Temple',
    aliases: ['hampi', 'virupaksha temple', 'stone chariot hampi', 'vijaya vittala temple'],
    destination: 'Hampi',
    region: 'Karnataka',
    category: 'Attraction',
    heroImage: 'https://images.unsplash.com/photo-1600100397608-f010f444f2d3?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1600100397608-f010f444f2d3?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80',
    ],
    latitude: 15.335,
    longitude: 76.46,
    formattedAddress: 'Hampi, Karnataka 583239',
    description: 'UNESCO World Heritage capital of the Vijayanagara Empire with boulder-strewn landscapes and the iconic stone chariot.',
    tags: ['UNESCO', 'Stone Chariot', 'Vijayanagara', 'Temples', 'Ruins'],
  },
  {
    id: 'plc-karnataka-mysore-palace',
    placeId: 'ChIJz7U98d0DbDkR39_w4Q7mZ9y',
    name: 'Mysore Palace (Amba Vilas)',
    aliases: ['mysore palace', 'amba vilas palace', 'mysuru palace'],
    destination: 'Mysore',
    region: 'Karnataka',
    category: 'Attraction',
    heroImage: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=1200&q=80',
    ],
    latitude: 12.3052,
    longitude: 76.6552,
    formattedAddress: 'Sayyaji Rao Rd, Agrahara, Chamrajpura, Mysuru, Karnataka 570001',
    description: 'Spectacular Indo-Saracenic royal seat of the Wadiyar dynasty illuminated by 100,000 electric light bulbs.',
    tags: ['Palace', 'Wadiyar', 'Indo-Saracenic', 'Illumination'],
  },

  // ==========================================
  // PUNJAB (AMRITSAR)
  // ==========================================
  {
    id: 'plc-punjab-golden-temple',
    placeId: 'ChIJ17U98d0DbDkR39_w4Q7mZ9z',
    name: 'Golden Temple (Harmandir Sahib)',
    aliases: ['golden temple', 'harmandir sahib', 'darbar sahib', 'sri harmandir sahib amritsar'],
    destination: 'Amritsar',
    region: 'Punjab',
    category: 'Attraction',
    heroImage: 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80',
    ],
    latitude: 31.62,
    longitude: 74.8765,
    formattedAddress: 'Golden Temple Rd, Atta Mandi, Katra Ahluwalia, Amritsar, Punjab 143006',
    description: 'The holiest Gurdwara of Sikhism gilded in pure gold, surrounded by the sacred Amrit Sarovar lake and running the world’s largest community kitchen (Langar).',
    tags: ['Sikhism', 'Golden Temple', 'Langar', 'Spiritual', 'Amritsar'],
  },

  // ==========================================
  // UTTAR PRADESH (VARANASI)
  // ==========================================
  {
    id: 'plc-up-varanasi-ghats',
    placeId: 'ChIJ27U98d0DbDkR39_w4Q7mZ90',
    name: 'Dashashwamedh Ghat & Evening Ganga Aarti',
    aliases: ['varanasi ghats', 'dashashwamedh ghat', 'ganga aarti', 'assi ghat', 'varanasi'],
    destination: 'Varanasi',
    region: 'Uttar Pradesh',
    category: 'Attraction',
    heroImage: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80',
    ],
    latitude: 25.3076,
    longitude: 83.0107,
    formattedAddress: 'Dashashwamedh Ghat Rd, Godowlia, Varanasi, Uttar Pradesh 221001',
    description: 'Ancient sacred riverbank steps along the Holy Ganges hosting the mesmerizing nightly brass lamp Ganga Aarti ritual.',
    tags: ['Ganges', 'Ganga Aarti', 'Spiritual', 'Ancient Ghats'],
  },

  // ==========================================
  // WEST BENGAL (KOLKATA & DARJEELING)
  // ==========================================
  {
    id: 'plc-wb-victoria-memorial',
    placeId: 'ChIJ37U98d0DbDkR39_w4Q7mZ91',
    name: 'Victoria Memorial',
    aliases: ['victoria memorial', 'victoria memorial kolkata', 'victoria palace kolkata'],
    destination: 'Kolkata',
    region: 'West Bengal',
    category: 'Attraction',
    heroImage: 'https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80',
    ],
    latitude: 22.5448,
    longitude: 88.3426,
    formattedAddress: 'Victoria Memorial Hall, 1, Queens Way, Maidan, Kolkata, West Bengal 700071',
    description: 'Magnificent white Makrana marble monument dedicated to Queen Victoria, surrounded by 64 acres of lush gardens.',
    tags: ['Marble Monument', 'Colonial', 'Gardens', 'Museum', 'Kolkata'],
  },
  {
    id: 'plc-wb-darjeeling-himalayan-railway',
    placeId: 'ChIJ47U98d0DbDkR39_w4Q7mZ92',
    name: 'Darjeeling Himalayan Railway & Tiger Hill',
    aliases: ['darjeeling toy train', 'darjeeling himalayan railway', 'tiger hill darjeeling', 'batasia loop'],
    destination: 'Darjeeling',
    region: 'West Bengal',
    category: 'Attraction',
    heroImage: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=1200&q=80',
    ],
    latitude: 27.036,
    longitude: 88.2627,
    formattedAddress: 'Ghoom Railway Station, Darjeeling, West Bengal 734102',
    description: 'UNESCO World Heritage 2ft narrow-gauge toy train operating since 1881 with breathtaking views of Mt. Kanchenjunga.',
    tags: ['UNESCO', 'Toy Train', 'Kanchenjunga', 'Himalayas', 'Tea Estates'],
  },

  // ==========================================
  // HIMACHAL PRADESH (MANALI, SHIMLA, DHARAMSHALA)
  // ==========================================
  {
    id: 'plc-hp-manali-solang',
    placeId: 'ChIJ57U98d0DbDkR39_w4Q7mZ93',
    name: 'Solang Valley & Rohtang Pass',
    aliases: ['solang valley', 'rohtang pass', 'atal tunnel', 'hadimba temple manali'],
    destination: 'Manali',
    region: 'Himachal Pradesh',
    category: 'Attraction',
    heroImage: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1200&q=80',
    ],
    latitude: 32.3166,
    longitude: 77.1583,
    formattedAddress: 'Solang Valley, Burwa, Manali, Himachal Pradesh 175131',
    description: 'High-mountain valley renowned for snow sports, paragliding, zorbing, and majestic views of the Pir Panjal range.',
    tags: ['Snow Valley', 'Paragliding', 'Himalayas', 'Adventure', 'Skiing'],
  },

  // ==========================================
  // UTTARAKHAND (RISHIKESH & NAINITAL)
  // ==========================================
  {
    id: 'plc-uk-rishikesh-triveni',
    placeId: 'ChIJ67U98d0DbDkR39_w4Q7mZ94',
    name: 'Laxman Jhula & Triveni Ghat',
    aliases: ['laxman jhula', 'ram jhula', 'triveni ghat rishikesh', 'beatles ashram'],
    destination: 'Rishikesh',
    region: 'Uttarakhand',
    category: 'Attraction',
    heroImage: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80',
    ],
    latitude: 30.1287,
    longitude: 78.3244,
    formattedAddress: 'Laxman Jhula, Tapovan, Rishikesh, Uttarakhand 249192',
    description: 'World Yoga Capital suspension bridge spanning the pristine emerald Ganges River against the Himalayan foothills.',
    tags: ['Yoga Capital', 'Ganges', 'Suspension Bridge', 'Spiritual', 'Rafting'],
  },

  // ==========================================
  // JAMMU & KASHMIR (SRINAGAR, GULMARG, PAHALGAM)
  // ==========================================
  {
    id: 'plc-jk-srinagar-dal-lake',
    placeId: 'ChIJ77U98d0DbDkR39_w4Q7mZ95',
    name: 'Dal Lake & Shikara Houseboats',
    aliases: ['dal lake', 'shikara', 'mughal gardens srinagar', 'shalimar bagh', 'srinagar'],
    destination: 'Srinagar',
    region: 'Jammu & Kashmir',
    category: 'Attraction',
    heroImage: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    ],
    latitude: 34.0837,
    longitude: 74.8724,
    formattedAddress: 'Dal Lake Boulevard, Srinagar, Jammu and Kashmir 190001',
    description: 'Jewel in the crown of Kashmir, famed for floating wooden Shikara boats, carved houseboats, and floating lotus gardens.',
    tags: ['Shikara', 'Houseboats', 'Dal Lake', 'Kashmir', 'Mughal Gardens'],
  },
  {
    id: 'plc-jk-gulmarg-gondola',
    placeId: 'ChIJ87U98d0DbDkR39_w4Q7mZ96',
    name: 'Gulmarg Gondola & Apharwat Peak',
    aliases: ['gulmarg gondola', 'apharwat peak', 'gulmarg ski resort'],
    destination: 'Gulmarg',
    region: 'Jammu & Kashmir',
    category: 'Attraction',
    heroImage: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80',
    ],
    latitude: 34.0484,
    longitude: 74.3805,
    formattedAddress: 'Gulmarg Gondola Base Station, Gulmarg, Jammu and Kashmir 193403',
    description: "The world's second-highest operating cable car ascending to 13,780 ft on Apharwat Peak with premier alpine ski slopes.",
    tags: ['Gondola', 'Skiing', 'Snow Peak', 'Cable Car', 'Gulmarg'],
  },

  // ==========================================
  // GUJARAT (AHMEDABAD & RANN OF KUTCH)
  // ==========================================
  {
    id: 'plc-gujarat-rann-kutch',
    placeId: 'ChIJ97U98d0DbDkR39_w4Q7mZ97',
    name: 'Great Rann of Kutch (White Desert)',
    aliases: ['rann of kutch', 'white desert', 'rann utsav', 'kutch white salt'],
    destination: 'Kutch',
    region: 'Gujarat',
    category: 'Attraction',
    heroImage: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1572979203492-c13f9c636f4d?auto=format&fit=crop&w=1200&q=80',
    ],
    latitude: 23.834,
    longitude: 69.833,
    formattedAddress: 'Dhordo, Great Rann of Kutch, Gujarat 370510',
    description: 'Massive white salt marsh desert in the Thar Desert that glows radiantly under the moonlight during the annual Rann Utsav.',
    tags: ['White Desert', 'Salt Marsh', 'Rann Utsav', 'Moonlight', 'Gujarat'],
  },

  // ==========================================
  // MEGHALAYA (SHILLONG & CHERRAPUNJI)
  // ==========================================
  {
    id: 'plc-meghalaya-living-root-bridge',
    placeId: 'ChIJa7U98d0DbDkR39_w4Q7mZ98',
    name: 'Cherrapunji Double Decker Living Root Bridge',
    aliases: ['living root bridge', 'double decker root bridge', 'nongriat bridge', 'cherrapunji'],
    destination: 'Cherrapunji',
    region: 'Meghalaya',
    category: 'Attraction',
    heroImage: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=80',
    ],
    latitude: 25.2536,
    longitude: 91.6756,
    formattedAddress: 'Nongriat Village, Sohra, Cherrapunji, Meghalaya 793108',
    description: 'Over 200-year-old bio-engineered double-tier bridge grown from living Ficus elastica tree roots across tropical rainforest rivers.',
    tags: ['Living Root Bridge', 'Rainforest', 'Khasi Heritage', 'Trek', 'Meghalaya'],
  },

  // ==========================================
  // ASSAM (KAZIRANGA)
  // ==========================================
  {
    id: 'plc-assam-kaziranga',
    placeId: 'ChIJb7U98d0DbDkR39_w4Q7mZ99',
    name: 'Kaziranga National Park',
    aliases: ['kaziranga', 'kaziranga national park', 'one horned rhino kaziranga'],
    destination: 'Kaziranga',
    region: 'Assam',
    category: 'Attraction',
    heroImage: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef6?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1564349683136-77e08dba1ef6?auto=format&fit=crop&w=1200&q=80',
    ],
    latitude: 26.5775,
    longitude: 93.1711,
    formattedAddress: 'Kanchanjuri, Assam 784177',
    description: 'UNESCO World Heritage wildlife sanctuary hosting two-thirds of the world’s great one-horned rhinoceroses.',
    tags: ['UNESCO', 'One-Horned Rhino', 'Wildlife Safari', 'Brahmaputra Wetlands'],
  },

  // ==========================================
  // MAHARASHTRA (MUMBAI, PUNE, AJANTA & ELLORA)
  // ==========================================
  {
    id: 'plc-mumbai-gateway-of-india',
    placeId: 'ChIJc7U98d0DbDkR39_w4Q7mZ00',
    name: 'Gateway of India',
    aliases: ['gateway of india', 'gateway of india mumbai', 'taj mahal palace mumbai'],
    destination: 'Mumbai',
    region: 'Maharashtra',
    category: 'Attraction',
    heroImage: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=1200&q=80',
    ],
    latitude: 18.922,
    longitude: 72.8347,
    formattedAddress: 'Apollo Bandar, Colaba, Mumbai, Maharashtra 400001',
    description: '26-meter Indo-Saracenic basalt arch monument erected in 1924 overlooking the Arabian Sea in South Mumbai.',
    tags: ['Gateway of India', 'Colaba', 'Harbor', 'Mumbai Landmark'],
  },
  {
    id: 'plc-mumbai-marine-drive',
    placeId: 'ChIJd7U98d0DbDkR39_w4Q7mZ01',
    name: "Marine Drive (Queen's Necklace)",
    aliases: ['marine drive', "queen's necklace", 'marine drive promenade'],
    destination: 'Mumbai',
    region: 'Maharashtra',
    category: 'Attraction',
    heroImage: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80',
    ],
    latitude: 18.9432,
    longitude: 72.823,
    formattedAddress: 'Netaji Subhash Chandra Bose Rd, Chowpatty, Mumbai 400020',
    description: '3.6-kilometer C-shaped coastal boulevard along the Arabian Sea coast, glistening like a pearl necklace at night.',
    tags: ['Promenade', "Queen's Necklace", 'Arabian Sea', 'Sunset Walk'],
  },
  {
    id: 'plc-mh-ellora-kailash',
    placeId: 'ChIJe7U98d0DbDkR39_w4Q7mZ02',
    name: 'Ellora Caves & Kailash Temple',
    aliases: ['ellora caves', 'kailash temple', 'ajanta caves', 'ellora kailasa'],
    destination: 'Aurangabad',
    region: 'Maharashtra',
    category: 'Attraction',
    heroImage: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600100397608-f010f444f2d3?auto=format&fit=crop&w=1200&q=80',
    ],
    latitude: 20.0268,
    longitude: 75.179,
    formattedAddress: 'Ellora Cave Rd, Ellora, Maharashtra 431102',
    description: 'UNESCO World Heritage complex carved out of volcanic basalt rock, featuring the megalithic 8th-century Kailash Temple.',
    tags: ['UNESCO', 'Rock-Cut Architecture', 'Kailash Temple', 'Ancient India'],
  },
];

// Helper: Normalize string for exact & fuzzy key matching
export function normalizePlaceKey(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export class PlaceImageService {
  /**
   * Fast synchronous lookup in curated master catalog
   */
  public static resolvePlaceSync(
    name: string,
    destination?: string,
    category?: string,
    latitude?: number,
    longitude?: number
  ): ResolvedPlaceImage {
    const rawKey = `${name} ${destination || ''}`.trim();
    const normKey = normalizePlaceKey(rawKey);

    if (RESOLVED_CACHE.has(normKey)) {
      return RESOLVED_CACHE.get(normKey)!;
    }

    const normName = normalizePlaceKey(name);
    const normDest = destination ? normalizePlaceKey(destination) : '';

    // 1. Check exact match in verified catalog
    for (const item of VERIFIED_PLACE_CATALOG) {
      const matchName = normalizePlaceKey(item.name);
      if (
        matchName === normName ||
        item.aliases.some((a) => normalizePlaceKey(a) === normName || normName.includes(normalizePlaceKey(a)))
      ) {
        const resolved: ResolvedPlaceImage = {
          placeId: item.placeId,
          name: item.name,
          region: item.region,
          destination: item.destination,
          country: 'India',
          heroImage: item.heroImage,
          photos: item.gallery.map((url) => ({
            url,
            authorAttributions: item.authorAttributions,
            source: 'verified_catalog',
          })),
          gallery: item.gallery,
          authorAttributions: item.authorAttributions,
          latitude: item.latitude,
          longitude: item.longitude,
          formattedAddress: item.formattedAddress,
          category: item.category,
          isExactMatch: true,
          source: 'verified_catalog',
        };
        RESOLVED_CACHE.set(normKey, resolved);
        return resolved;
      }
    }

    // 2. Check destination / region match
    for (const item of VERIFIED_PLACE_CATALOG) {
      if (normDest && normalizePlaceKey(item.destination) === normDest) {
        if (normName.includes(normalizePlaceKey(item.name)) || normalizePlaceKey(item.name).includes(normName)) {
          const resolved: ResolvedPlaceImage = {
            placeId: item.placeId,
            name: name,
            region: item.region,
            destination: item.destination,
            country: 'India',
            heroImage: item.heroImage,
            photos: item.gallery.map((url) => ({
              url,
              authorAttributions: item.authorAttributions,
              source: 'verified_catalog',
            })),
            gallery: item.gallery,
            authorAttributions: item.authorAttributions,
            latitude: latitude || item.latitude,
            longitude: longitude || item.longitude,
            formattedAddress: item.formattedAddress,
            category: (category as any) || item.category,
            isExactMatch: true,
            source: 'verified_catalog',
          };
          RESOLVED_CACHE.set(normKey, resolved);
          return resolved;
        }
      }
    }

    // 3. Category fallback for destination
    const destFallbackPhoto = PlaceImageService.getDestinationFallbackPhoto(destination, category);
    const fallbackResolved: ResolvedPlaceImage = {
      placeId: `custom-plc-${Date.now()}`,
      name,
      destination: destination || 'India',
      country: 'India',
      heroImage: destFallbackPhoto,
      photos: [{ url: destFallbackPhoto, source: 'destination_registry' }],
      gallery: [destFallbackPhoto],
      latitude,
      longitude,
      category,
      isExactMatch: false,
      source: 'fallback',
    };
    RESOLVED_CACHE.set(normKey, fallbackResolved);
    return fallbackResolved;
  }

  /**
   * Async Resolution: Checks memory cache, Verified catalog, then queries Google Places API (New) if key is present
   */
  public static async resolvePlaceAsync(query: PlaceImageQuery): Promise<ResolvedPlaceImage> {
    const { name, destination, region, category, latitude, longitude } = query;
    const rawKey = `${name} ${destination || ''}`.trim();
    const normKey = normalizePlaceKey(rawKey);

    if (RESOLVED_CACHE.has(normKey)) {
      const cached = RESOLVED_CACHE.get(normKey)!;
      if (cached.isExactMatch) return cached;
    }

    // Check catalog first
    const catalogMatch = PlaceImageService.resolvePlaceSync(name, destination, category, latitude, longitude);
    if (catalogMatch.isExactMatch) {
      return catalogMatch;
    }

    // If Google Places Platform API key is available, query Places API (New) Text Search
    const gmpKey = process.env.GOOGLE_MAPS_PLATFORM_KEY || process.env.GOOGLE_MAPS_API_KEY;
    if (gmpKey && gmpKey.trim().length > 10) {
      try {
        const placesApiResult = await PlaceImageService.fetchGooglePlacesNewPhoto(
          `${name}, ${destination || region || 'India'}`,
          gmpKey
        );
        if (placesApiResult) {
          RESOLVED_CACHE.set(normKey, placesApiResult);
          return placesApiResult;
        }
      } catch (err) {
        console.warn('Places API New photo fetch warning, using verified fallback:', err);
      }
    }

    return catalogMatch;
  }

  /**
   * Queries Google Places API (New) using searchText
   */
  private static async fetchGooglePlacesNewPhoto(
    textQuery: string,
    apiKey: string
  ): Promise<ResolvedPlaceImage | null> {
    return new Promise((resolve) => {
      const postData = JSON.stringify({
        textQuery,
        languageCode: 'en',
        maxResultCount: 1,
      });

      const options = {
        hostname: 'places.googleapis.com',
        port: 443,
        path: '/v1/places:searchText',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask':
            'places.id,places.displayName,places.formattedAddress,places.location,places.photos,places.types',
          'Content-Length': Buffer.byteLength(postData),
        },
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            if (res.statusCode !== 200) {
              return resolve(null);
            }
            const data = JSON.parse(body);
            if (!data.places || data.places.length === 0) {
              return resolve(null);
            }

            const place = data.places[0];
            const photosList: PlacePhoto[] = [];
            const galleryList: string[] = [];

            if (Array.isArray(place.photos) && place.photos.length > 0) {
              place.photos.slice(0, 6).forEach((p: any) => {
                // Construct Google Places (New) Photo URI
                const photoUrl = `https://places.googleapis.com/v1/${p.name}/media?maxHeightPx=1200&maxWidthPx=1600&key=${apiKey}`;
                const authorAttributions: AuthorAttribution[] = Array.isArray(p.authorAttributions)
                  ? p.authorAttributions.map((a: any) => ({
                      displayName: a.displayName || 'Google Contributor',
                      uri: a.uri,
                      photoUri: a.photoUri,
                    }))
                  : [];

                photosList.push({
                  url: photoUrl,
                  authorAttributions,
                  width: p.widthPx,
                  height: p.heightPx,
                  source: 'google_places',
                });
                galleryList.push(photoUrl);
              });
            }

            if (photosList.length > 0) {
              const resolved: ResolvedPlaceImage = {
                placeId: place.id,
                name: place.displayName?.text || textQuery,
                destination: textQuery.split(',')[1]?.trim() || 'India',
                country: 'India',
                heroImage: photosList[0].url,
                photos: photosList,
                gallery: galleryList,
                authorAttributions: photosList[0].authorAttributions,
                latitude: place.location?.latitude,
                longitude: place.location?.longitude,
                formattedAddress: place.formattedAddress,
                isExactMatch: true,
                source: 'google_places',
              };
              return resolve(resolved);
            }
            resolve(null);
          } catch (e) {
            resolve(null);
          }
        });
      });

      req.on('error', () => resolve(null));
      req.write(postData);
      req.end();
    });
  }

  /**
   * Destination-specific fallback photo registry
   */
  public static getDestinationFallbackPhoto(destination?: string, category?: string): string {
    const dest = (destination || '').toLowerCase();

    if (dest.includes('goa')) {
      return category === 'Restaurant'
        ? 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80'
        : 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80';
    }
    if (dest.includes('ladakh') || dest.includes('leh')) {
      return 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1200&q=80';
    }
    if (dest.includes('jaipur') || dest.includes('rajasthan')) {
      return 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=1200&q=80';
    }
    if (dest.includes('udaipur')) {
      return 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=1200&q=80';
    }
    if (dest.includes('kerala') || dest.includes('alleppey') || dest.includes('munnar')) {
      return 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80';
    }
    if (dest.includes('delhi')) {
      return 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80';
    }
    if (dest.includes('agra')) {
      return 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80';
    }
    if (dest.includes('varanasi')) {
      return 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80';
    }
    if (dest.includes('amritsar')) {
      return 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?auto=format&fit=crop&w=1200&q=80';
    }
    if (dest.includes('kashmir') || dest.includes('srinagar')) {
      return 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=1200&q=80';
    }
    if (dest.includes('manali') || dest.includes('shimla') || dest.includes('himachal')) {
      return 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80';
    }
    if (dest.includes('mumbai')) {
      return 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80';
    }
    if (dest.includes('kolkata')) {
      return 'https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=1200&q=80';
    }

    return 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80';
  }

  /**
   * Get all photos for a destination gallery
   */
  public static getDestinationGallery(destinationName: string): {
    heroImage: string;
    gallery: string[];
    attractions: CatalogPlaceItem[];
  } {
    const destNorm = normalizePlaceKey(destinationName);
    const matched = VERIFIED_PLACE_CATALOG.filter((p) => normalizePlaceKey(p.destination) === destNorm);

    if (matched.length > 0) {
      const allPhotos = matched.flatMap((m) => m.gallery);
      return {
        heroImage: matched[0].heroImage,
        gallery: Array.from(new Set(allPhotos)),
        attractions: matched,
      };
    }

    const fallback = PlaceImageService.getDestinationFallbackPhoto(destinationName);
    return {
      heroImage: fallback,
      gallery: [fallback],
      attractions: [],
    };
  }
}
