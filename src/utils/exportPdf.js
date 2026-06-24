import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { formatCurrency, formatPercent } from './calculations';

const BRAND_BLUE = [51, 153, 255];   // #3399ff
const BRAND_ORANGE = [255, 140, 0];  // #ff8c00
const DARK_BG = [28, 28, 48];        // card background
const LIGHT_TEXT = [232, 234, 246];  // --text-primary
const DIM_TEXT = [136, 136, 170];    // --text-secondary
const GREEN = [74, 222, 128];        // break-even green
const PAGE_W = 210; // A4 mm width
const MARGIN = 14;
const COL_W = PAGE_W - MARGIN * 2;

function hex(rgb) {
  return '#' + rgb.map(v => v.toString(16).padStart(2, '0')).join('');
}

function addHeader(doc, comparing) {
  // Dark background strip
  doc.setFillColor(...DARK_BG);
  doc.rect(0, 0, PAGE_W, 28, 'F');

  // EPAM label
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...BRAND_BLUE);
  doc.text('EPAM', MARGIN, 12);

  // Title
  doc.setFontSize(16);
  doc.setTextColor(...LIGHT_TEXT);
  doc.text('ROI Calculator Report', MARGIN + 14, 12);

  // Subtitle
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...DIM_TEXT);
  const subtitle = comparing ? 'Scenario Comparison' : 'Single Scenario';
  doc.text(subtitle, MARGIN + 14, 19);

  // Date (right-aligned)
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  doc.text(`Generated: ${date}`, PAGE_W - MARGIN, 19, { align: 'right' });

  return 34; // Y cursor after header
}

function addSectionTitle(doc, text, y, color = LIGHT_TEXT) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...DIM_TEXT);
  doc.text(text.toUpperCase(), MARGIN, y);
  doc.setDrawColor(...color);
  doc.setLineWidth(0.4);
  doc.line(MARGIN, y + 1.5, PAGE_W - MARGIN, y + 1.5);
  return y + 7;
}

function addInputParams(doc, values, y, label, color) {
  if (label) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...color);
    doc.text(label, MARGIN, y);
    y += 5;
  }

  const rows = [
    ['Initial Investment', formatCurrency(values.initialInvestment)],
    ['Monthly Revenue', formatCurrency(values.monthlyRevenue)],
    ['Monthly Costs', formatCurrency(values.monthlyCosts)],
    ['Calculation Period', `${values.period} months`],
  ];

  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [],
    body: rows,
    styles: { fontSize: 9, cellPadding: 3, textColor: LIGHT_TEXT, fillColor: DARK_BG },
    columnStyles: {
      0: { textColor: DIM_TEXT, cellWidth: 60 },
      1: { fontStyle: 'bold', halign: 'right' },
    },
    theme: 'plain',
    tableLineColor: [42, 42, 68],
    tableLineWidth: 0.2,
  });

  return doc.lastAutoTable.finalY + 6;
}

function addResults(doc, scenario, y, label, color) {
  if (label) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...color);
    doc.text(label, MARGIN, y);
    y += 5;
  }

  const payback = typeof scenario.payback === 'number'
    ? `${scenario.payback} months`
    : scenario.payback;

  const rows = [
    ['ROI', formatPercent(scenario.roi)],
    ['Payback Period', payback],
    ['Total Net Profit', formatCurrency(scenario.totalNetProfit)],
    ['Monthly Net Profit', formatCurrency(scenario.monthlyNetProfit)],
  ];

  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [],
    body: rows,
    styles: { fontSize: 9, cellPadding: 3, textColor: LIGHT_TEXT, fillColor: DARK_BG },
    columnStyles: {
      0: { textColor: DIM_TEXT, cellWidth: 60 },
      1: { fontStyle: 'bold', halign: 'right', textColor: color },
    },
    theme: 'plain',
    tableLineColor: [42, 42, 68],
    tableLineWidth: 0.2,
  });

  return doc.lastAutoTable.finalY + 6;
}

function addBreakdownTable(doc, scenarios, comparing, y) {
  const head = comparing
    ? [['Month',
        'Revenue (A)', 'Costs (A)', 'Net Profit (A)', 'Cash Flow (A)',
        'Revenue (B)', 'Costs (B)', 'Net Profit (B)', 'Cash Flow (B)']]
    : [['Month', 'Monthly Revenue', 'Monthly Costs', 'Net Profit', 'Cumulative Cash Flow']];

  const rowsA = scenarios[0].rows;
  const rowsB = comparing ? scenarios[1].rows : [];

  const body = rowsA.map((rowA, i) => {
    const rowB = comparing ? rowsB[i] : null;
    if (comparing) {
      return [
        rowA.month,
        formatCurrency(rowA.monthlyRevenue),
        formatCurrency(rowA.monthlyCosts),
        formatCurrency(rowA.monthlyNetProfit),
        formatCurrency(rowA.cumulative),
        formatCurrency(rowB.monthlyRevenue),
        formatCurrency(rowB.monthlyCosts),
        formatCurrency(rowB.monthlyNetProfit),
        formatCurrency(rowB.cumulative),
      ];
    }
    return [
      rowA.month,
      formatCurrency(rowA.monthlyRevenue),
      formatCurrency(rowA.monthlyCosts),
      formatCurrency(rowA.monthlyNetProfit),
      formatCurrency(rowA.cumulative),
    ];
  });

  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head,
    body,
    styles: { fontSize: 8, cellPadding: 2.5, textColor: LIGHT_TEXT, fillColor: DARK_BG },
    headStyles: {
      fillColor: [15, 15, 26],
      textColor: DIM_TEXT,
      fontStyle: 'bold',
      fontSize: 7.5,
    },
    alternateRowStyles: { fillColor: [22, 22, 38] },
    tableLineColor: [42, 42, 68],
    tableLineWidth: 0.2,
    theme: 'grid',
    didParseCell(data) {
      if (data.section !== 'body') return;
      const rowA = rowsA[data.row.index];
      const rowB = comparing ? rowsB[data.row.index] : null;
      const isBreakEven = rowA.isBreakEven || (rowB && rowB.isBreakEven);
      if (isBreakEven) {
        data.cell.styles.fillColor = [20, 60, 30];
        data.cell.styles.textColor = GREEN;
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });

  return doc.lastAutoTable.finalY + 6;
}

async function addChart(doc, chartElementId, y) {
  const el = document.getElementById(chartElementId);
  if (!el) return y;

  try {
    const canvas = await html2canvas(el, { backgroundColor: '#1c1c30', scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const imgW = COL_W;
    const imgH = (canvas.height / canvas.width) * imgW;

    // Add a new page if not enough space
    if (y + imgH > 280) {
      doc.addPage();
      y = 14;
    }

    doc.addImage(imgData, 'PNG', MARGIN, y, imgW, imgH);
    return y + imgH + 6;
  } catch {
    return y;
  }
}

export async function exportPdf({ valuesA, valuesB, scenarioA, scenarioB, comparing }) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  let y = addHeader(doc, comparing);

  // ── Input Parameters ──
  y = addSectionTitle(doc, 'Input Parameters', y);
  if (comparing) {
    y = addInputParams(doc, valuesA, y, 'Scenario A', BRAND_BLUE);
    y = addInputParams(doc, valuesB, y, 'Scenario B', BRAND_ORANGE);
  } else {
    y = addInputParams(doc, valuesA, y, null, BRAND_BLUE);
  }

  // ── Results Summary ──
  y = addSectionTitle(doc, 'Results Summary', y);
  if (comparing) {
    y = addResults(doc, scenarioA, y, 'Scenario A', BRAND_BLUE);
    y = addResults(doc, scenarioB, y, 'Scenario B', BRAND_ORANGE);
  } else {
    y = addResults(doc, scenarioA, y, null, BRAND_BLUE);
  }

  // ── Chart ──
  y = addSectionTitle(doc, 'Cumulative Cash Flow Chart', y);
  y = await addChart(doc, 'cashflow-chart', y);

  // ── Monthly Breakdown ──
  if (y > 240) {
    doc.addPage();
    y = 14;
  }
  y = addSectionTitle(doc, 'Monthly Breakdown', y);
  const scenarios = comparing
    ? [
        { rows: scenarioA.breakdown },
        { rows: scenarioB.breakdown.slice(0, scenarioA.breakdown.length) },
      ]
    : [{ rows: scenarioA.breakdown }];
  addBreakdownTable(doc, scenarios, comparing, y);

  doc.save('roi-report.pdf');
}
