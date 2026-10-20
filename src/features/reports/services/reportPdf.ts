import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export interface ReportTotals {
  animals: number;
  records: number;
  income: number;
  expenses: number;
  profit: number;
  transactions: number;
}

export interface ReportTypeRow {
  label: string;
  income: number;
  expenses: number;
  profit: number;
}

export interface ReportEntityRow {
  name: string;
  categoryLabel: string;
  income: number;
  expenses: number;
  profit: number;
}

export interface ReportPayload {
  farmName: string;
  rangeLabel: string;
  generatedAt: string;
  totals: ReportTotals;
  byType: ReportTypeRow[];
  byEntity: ReportEntityRow[];
  expensesByCategory: { label: string; amount: number }[];
}

function money(n: number): string {
  return `₱${n.toFixed(2)}`;
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildHtml(p: ReportPayload): string {
  const typeRows = p.byType
    .map(
      (r) =>
        `<tr><td>${esc(r.label)}</td><td class="num">${money(r.income)}</td><td class="num">${money(r.expenses)}</td><td class="num ${r.profit >= 0 ? 'pos' : 'neg'}">${money(r.profit)}</td></tr>`
    )
    .join('');

  const entityRows = p.byEntity
    .map(
      (r) =>
        `<tr><td>${esc(r.name)}</td><td>${esc(r.categoryLabel)}</td><td class="num">${money(r.income)}</td><td class="num">${money(r.expenses)}</td><td class="num ${r.profit >= 0 ? 'pos' : 'neg'}">${money(r.profit)}</td></tr>`
    )
    .join('');

  const expenseRows = p.expensesByCategory
    .map((r) => `<tr><td>${esc(r.label)}</td><td class="num">${money(r.amount)}</td></tr>`)
    .join('');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  * { font-family: Helvetica, Arial, sans-serif; box-sizing: border-box; }
  body { margin: 32px; color: #1C1917; }
  h1 { font-size: 22px; margin: 0 0 2px; }
  .sub { color: #78716C; font-size: 12px; margin-bottom: 20px; }
  .cards { display: flex; gap: 10px; margin-bottom: 22px; }
  .card { flex: 1; border: 1px solid #E7E5E4; border-radius: 8px; padding: 12px; }
  .card .label { font-size: 11px; color: #78716C; text-transform: uppercase; letter-spacing: .04em; }
  .card .value { font-size: 18px; font-weight: bold; margin-top: 4px; }
  .pos { color: #10B981; }
  .neg { color: #EF4444; }
  h2 { font-size: 14px; margin: 22px 0 8px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th { text-align: left; color: #78716C; font-size: 11px; text-transform: uppercase; border-bottom: 1px solid #E7E5E4; padding: 6px 4px; }
  td { padding: 6px 4px; border-bottom: 1px solid #F5F5F4; }
  .num { text-align: right; }
  footer { margin-top: 28px; color: #A8A29E; font-size: 10px; }
</style>
</head>
<body>
  <h1>${esc(p.farmName)} — Farm Report</h1>
  <div class="sub">${esc(p.rangeLabel)} · Generated ${esc(p.generatedAt)}</div>

  <div class="cards">
    <div class="card"><div class="label">Income</div><div class="value pos">${money(p.totals.income)}</div></div>
    <div class="card"><div class="label">Expenses</div><div class="value neg">${money(p.totals.expenses)}</div></div>
    <div class="card"><div class="label">Net Profit</div><div class="value ${p.totals.profit >= 0 ? 'pos' : 'neg'}">${money(p.totals.profit)}</div></div>
  </div>
  <div class="sub">Profit = Income − Expenses · ${p.totals.records} livestock records · ${p.totals.animals} heads · ${p.totals.transactions} transactions</div>

  <h2>Profit by Animal Type</h2>
  <table>
    <thead><tr><th>Type</th><th class="num">Income</th><th class="num">Expenses</th><th class="num">Profit</th></tr></thead>
    <tbody>${typeRows || '<tr><td colspan="4">No data</td></tr>'}</tbody>
  </table>

  <h2>Profit by Animal / Group</h2>
  <table>
    <thead><tr><th>Name</th><th>Type</th><th class="num">Income</th><th class="num">Expenses</th><th class="num">Profit</th></tr></thead>
    <tbody>${entityRows || '<tr><td colspan="5">No data</td></tr>'}</tbody>
  </table>

  <h2>Expenses by Category</h2>
  <table>
    <thead><tr><th>Category</th><th class="num">Amount</th></tr></thead>
    <tbody>${expenseRows || '<tr><td colspan="2">No expenses in this range</td></tr>'}</tbody>
  </table>

  <footer>Shepherd Staff · Offline livestock management</footer>
</body>
</html>`;
}

export async function shareReport(payload: ReportPayload): Promise<boolean> {
  const html = buildHtml(payload);
  const { uri } = await Print.printToFileAsync({ html });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Share farm report',
      UTI: 'com.adobe.pdf',
    });
    return true;
  }
  return false;
}