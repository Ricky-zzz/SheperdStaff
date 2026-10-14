import { Livestock, Pen } from '../features/livestock/types';
import { Expense } from '../features/expenses/types';
import { Activity } from '../features/activity/types';
import { Task } from '../features/tasks/types';
import { AnimalType } from '../features/animalTypes/types';
import { Location } from '../features/locations/types';
import { Income } from '../features/income/types';

function isoDaysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export const mockAnimalTypes: AnimalType[] = [
  { id: 'cattle', name: 'Cattle', color: '#8B5CF6', createdAt: '2025-01-01' },
  { id: 'pig', name: 'Pig', color: '#EC4899', createdAt: '2025-01-01' },
  { id: 'chicken', name: 'Chicken', color: '#F59E0B', createdAt: '2025-01-01' },
  { id: 'goat', name: 'Goat', color: '#10B981', createdAt: '2025-01-01' },
  { id: 'other', name: 'Other', color: '#78716C', createdAt: '2025-01-01' },
];

export const mockLocations: Location[] = [
  { id: 'loc-cows', name: 'Cow Pasture', notes: 'Open grazing with shade', createdAt: '2025-01-01' },
  { id: 'loc-broiler', name: 'Broiler House', notes: '30-day meat birds', createdAt: '2025-01-01' },
  { id: 'loc-native', name: 'Native Chicken Run', notes: 'Egg layers', createdAt: '2025-01-01' },
  { id: 'loc-goats', name: 'Goat Pen', notes: 'Herd enclosure', createdAt: '2025-01-01' },
  { id: 'loc-pigs', name: 'Pig Pen', notes: 'Covered pen', createdAt: '2025-01-01' },
];

export const mockLivestock: Livestock[] = [
  {
    id: 'cow-betty',
    name: 'Betty',
    category: 'cattle',
    type: 'individual',
    quantity: 1,
    breed: 'Batangas',
    sex: 'female',
    startDate: isoDaysFromNow(-730),
    location: 'Cow Pasture',
    purpose: 'Dairy/grazing',
    status: 'active',
    healthNotes: [
      { id: 'hn-betty-1', date: isoDaysFromNow(-40), note: 'Annual vaccination completed', type: 'vaccination' },
    ],
    feedings: [
      { id: 'f-betty-1', date: isoDaysFromNow(-1), feedType: 'Hay + grazing', amount: 'Free range' },
    ],
    expenseIds: [],
    notes: 'Gentle temperament',
  },
  {
    id: 'cow-barry',
    name: 'Barry',
    category: 'cattle',
    type: 'individual',
    quantity: 1,
    breed: 'Batangas',
    sex: 'male',
    startDate: isoDaysFromNow(-700),
    location: 'Cow Pasture',
    purpose: 'Breeding/working',
    status: 'active',
    healthNotes: [],
    feedings: [
      { id: 'f-barry-1', date: isoDaysFromNow(-1), feedType: 'Hay + grazing', amount: 'Free range' },
    ],
    expenseIds: [],
    notes: '',
  },
  {
    id: 'chicken-broiler',
    name: '30-Day Broilers',
    category: 'chicken',
    type: 'group',
    quantity: 50,
    breed: 'Pinoy',
    sex: 'mixed',
    startDate: isoDaysFromNow(-25),
    location: 'Broiler House',
    purpose: 'Slaughter & selling',
    status: 'growing',
    healthNotes: [
      { id: 'hn-broiler-1', date: isoDaysFromNow(-10), note: 'Vitamins + vaccine given', type: 'vaccination' },
    ],
    feedings: [
      { id: 'f-broiler-1', date: isoDaysFromNow(-1), feedType: 'Broiler finisher pellets', amount: '8 kg' },
    ],
    expenseIds: [],
    notes: 'Batch of 50 birds, marketable at 30 days',
  },
  {
    id: 'chicken-native',
    name: 'Native Layers',
    category: 'chicken',
    type: 'group',
    quantity: 30,
    breed: 'Darag',
    sex: 'female',
    startDate: isoDaysFromNow(-400),
    location: 'Native Chicken Run',
    purpose: 'Egg production',
    status: 'active',
    healthNotes: [],
    feedings: [
      { id: 'f-native-1', date: isoDaysFromNow(-1), feedType: 'Corn + rice bran', amount: '4 kg' },
    ],
    expenseIds: [],
    notes: 'Steady egg supply, sold weekly',
  },
  {
    id: 'goat-herd-1',
    name: 'Doe Herd',
    category: 'goat',
    type: 'group',
    quantity: 12,
    breed: 'Native',
    sex: 'female',
    startDate: isoDaysFromNow(-500),
    location: 'Goat Pen',
    purpose: 'Breeding/milk',
    status: 'active',
    healthNotes: [
      { id: 'hn-goat1-1', date: isoDaysFromNow(-20), note: 'Hoof trimming done', type: 'treatment' },
    ],
    feedings: [
      { id: 'f-goat1-1', date: isoDaysFromNow(-1), feedType: 'Goat pellets', amount: '3 kg' },
    ],
    expenseIds: [],
    notes: 'Main breeding herd',
  },
  {
    id: 'goat-herd-2',
    name: 'Kids & Bucks',
    category: 'goat',
    type: 'group',
    quantity: 8,
    breed: 'Native',
    sex: 'mixed',
    startDate: isoDaysFromNow(-120),
    location: 'Goat Pen',
    purpose: 'Raising',
    status: 'growing',
    healthNotes: [],
    feedings: [
      { id: 'f-goat2-1', date: isoDaysFromNow(-1), feedType: 'Goat pellets', amount: '2 kg' },
    ],
    expenseIds: [],
    notes: '',
  },
  {
    id: 'pig-piglets',
    name: 'Piglets',
    category: 'pig',
    type: 'group',
    quantity: 10,
    breed: 'Native',
    sex: 'mixed',
    startDate: isoDaysFromNow(-35),
    location: 'Pig Pen',
    purpose: 'Raising',
    status: 'growing',
    healthNotes: [],
    feedings: [
      { id: 'f-piglets-1', date: isoDaysFromNow(-1), feedType: 'Piglet starter feed', amount: '5 kg' },
    ],
    expenseIds: [],
    notes: 'All alive and healthy',
  },
  {
    id: 'pig-sold',
    name: 'Fatteners (Sold)',
    category: 'pig',
    type: 'group',
    quantity: 5,
    breed: 'Pinoy',
    sex: 'mixed',
    startDate: isoDaysFromNow(-165),
    location: 'Pig Pen',
    purpose: 'Sold',
    status: 'sold',
    healthNotes: [],
    feedings: [],
    expenseIds: [],
    notes: 'Sold at market',
  },
];

export const mockExpenses: Expense[] = [
  {
    id: 'exp-labor-grass',
    date: isoDaysFromNow(-7),
    category: 'labor',
    description: 'Grass-cutter wages',
    amount: 800,
    allocations: [
      { livestockId: 'cow-betty', amount: 400 },
      { livestockId: 'cow-barry', amount: 400 },
    ],
  },
  {
    id: 'exp-goat-pellets',
    date: isoDaysFromNow(-5),
    category: 'feed',
    description: 'Goat pellets 50kg',
    amount: 1200,
    allocations: [
      { livestockId: 'goat-herd-1', amount: 720 },
      { livestockId: 'goat-herd-2', amount: 480 },
    ],
  },
  { id: 'exp-broiler-feed', date: isoDaysFromNow(-9), category: 'feed', description: 'Broiler finisher feed 50kg', amount: 2500, livestockId: 'chicken-broiler' },
  { id: 'exp-broiler-med', date: isoDaysFromNow(-10), category: 'medicine', description: 'Broiler vitamins + vaccine', amount: 400, livestockId: 'chicken-broiler' },
  { id: 'exp-native-feed', date: isoDaysFromNow(-6), category: 'feed', description: 'Native chicken feed (corn/rice bran)', amount: 700, livestockId: 'chicken-native' },
  { id: 'exp-piglet-feed', date: isoDaysFromNow(-4), category: 'feed', description: 'Piglet starter feed', amount: 950, livestockId: 'pig-piglets' },
  { id: 'exp-fatteners-feed', date: isoDaysFromNow(-70), category: 'feed', description: 'Fatteners feed (past)', amount: 2200, livestockId: 'pig-sold' },
];

export const mockIncome: Income[] = [
  { id: 'inc-eggs-1', date: isoDaysFromNow(-3), category: 'eggs', description: 'Eggs sold (weekly)', amount: 480, livestockId: 'chicken-native' },
  { id: 'inc-eggs-2', date: isoDaysFromNow(-17), category: 'eggs', description: 'Eggs sold (weekly)', amount: 520, livestockId: 'chicken-native' },
  { id: 'inc-broiler-sale', date: isoDaysFromNow(-12), category: 'sale', description: 'Sold 45 broilers (30-day batch)', amount: 6750, livestockId: 'chicken-broiler', notes: 'about ₱150 each' },
  { id: 'inc-pig-sale', date: isoDaysFromNow(-45), category: 'sale', description: 'Sold 5 fatteners', amount: 14000, livestockId: 'pig-sold', notes: 'about ₱2,800 each' },
];

export const mockActivities: Activity[] = [
  { id: 'act-1', date: isoDaysFromNow(-3), type: 'income', description: 'Eggs sold (weekly) ₱480.00', livestockId: 'chicken-native' },
  { id: 'act-2', date: isoDaysFromNow(-5), type: 'expense_added', description: 'Goat pellets 50kg ₱1,200.00', livestockId: 'goat-herd-1' },
  { id: 'act-3', date: isoDaysFromNow(-7), type: 'expense_added', description: 'Grass-cutter wages ₱800.00' },
  { id: 'act-4', date: isoDaysFromNow(-12), type: 'sale', description: 'Sold 45 broilers for ₱6,750.00', livestockId: 'chicken-broiler' },
  { id: 'act-5', date: isoDaysFromNow(-10), type: 'health_note', description: 'Vitamins + vaccine for broilers', livestockId: 'chicken-broiler' },
  { id: 'act-6', date: isoDaysFromNow(-45), type: 'sale', description: 'Sold 5 fatteners for ₱14,000.00', livestockId: 'pig-sold' },
  { id: 'act-7', date: isoDaysFromNow(-1), type: 'feeding', description: 'Morning feeding done', livestockId: 'chicken-broiler' },
  { id: 'act-8', date: isoDaysFromNow(-25), type: 'livestock_added', description: '30-Day Broilers added (50 birds)', livestockId: 'chicken-broiler' },
];

export const mockTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Collect eggs from native layers',
    dueDate: isoDaysFromNow(0),
    status: 'pending',
    livestockId: 'chicken-native',
    createdAt: isoDaysFromNow(-1),
  },
  {
    id: 'task-2',
    title: 'Feed broilers morning & evening',
    dueDate: isoDaysFromNow(0),
    status: 'pending',
    livestockId: 'chicken-broiler',
    createdAt: isoDaysFromNow(-2),
  },
  {
    id: 'task-3',
    title: 'Check piglets water and feeder',
    dueDate: isoDaysFromNow(1),
    status: 'pending',
    livestockId: 'pig-piglets',
    createdAt: isoDaysFromNow(-1),
  },
  {
    id: 'task-4',
    title: 'Trim Barry\u2019s hooves',
    dueDate: isoDaysFromNow(-1),
    status: 'done',
    livestockId: 'cow-barry',
    createdAt: isoDaysFromNow(-2),
    completedAt: isoDaysFromNow(-1),
  },
];

export const mockPens: Pen[] = [
  { id: 'pen-1', name: 'Cow Pasture', location: 'North Field', capacity: 10, livestockIds: ['cow-betty', 'cow-barry'], notes: 'Open grazing with shade' },
  { id: 'pen-2', name: 'Broiler House', location: 'Behind the house', capacity: 60, livestockIds: ['chicken-broiler'], notes: '30-day meat birds' },
  { id: 'pen-3', name: 'Native Chicken Run', location: 'Backyard', capacity: 40, livestockIds: ['chicken-native'], notes: 'Egg layers' },
  { id: 'pen-4', name: 'Goat Pen', location: 'East Side', capacity: 25, livestockIds: ['goat-herd-1', 'goat-herd-2'], notes: 'Herd enclosure' },
  { id: 'pen-5', name: 'Pig Pen', location: 'Barn Area', capacity: 16, livestockIds: ['pig-piglets', 'pig-sold'], notes: 'Covered pen' },
];

export const getLivestockById = (id: string): Livestock | undefined =>
  mockLivestock.find(l => l.id === id);

export const getExpensesByLivestockId = (livestockId: string): Expense[] =>
  mockExpenses.filter(e => e.livestockId === livestockId);

export const getTotalExpenses = (): number =>
  mockExpenses.reduce((sum, e) => sum + e.amount, 0);

export const getLivestockCount = (): number =>
  mockLivestock.reduce((sum, l) => sum + l.quantity, 0);

export const getGroupCount = (): number =>
  mockLivestock.filter(l => l.type === 'group').length;

export const getExpensesByCategory = (): Record<string, number> =>
  mockExpenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);

export const getLivestockByCategory = (): Record<string, number> =>
  mockLivestock.reduce((acc, l) => {
    acc[l.category] = (acc[l.category] || 0) + l.quantity;
    return acc;
  }, {} as Record<string, number>);

export const getThisMonthExpenses = (): number => {
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  return mockExpenses
    .filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    })
    .reduce((sum, e) => sum + e.amount, 0);
};

export const getSoldLivestock = (): number =>
  mockLivestock.filter(l => l.status === 'sold').reduce((sum, l) => sum + l.quantity, 0);