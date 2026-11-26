import { readFileSync } from 'fs';

// Sumber data menu & event. Snapshot ini dihasilkan dari
// "Dataset Himar Coffee.xlsx" lewat: npm run data:generate
const dataset = JSON.parse(
  readFileSync(new URL('./data/dataset.json', import.meta.url), 'utf8')
);

export const datasetMeta = dataset.meta;
export const realMenus = dataset.menus;
export const datasetEvents = dataset.events;
