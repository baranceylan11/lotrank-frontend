export type Vehicle = {
  id: string;
  brand: string;
  model: string;
  year: number;
  km: string;
  place: string;
  price: string;
  start: string;
  score: number;
  gain: number;
  time: string;
  image: string;
  sourceUrl?: string;
};

export const vehicles: Vehicle[] = [
  { id:"bmw-320d", brand:"BMW", model:"320d", year:2019, km:"145.000 km", place:"Lyon", price:"€18.750", start:"€12.000", score:93, gain:56, time:"01:24:18", image:"https://images.unsplash.com/photo-1734940521859-785d926b3e70?auto=format&fit=crop&w=1000&q=82" },
  { id:"mercedes-c220d", brand:"Mercedes", model:"C 220d", year:2018, km:"112.000 km", place:"Paris", price:"€16.300", start:"€10.500", score:87, gain:38, time:"02:15:42", image:"https://images.unsplash.com/photo-1636378182990-3bc1fd5c8307?auto=format&fit=crop&w=1000&q=82" },
  { id:"audi-a4", brand:"Audi", model:"A4 2.0 TDI", year:2020, km:"98.000 km", place:"Lille", price:"€17.900", start:"€12.200", score:81, gain:28, time:"00:45:30", image:"https://images.unsplash.com/photo-1612373091548-26d9ce084461?auto=format&fit=crop&w=1000&q=82" },
  { id:"peugeot-308", brand:"Peugeot", model:"308 BlueHDi", year:2021, km:"75.000 km", place:"Bordeaux", price:"€6.250", start:"€4.200", score:78, gain:22, time:"01:05:31", image:"https://images.unsplash.com/photo-1722088354375-3c64b4d994b6?auto=format&fit=crop&w=1000&q=82" },
  { id:"renault-clio", brand:"Renault", model:"Clio", year:2020, km:"62.000 km", place:"Marseille", price:"€3.450", start:"€2.350", score:76, gain:15, time:"00:30:05", image:"https://images.unsplash.com/photo-1612373091548-26d9ce084461?auto=format&fit=crop&w=1000&q=82" },
];
