import { Livestock, Pen } from '../features/livestock/types';
import { Expense } from '../features/expenses/types';
import { Activity } from '../features/activity/types';
import { Task } from '../features/tasks/types';
import { AnimalType } from '../features/animalTypes/types';
import { Location } from '../features/locations/types';
import { Income } from '../features/income/types';
import { InventoryItem } from '../features/inventory/types';

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
    code: 'CAT-A0001',
    name: 'Betty',
    category: 'cattle',
    type: 'individual',
    quantity: 1,
    breed: 'Native',
    sex: 'female',
    startDate: isoDaysFromNow(-730),
    location: 'Cow Pasture',
    purpose: 'Dairy and breeding',
    status: 'active',
    healthNotes: [
      { id: 'hn-betty-1', date: isoDaysFromNow(-30), note: 'Dewormed, healthy appetite', type: 'treatment' },
    ],
    feedings: [
      {
        id: 'f-betty-1',
        date: isoDaysFromNow(-1),
        feedType: 'Cattle Pellets',
        amount: '2 kg',
        inventoryId: 'inv-cattle',
        quantity: 2,
        unit: 'kg',
        unitCost: 45,
        cost: 90,
      },
    ],
    expenseIds: [],
    notes: '',
  },
  {
    id: 'cow-ben',
    code: 'CAT-A0002',
    name: 'Ben',
    category: 'cattle',
    type: 'individual',
    quantity: 1,
    breed: 'Native',
    sex: 'male',
    startDate: isoDaysFromNow(-700),
    location: 'Cow Pasture',
    purpose: 'Breeding',
    status: 'active',
    healthNotes: [],
    feedings: [
      {
        id: 'f-ben-1',
        date: isoDaysFromNow(-1),
        feedType: 'Cattle Pellets',
        amount: '2 kg',
        inventoryId: 'inv-cattle',
        quantity: 2,
        unit: 'kg',
        unitCost: 45,
        cost: 90,
      },
    ],
    expenseIds: [],
    notes: '',
  },
  {
    id: 'goat-herd',
    code: 'GOT-B0001',
    name: 'Goat Herd',
    category: 'goat',
    type: 'group',
    quantity: 22,
    breed: 'Native',
    sex: 'mixed',
    startDate: isoDaysFromNow(-500),
    location: 'Goat Pen',
    purpose: 'Breeding and milk',
    status: 'active',
    healthNotes: [
      { id: 'hn-goat-1', date: isoDaysFromNow(-20), note: 'Hoof trimming done', type: 'treatment' },
    ],
    feedings: [
      {
        id: 'f-goat-1',
        date: isoDaysFromNow(-1),
        feedType: 'Goat Pellets',
        amount: '3 kg',
        inventoryId: 'inv-goat',
        quantity: 3,
        unit: 'kg',
        unitCost: 38,
        cost: 114,
      },
    ],
    expenseIds: [],
    notes: 'Main herd',
  },
  {
    id: 'chicken-native',
    code: 'CHK-B0001',
    name: 'Native Chickens',
    category: 'chicken',
    type: 'group',
    quantity: 24,
    breed: 'Darag',
    sex: 'mixed',
    startDate: isoDaysFromNow(-400),
    location: 'Native Chicken Run',
    purpose: 'Egg production',
    status: 'active',
    healthNotes: [],
    feedings: [
      {
        id: 'f-native-1',
        date: isoDaysFromNow(-1),
        feedType: 'Corn + Rice Bran Mix',
        amount: '2 kg',
        inventoryId: 'inv-native',
        quantity: 2,
        unit: 'kg',
        unitCost: 28,
        cost: 56,
      },
    ],
    expenseIds: [],
    notes: 'Steady egg supply, sold weekly',
  },
  {
    id: 'chicken-broiler',
    code: 'CHK-B0002',
    name: '30-Day Chickens',
    category: 'chicken',
    type: 'group',
    quantity: 30,
    breed: 'Broiler',
    sex: 'mixed',
    startDate: isoDaysFromNow(-18),
    location: 'Broiler House',
    purpose: 'Raising for sale',
    status: 'growing',
    healthNotes: [
      { id: 'hn-broiler-1', date: isoDaysFromNow(-6), note: 'Vitamins and vaccine given', type: 'vaccination' },
    ],
    feedings: [
      {
        id: 'f-broiler-1',
        date: isoDaysFromNow(-1),
        feedType: 'Broiler Finisher',
        amount: '4 kg',
        inventoryId: 'inv-broiler',
        quantity: 4,
        unit: 'kg',
        unitCost: 55,
        cost: 220,
      },
    ],
    expenseIds: [],
    notes: 'Batch of 30 birds, marketable at 30 days',
  },
  {
    id: 'pig-group',
    code: 'PIG-B0001',
    name: 'Pigs',
    category: 'pig',
    type: 'group',
    quantity: 2,
    breed: 'Native',
    sex: 'mixed',
    startDate: isoDaysFromNow(-90),
    location: 'Pig Pen',
    purpose: 'Raising',
    status: 'growing',
    healthNotes: [
      { id: 'hn-pig-1', date: isoDaysFromNow(-5), note: 'Vitamins given', type: 'treatment' },
    ],
    feedings: [
      {
        id: 'f-pig-1',
        date: isoDaysFromNow(-1),
        feedType: 'Hog Grower',
        amount: '1.5 kg',
        inventoryId: 'inv-pig',
        quantity: 1.5,
        unit: 'kg',
        unitCost: 62,
        cost: 93,
      },
    ],
    expenseIds: [],
    notes: '',
  },
];

export const mockExpenses: Expense[] = [
  {
    id: 'exp-labor-grass',
    date: isoDaysFromNow(-7),
    category: 'labor',
    description: 'Grass cutter wages',
    amount: 800,
    allocations: [
      { livestockId: 'cow-betty', amount: 400 },
      { livestockId: 'cow-ben', amount: 400 },
    ],
  },
  {
    id: 'exp-labor-care',
    date: isoDaysFromNow(-3),
    category: 'labor',
    description: 'Caretaker weekly wage',
    amount: 1200,
  },
  {
    id: 'exp-goat-pellets',
    date: isoDaysFromNow(-9),
    category: 'feed',
    description: 'Goat pellets, 1 sack',
    amount: 1900,
    livestockId: 'goat-herd',
  },
  {
    id: 'exp-fence',
    date: isoDaysFromNow(-12),
    category: 'maintenance',
    description: 'Goat pen fence reinforcement',
    amount: 1500,
    livestockId: 'goat-herd',
  },
  { id: 'exp-broiler-feed', date: isoDaysFromNow(-8), category: 'feed', description: 'Broiler finisher, 1 sack', amount: 2750, livestockId: 'chicken-broiler' },
  { id: 'exp-broiler-med', date: isoDaysFromNow(-6), category: 'medicine', description: 'Broiler vaccines and vitamins', amount: 650, livestockId: 'chicken-broiler' },
  { id: 'exp-native-feed', date: isoDaysFromNow(-6), category: 'feed', description: 'Corn and rice bran', amount: 700, livestockId: 'chicken-native' },
  { id: 'exp-pig-feed', date: isoDaysFromNow(-10), category: 'feed', description: 'Hog grower, 1 sack', amount: 1550, livestockId: 'pig-group' },
  { id: 'exp-pig-vitamins', date: isoDaysFromNow(-5), category: 'medicine', description: 'Pig vitamins', amount: 350, livestockId: 'pig-group' },
  { id: 'exp-pig-breeding', date: isoDaysFromNow(-20), category: 'other', description: 'Boar breeding service', amount: 800, livestockId: 'pig-group' },
  {
    id: 'exp-cattle-supply',
    date: isoDaysFromNow(-14),
    category: 'supplies',
    description: 'Mineral salt and rope',
    amount: 250,
    allocations: [
      { livestockId: 'cow-betty', amount: 125 },
      { livestockId: 'cow-ben', amount: 125 },
    ],
  },
];

export const mockIncome: Income[] = [
  { id: 'inc-eggs-1', date: isoDaysFromNow(-3), category: 'eggs', description: 'Eggs sold (weekly)', amount: 480, livestockId: 'chicken-native' },
  { id: 'inc-eggs-2', date: isoDaysFromNow(-10), category: 'eggs', description: 'Eggs sold (weekly)', amount: 520, livestockId: 'chicken-native' },
];

export const mockActivities: Activity[] = [
  { id: 'act-1', date: isoDaysFromNow(-3), type: 'income', description: 'Eggs sold (weekly) ₱480.00', livestockId: 'chicken-native' },
  { id: 'act-2', date: isoDaysFromNow(-3), type: 'expense_added', description: 'Caretaker weekly wage ₱1,200.00' },
  { id: 'act-3', date: isoDaysFromNow(-5), type: 'expense_added', description: 'Pig vitamins ₱350.00', livestockId: 'pig-group' },
  { id: 'act-4', date: isoDaysFromNow(-6), type: 'expense_added', description: 'Broiler vaccines and vitamins ₱650.00', livestockId: 'chicken-broiler' },
  { id: 'act-5', date: isoDaysFromNow(-7), type: 'expense_added', description: 'Grass cutter wages ₱800.00' },
  { id: 'act-6', date: isoDaysFromNow(-9), type: 'expense_added', description: 'Goat pellets, 1 sack ₱1,900.00', livestockId: 'goat-herd' },
  { id: 'act-7', date: isoDaysFromNow(-12), type: 'expense_added', description: 'Goat pen fence reinforcement ₱1,500.00', livestockId: 'goat-herd' },
  { id: 'act-8', date: isoDaysFromNow(-1), type: 'feeding', description: 'Morning feeding done', livestockId: 'goat-herd' },
];

export const mockTasks: Task[] = [
  {
    id: 'task-daily-feed',
    title: 'Feed all animals (morning)',
    dueDate: isoDaysFromNow(0),
    dueTime: '07:00',
    status: 'pending',
    recurrence: 'daily',
    seriesId: 'task-daily-feed',
    createdAt: isoDaysFromNow(-2),
  },
  {
    id: 'task-eggs',
    title: 'Collect eggs from native chickens',
    dueDate: isoDaysFromNow(0),
    status: 'pending',
    livestockId: 'chicken-native',
    recurrence: 'none',
    createdAt: isoDaysFromNow(-1),
  },
  {
    id: 'task-pig-water',
    title: 'Check pig water and feeder',
    dueDate: isoDaysFromNow(1),
    status: 'pending',
    livestockId: 'pig-group',
    recurrence: 'none',
    createdAt: isoDaysFromNow(-1),
  },
  {
    id: 'task-fence',
    title: 'Inspect goat fence line',
    dueDate: isoDaysFromNow(-1),
    status: 'done',
    livestockId: 'goat-herd',
    recurrence: 'none',
    createdAt: isoDaysFromNow(-2),
    completedAt: isoDaysFromNow(-1),
  },
];

export const mockInventory: InventoryItem[] = [
  { id: 'inv-cattle', name: 'Cattle Pellets', animalTypeIds: ['cattle'], unit: 'kg', quantity: 30, unitCost: 45, notes: 'Betty and Ben daily ration', createdAt: '2025-01-01' },
  { id: 'inv-goat', name: 'Goat Pellets', animalTypeIds: ['goat'], unit: 'kg', quantity: 25, unitCost: 38, notes: 'Main herd ration', createdAt: '2025-01-01' },
  { id: 'inv-native', name: 'Corn + Rice Bran Mix', animalTypeIds: ['chicken'], unit: 'kg', quantity: 20, unitCost: 28, notes: 'Native layers', createdAt: '2025-01-01' },
  { id: 'inv-broiler', name: 'Broiler Finisher', animalTypeIds: ['chicken'], unit: 'kg', quantity: 35, unitCost: 55, notes: '30-day batch', createdAt: '2025-01-01' },
  { id: 'inv-pig', name: 'Hog Grower', animalTypeIds: ['pig'], unit: 'kg', quantity: 15, unitCost: 62, notes: 'Pig ration plus vitamins', createdAt: '2025-01-01' },
];

export const mockPens: Pen[] = [
  { id: 'pen-1', name: 'Cow Pasture', location: 'North Field', capacity: 10, livestockIds: ['cow-betty', 'cow-ben'], notes: 'Open grazing with shade' },
  { id: 'pen-2', name: 'Broiler House', location: 'Behind the house', capacity: 40, livestockIds: ['chicken-broiler'], notes: '30-day meat birds' },
  { id: 'pen-3', name: 'Native Chicken Run', location: 'Backyard', capacity: 30, livestockIds: ['chicken-native'], notes: 'Egg layers' },
  { id: 'pen-4', name: 'Goat Pen', location: 'East Side', capacity: 25, livestockIds: ['goat-herd'], notes: 'Herd enclosure' },
  { id: 'pen-5', name: 'Pig Pen', location: 'Barn Area', capacity: 6, livestockIds: ['pig-group'], notes: 'Covered pen' },
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
