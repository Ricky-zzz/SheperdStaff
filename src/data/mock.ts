import { Livestock, Pen } from '../features/livestock/types';
import { Expense } from '../features/expenses/types';
import { Activity } from '../features/activity/types';
import { Task } from '../features/tasks/types';

function isoDaysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export const mockPens: Pen[] = [
  {
    id: 'pen-1',
    name: 'Main Cattle Pasture',
    location: 'North Field',
    capacity: 10,
    livestockIds: ['cow-1'],
    notes: 'Large open grazing area with water trough',
  },
  {
    id: 'pen-2',
    name: 'Pig Pen A',
    location: 'Barn Area',
    capacity: 8,
    livestockIds: ['pig-group-1', 'pig-group-2'],
    notes: 'Covered shelter with feeding station',
  },
  {
    id: 'pen-3',
    name: 'Chicken Coop',
    location: 'Backyard',
    capacity: 50,
    livestockIds: ['chicken-group-1', 'chicken-group-2'],
    notes: 'Enclosed coop with nesting boxes',
  },
  {
    id: 'pen-4',
    name: 'Goat Enclosure',
    location: 'East Side',
    capacity: 12,
    livestockIds: ['goat-1', 'goat-group-1'],
    notes: 'Fenced area with climbing structures',
  },
  {
    id: 'pen-5',
    name: 'Sheep Paddock',
    location: 'West Hill',
    capacity: 15,
    livestockIds: ['sheep-group-1'],
    notes: 'Hillside grazing with shelter',
  },
  {
    id: 'pen-6',
    name: 'Duck Pond',
    location: 'Creek Side',
    capacity: 30,
    livestockIds: ['duck-group-1'],
    notes: 'Fenced pond area',
  },
];

export const mockLivestock: Livestock[] = [
  {
    id: 'cow-1',
    name: 'Bessie',
    category: 'cattle',
    type: 'individual',
    quantity: 1,
    breed: 'Holstein',
    sex: 'female',
    startDate: '2023-03-15',
    location: 'Main Cattle Pasture',
    purpose: 'Dairy production',
    status: 'active',
    healthNotes: [
      { id: 'hn-1', date: '2025-12-01', note: 'Annual vaccination completed', type: 'vaccination' },
      { id: 'hn-2', date: '2025-11-15', note: 'Slight limp on left hind leg, resolved after 3 days', type: 'observation' },
    ],
    feedings: [
      { id: 'f-1', date: '2026-01-10', feedType: 'Hay + Grain mix', amount: '15 kg', notes: 'Morning feed' },
      { id: 'f-2', date: '2026-01-10', feedType: 'Silage', amount: '10 kg', notes: 'Evening feed' },
    ],
    expenseIds: ['exp-1', 'exp-2'],
    notes: 'Good milk producer, gentle temperament',
  },
  {
    id: 'pig-group-1',
    name: 'Pig Batch 2025-A',
    category: 'pig',
    type: 'group',
    quantity: 6,
    breed: 'Large White',
    sex: 'mixed',
    startDate: '2025-06-01',
    location: 'Pig Pen A',
    purpose: 'Raising for market',
    status: 'growing',
    healthNotes: [
      { id: 'hn-3', date: '2025-11-01', note: 'All pigs dewormed', type: 'treatment' },
    ],
    feedings: [
      { id: 'f-3', date: '2026-01-10', feedType: 'Commercial pig feed', amount: '12 kg', notes: 'Twice daily' },
    ],
    expenseIds: ['exp-3', 'exp-4'],
    notes: 'Expected market weight by March 2026',
  },
  {
    id: 'chicken-group-1',
    name: 'Laying Hens',
    category: 'chicken',
    type: 'group',
    quantity: 25,
    breed: 'Rhode Island Red',
    sex: 'female',
    startDate: '2025-01-15',
    location: 'Chicken Coop',
    purpose: 'Egg production',
    status: 'active',
    healthNotes: [
      { id: 'hn-4', date: '2025-12-15', note: 'Newcastle disease vaccination booster', type: 'vaccination' },
    ],
    feedings: [
      { id: 'f-4', date: '2026-01-10', feedType: 'Layer pellets', amount: '3 kg', notes: 'Free choice + scratch grains' },
    ],
    expenseIds: ['exp-5'],
    notes: 'Averaging 20 eggs per day',
  },
  {
    id: 'chicken-group-2',
    name: 'Broiler Batch B',
    category: 'chicken',
    type: 'group',
    quantity: 30,
    breed: 'Cornish Cross',
    sex: 'mixed',
    startDate: '2025-10-01',
    location: 'Chicken Coop',
    purpose: 'Meat production',
    status: 'growing',
    healthNotes: [],
    feedings: [
      { id: 'f-5', date: '2026-01-10', feedType: 'Broiler starter/grower', amount: '5 kg', notes: 'Ad libitum' },
    ],
    expenseIds: ['exp-6'],
    notes: 'Processing expected February 2026',
  },
  {
    id: 'goat-1',
    name: 'Billy',
    category: 'goat',
    type: 'individual',
    quantity: 1,
    breed: 'Boer',
    sex: 'male',
    startDate: '2024-05-20',
    location: 'Goat Enclosure',
    purpose: 'Breeding',
    status: 'breeding',
    healthNotes: [
      { id: 'hn-5', date: '2025-12-20', note: 'Hoof trimming completed', type: 'treatment' },
    ],
    feedings: [
      { id: 'f-6', date: '2026-01-10', feedType: 'Goat pellets + hay', amount: '2 kg' },
    ],
    expenseIds: ['exp-7'],
    notes: 'Strong breeding buck, good genetics',
  },
  {
    id: 'goat-group-1',
    name: 'Doe Herd',
    category: 'goat',
    type: 'group',
    quantity: 5,
    breed: 'Boer',
    sex: 'female',
    startDate: '2024-03-10',
    location: 'Goat Enclosure',
    purpose: 'Breeding & milk',
    status: 'breeding',
    healthNotes: [
      { id: 'hn-6', date: '2025-11-10', note: '2 does confirmed pregnant, due Feb 2026', type: 'observation' },
    ],
    feedings: [
      { id: 'f-7', date: '2026-01-10', feedType: 'Goat pellets + alfalfa hay', amount: '5 kg' },
    ],
    expenseIds: ['exp-8'],
    notes: 'Healthy herd, good milk production',
  },
  {
    id: 'cow-2',
    name: 'Angus Bull',
    category: 'cattle',
    type: 'individual',
    quantity: 1,
    breed: 'Angus',
    sex: 'male',
    startDate: '2024-01-10',
    location: 'Main Cattle Pasture',
    purpose: 'Breeding',
    status: 'active',
    healthNotes: [],
    feedings: [
      { id: 'f-8', date: '2026-01-10', feedType: 'Hay + mineral supplement', amount: '18 kg' },
    ],
    expenseIds: ['exp-9'],
    notes: 'Gentle temperament, used for pasture breeding',
  },
  {
    id: 'sheep-group-1',
    name: 'Merino Flock',
    category: 'sheep',
    type: 'group',
    quantity: 8,
    breed: 'Merino',
    sex: 'mixed',
    startDate: '2025-02-10',
    location: 'Sheep Paddock',
    purpose: 'Wool & meat',
    status: 'for_sale',
    healthNotes: [
      { id: 'hn-7', date: '2025-12-10', note: 'Hooves trimmed, ready for sale', type: 'treatment' },
    ],
    feedings: [
      { id: 'f-9', date: '2026-01-10', feedType: 'Grazing + mineral block', amount: 'Free range' },
    ],
    expenseIds: ['exp-13'],
    notes: 'Marked for sale at the market',
  },
  {
    id: 'duck-group-1',
    name: 'Pekin Ducks',
    category: 'duck',
    type: 'group',
    quantity: 15,
    breed: 'Pekin',
    sex: 'mixed',
    startDate: '2025-09-01',
    location: 'Duck Pond',
    purpose: 'Eggs & meat',
    status: 'active',
    healthNotes: [],
    feedings: [
      { id: 'f-10', date: '2026-01-10', feedType: 'Duck pellets + greens', amount: '2 kg' },
    ],
    expenseIds: ['exp-14'],
    notes: 'Laying well, about 10 eggs/day',
  },
  {
    id: 'pig-group-2',
    name: 'Pig Batch 2024-B',
    category: 'pig',
    type: 'group',
    quantity: 4,
    breed: 'Landrace',
    sex: 'mixed',
    startDate: '2024-09-15',
    location: 'Pig Pen A',
    purpose: 'Sold at market',
    status: 'sold',
    healthNotes: [
      { id: 'hn-8', date: '2025-08-20', note: 'Final weigh-in before sale', type: 'observation' },
    ],
    feedings: [
      { id: 'f-11', date: '2025-09-01', feedType: 'Commercial pig feed', amount: '18 kg' },
    ],
    expenseIds: ['exp-15'],
    notes: 'Sold October 2025, average 95 kg',
  },
];

export const mockExpenses: Expense[] = [
  { id: 'exp-1', date: '2026-01-05', category: 'feed', description: 'Hay bales (20)', amount: 180.00, livestockId: 'cow-1', notes: 'Monthly hay supply' },
  { id: 'exp-2', date: '2026-01-03', category: 'medicine', description: 'Dewormer paste', amount: 25.50, livestockId: 'cow-1' },
  { id: 'exp-3', date: '2026-01-08', category: 'feed', description: 'Pig feed 50kg bag', amount: 45.00, livestockId: 'pig-group-1' },
  { id: 'exp-4', date: '2025-12-20', category: 'supplies', description: 'Pig pen bedding straw', amount: 30.00, livestockId: 'pig-group-1' },
  { id: 'exp-5', date: '2026-01-02', category: 'feed', description: 'Layer pellets 25kg', amount: 22.00, livestockId: 'chicken-group-1' },
  { id: 'exp-6', date: '2026-01-06', category: 'feed', description: 'Broiler starter feed 25kg', amount: 28.00, livestockId: 'chicken-group-2' },
  { id: 'exp-7', date: '2025-12-15', category: 'medicine', description: 'Goat dewormer + vitamins', amount: 35.00, livestockId: 'goat-1' },
  { id: 'exp-8', date: '2026-01-04', category: 'feed', description: 'Alfalfa hay bales (10)', amount: 120.00, livestockId: 'goat-group-1' },
  { id: 'exp-9', date: '2025-12-28', category: 'maintenance', description: 'Fence repair - east side', amount: 85.00, notes: 'Replaced 3 fence posts and wire' },
  { id: 'exp-10', date: '2026-01-10', category: 'supplies', description: 'Water trough cleaner', amount: 15.00 },
  { id: 'exp-11', date: '2025-11-20', category: 'labor', description: 'Part-time farm helper (weekend)', amount: 150.00, notes: 'Helped with hay storage' },
  { id: 'exp-12', date: '2025-10-05', category: 'maintenance', description: 'Chicken coop roof patch', amount: 65.00 },
  { id: 'exp-13', date: '2025-12-12', category: 'supplies', description: 'Sheep dip + shearing tools', amount: 40.00, livestockId: 'sheep-group-1' },
  { id: 'exp-14', date: '2026-01-09', category: 'feed', description: 'Duck pellets 20kg', amount: 18.00, livestockId: 'duck-group-1' },
  { id: 'exp-15', date: '2025-09-05', category: 'supplies', description: 'Pig transport to market', amount: 25.00, livestockId: 'pig-group-2' },
];

export const mockActivities: Activity[] = [
  { id: 'act-1', date: '2026-01-10', type: 'feeding', description: 'Morning feeding completed for all livestock', livestockId: 'cow-1' },
  { id: 'act-2', date: '2026-01-08', type: 'expense_added', description: 'Purchased pig feed 50kg bag - $45.00', expenseId: 'exp-3' },
  { id: 'act-3', date: '2026-01-06', type: 'expense_added', description: 'Purchased broiler starter feed - $28.00', expenseId: 'exp-6' },
  { id: 'act-4', date: '2026-01-05', type: 'expense_added', description: 'Purchased hay bales - $180.00', expenseId: 'exp-1' },
  { id: 'act-5', date: '2026-01-03', type: 'health_note', description: 'Deworming treatment given to Bessie', livestockId: 'cow-1' },
  { id: 'act-6', date: '2025-12-20', type: 'health_note', description: 'Hoof trimming completed for Billy', livestockId: 'goat-1' },
  { id: 'act-7', date: '2025-12-15', type: 'health_note', description: 'Newcastle vaccination booster for laying hens', livestockId: 'chicken-group-1' },
  { id: 'act-8', date: '2025-12-01', type: 'health_note', description: 'Annual vaccination for Bessie completed', livestockId: 'cow-1' },
  { id: 'act-9', date: '2025-11-20', type: 'livestock_added', description: 'Broiler Batch B added (30 birds)', livestockId: 'chicken-group-2' },
  { id: 'act-10', date: '2025-11-15', type: 'status_change', description: 'Bessie observed with slight limp - resolved', livestockId: 'cow-1' },
  { id: 'act-11', date: '2025-11-10', type: 'health_note', description: '2 does confirmed pregnant, expected Feb 2026', livestockId: 'goat-group-1' },
  { id: 'act-12', date: '2025-10-05', type: 'expense_added', description: 'Chicken coop roof patch - $65.00', expenseId: 'exp-12' },
  { id: 'act-13', date: '2025-12-12', type: 'health_note', description: 'Hooves trimmed for Merino flock, ready for sale', livestockId: 'sheep-group-1' },
  { id: 'act-14', date: '2026-01-09', type: 'expense_added', description: 'Purchased duck pellets - $18.00', expenseId: 'exp-14' },
  { id: 'act-15', date: '2025-10-02', type: 'sale', description: 'Pig Batch 2024-B sold at market (4 hogs)', livestockId: 'pig-group-2' },
];

export const mockTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Deworm the goat herd',
    dueDate: isoDaysFromNow(-2),
    notes: 'Use the broad-spectrum paste',
    status: 'pending',
    livestockId: 'goat-group-1',
    createdAt: isoDaysFromNow(-3),
  },
  {
    id: 'task-2',
    title: 'Collect eggs and clean the coop',
    dueDate: isoDaysFromNow(0),
    status: 'pending',
    livestockId: 'chicken-group-1',
    createdAt: isoDaysFromNow(-1),
  },
  {
    id: 'task-3',
    title: 'Buy 25kg broiler starter feed',
    dueDate: isoDaysFromNow(3),
    notes: 'Check price at the feed store first',
    status: 'pending',
    livestockId: 'chicken-group-2',
    createdAt: isoDaysFromNow(-2),
  },
  {
    id: 'task-4',
    title: 'Vaccinate pigs against swine fever',
    dueDate: isoDaysFromNow(7),
    status: 'pending',
    livestockId: 'pig-group-1',
    createdAt: isoDaysFromNow(-4),
  },
  {
    id: 'task-5',
    title: 'Trim Bessie\u2019s hooves',
    dueDate: isoDaysFromNow(-1),
    status: 'done',
    livestockId: 'cow-1',
    createdAt: isoDaysFromNow(-2),
    completedAt: isoDaysFromNow(-1),
  },
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
