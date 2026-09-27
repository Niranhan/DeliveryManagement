import type { Duty, Order, User } from '@/types';
import { marginOf } from '@/types';

interface ReportData {
  duty: Duty;
  orders: Order[];
  user: User | null;
}

export async function generateClosingReport({ duty, orders, user }: ReportData): Promise<void> {
  const { default: jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Daily Duty Closing Report', margin, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  const dateStr = new Date(duty.openedAt).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  doc.text(`Date: ${dateStr}`, margin, y);
  y += 5;
  if (user) {
    doc.text(`Delivery Person: ${user.name}`, margin, y);
    y += 5;
    doc.text(`Email: ${user.email}`, margin, y);
    y += 5;
  }
  doc.text(`Duty ID: ${duty.id}`, margin, y);
  y += 5;
  if (duty.closedAt) {
    doc.text(`Closed At: ${new Date(duty.closedAt).toLocaleString('en-US')}`, margin, y);
    y += 7;
  } else {
    y += 2;
  }

  doc.setDrawColor(220, 220, 220);
  doc.line(margin, y, pageWidth - margin, y);
  y += 7;

  const completed = orders.filter((o) => o.status === 'COMPLETED');
  let totalPaid = 0;
  let totalCollected = 0;
  let positiveCount = 0;
  let negativeCount = 0;
  for (const o of completed) {
    totalPaid += o.paidToRestaurant;
    totalCollected += o.collectedFromCustomer ?? 0;
    const m = marginOf(o);
    if (m >= 0) positiveCount++;
    else negativeCount++;
  }
  const totalMargin = totalCollected - totalPaid;

  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Summary', margin, y);
  y += 6;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const summaryLines: [string, string][] = [
    ['Total Orders', String(completed.length)],
    ['Total Paid to Restaurants', `Rs. ${totalPaid.toLocaleString('en-IN')}`],
    ['Total Collected from Customers', `Rs. ${totalCollected.toLocaleString('en-IN')}`],
    ['Total Margin', `Rs. ${totalMargin.toLocaleString('en-IN')}`],
    ['Positive-Margin Orders', String(positiveCount)],
    ['Negative-Margin Orders', String(negativeCount)],
  ];
  for (const [label, val] of summaryLines) {
    doc.text(label, margin, y);
    doc.text(val, pageWidth - margin, y, { align: 'right' });
    y += 5;
  }
  y += 4;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Order Details', margin, y);
  y += 6;

  const cols = ['Order', 'Restaurant', 'Paid', 'Collected', 'Margin'];
  const colWidths = [0.16, 0.34, 0.16, 0.18, 0.16].map((w) => w * contentWidth);
  const colX: number[] = [];
  let accX = margin;
  for (let i = 0; i < colWidths.length; i++) {
    colX.push(accX);
    accX += colWidths[i];
  }

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(245, 245, 245);
  doc.rect(margin, y - 4, contentWidth, 7, 'F');
  for (let i = 0; i < cols.length; i++) {
    doc.text(cols[i], colX[i] + 1.5, y, { align: i >= 2 ? 'right' : 'left' });
  }
  y += 7;

  doc.setFont('helvetica', 'normal');
  for (const o of completed) {
    if (y > doc.internal.pageSize.getHeight() - 15) {
      doc.addPage();
      y = 20;
    }
    const m = marginOf(o);
    const row = [
      o.orderNumber,
      o.restaurantName.length > 22 ? o.restaurantName.slice(0, 20) + '..' : o.restaurantName,
      `Rs. ${o.paidToRestaurant.toLocaleString('en-IN')}`,
      `Rs. ${(o.collectedFromCustomer ?? 0).toLocaleString('en-IN')}`,
      `${m >= 0 ? '+' : '-'}Rs. ${Math.abs(m).toLocaleString('en-IN')}`,
    ];
    doc.setTextColor(0, 0, 0);
    for (let i = 0; i < row.length; i++) {
      doc.text(row[i], colX[i] + 1.5, y, { align: i >= 2 ? 'right' : 'left' });
    }
    y += 5;
    doc.setDrawColor(240, 240, 240);
    doc.line(margin, y - 1, pageWidth - margin, y - 1);
  }

  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(`Generated on ${new Date().toLocaleString('en-US')}`, margin, pageHeight - 8);

  const filename = `duty-closing-report-${duty.date}.pdf`;
  doc.save(filename);
}
