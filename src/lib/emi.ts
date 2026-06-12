import { EMIFormState, EMIRow, Provider } from './types';

/**
 * Format Date object to DD/MM/Y YYYY string format
 */
export function formatDate(date: Date): string {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

/**
 * Parses YYYY-MM-DD input date string to a local Date object securely
 */
export function parseInputDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Moves date forward by a specic number of months, protecting against date-overflow offset errors
 */
export function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  const originalDay = d.getDate();
  
  // Set to first of month temporarily to avoid premature overflow jump
  d.setDate(1);
  d.setMonth(d.getMonth() + months);
  
  // Find maximum possible days in target month
  const maxDays = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(originalDay, maxDays));
  return d;
}

/**
 * Calculate advance date using: emiDate - advanceDays
 */
export function calculateAdvanceDate(emiDate: Date, advanceDays: number): Date {
  const adv = new Date(emiDate);
  adv.setDate(adv.getDate() - advanceDays);
  return adv;
}

/**
 * Calculate total payable amount: firstEmi + (regularEmi * (count - 1))
 */
export function calculateTotal(firstEmi: number, emiIncrement: number, count: number): number {
  if (count <= 0) return 0;
  const regularEmi = firstEmi + emiIncrement;
  return firstEmi + (regularEmi * (count - 1));
}

/**
 * Generates the sequential EMI row details based on UI configuration state
 */
export function generateSchedule(params: EMIFormState, provider: Provider): EMIRow[] {
  const schedule: EMIRow[] = [];
  const baseDate = parseInputDate(params.firstEmiDate);

  for (let i = 0; i < params.emiCount; i++) {
    const emiDate = addMonths(baseDate, i);
    const advanceDate = calculateAdvanceDate(emiDate, provider.advanceDays);
    
    schedule.push({
      index: i + 1,
      advanceDate: formatDate(advanceDate),
      emiDate: formatDate(emiDate),
      amount: i === 0 ? params.firstEmiAmount : params.firstEmiAmount + params.emiIncrement,
      remark: '', // Remark column cells are blank ready for handwritten notes
    });
  }
  
  return schedule;
}
