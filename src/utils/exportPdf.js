import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { formatCurrency, formatPercent } from './calculations';

const BRAND_ORANGE = [255, 140, 0];  // #ff8c00 — scenario B, always fixed
const GREEN = [74, 222, 128];        // break-even green
const PAGE_W = 210;
const MARGIN = 14;
const COL_W = PAGE_W - MARGIN * 2;

// Read a CSS variable from the active theme and convert to [r,g,b]
function cssVar(name) {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  // Handle hex values like #1c1c30
  if (raw.startsWith('#')) {
    const hex = raw.slice(1);
    const full = hex.length === 3
      ? hex.split('').map(c => c + c).join('')
      : hex;
    return [
      parseInt(full.slice(0, 2), 16),
      parseInt(full.slice(2, 4), 16),
      parseInt(full.slice(4, 6), 16),
    ];
  }
  // Handle rgb(r, g, b) values
  const match = raw.match(/(\d+),\s*(\d+),\s*(\d+)/);
  if (match) return [Number(match[1]), Number(match[2]), Number(match[3])];
  return [100, 100, 100]; // fallback gray
}

// Resolve scenario A primary color from active theme
function getPrimaryColor() {
  // --primary-rgb is already "r, g, b"
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--primary-rgb').trim();
  const parts = raw.split(',').map(Number);
  if (parts.length === 3) return parts;
  return cssVar('--primary');
}

function hex(rgb) {
  return '#' + rgb.map(v => v.toString(16).padStart(2, '0')).join('');
}

function addHeader(doc, comparing) {
  const CARD_BG = cssVar('--card-bg');
  const PRIMARY = getPrimaryColor();
  const TEXT_PRIMARY = cssVar('--text-primary');
  const TEXT_SECONDARY = cssVar('--text-secondary');

  // Header background strip
  doc.setFillColor(...CARD_BG);
  doc.rect(0, 0, PAGE_W, 28, 'F');

  // EPAM label
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...PRIMARY);
  doc.text('EPAM', MARGIN, 12);

  // Title
  doc.setFontSize(16);
  doc.setTextColor(...TEXT_PRIMARY);
  doc.text('ROI Calculator Report', MARGIN + 14, 12);

  // Subtitle
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...TEXT_SECONDARY);
  const subtitle = comparing ? 'Scenario Comparison' : 'Single Scenario';
  doc.text(subtitle, MARGIN + 14, 19);

  // Date (right-aligned)
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  doc.text(`Generated: ${date}`, PAGE_W - MARGIN, 19, { align: 'right' });

  return 34;
}

function addSectionTitle(doc, text, y) {
  const PRIMARY = getPrimaryColor();
  const TEXT_SECONDARY = cssVar('--text-secondary');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...TEXT_SECONDARY);
  doc.text(text.toUpperCase(), MARGIN, y);
  doc.setDrawColor(...PRIMARY);
  doc.setLineWidth(0.4);
  doc.line(MARGIN, y + 1.5, PAGE_W - MARGIN, y + 1.5);
  return y + 7;
}

function addInputParams(doc, values, y, label, color) {
  const CARD_BG = cssVar('--card-bg');
  const TEXT_PRIMARY = cssVar('--text-primary');
  const TEXT_SECONDARY = cssVar('--text-secondary');
  const CARD_BORDER = cssVar('--card-border');

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
    styles: { fontSize: 9, cellPadding: 3, textColor: TEXT_PRIMARY, fillColor: CARD_BG },
    columnStyles: {
      0: { textColor: TEXT_SECONDARY, cellWidth: 60 },
      1: { fontStyle: 'bold', halign: 'right' },
    },
    theme: 'plain',
    tableLineColor: CARD_BORDER,
    tableLineWidth: 0.2,
  });

  return doc.lastAutoTable.finalY + 6;
}

function addResults(doc, scenario, y, label, color) {
  const CARD_BG = cssVar('--card-bg');
  const TEXT_PRIMARY = cssVar('--text-primary');
  const TEXT_SECONDARY = cssVar('--text-secondary');
  const CARD_BORDER = cssVar('--card-border');

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
    styles: { fontSize: 9, cellPadding: 3, textColor: TEXT_PRIMARY, fillColor: CARD_BG },
    columnStyles: {
      0: { textColor: TEXT_SECONDARY, cellWidth: 60 },
      1: { fontStyle: 'bold', halign: 'right', textColor: color },
    },
    theme: 'plain',
    tableLineColor: CARD_BORDER,
    tableLineWidth: 0.2,
  });

  return doc.lastAutoTable.finalY + 6;
}

function addBreakdownTable(doc, scenarios, comparing, y) {
  const CARD_BG = cssVar('--card-bg');
  const INPUT_BG = cssVar('--input-bg');
  const TEXT_PRIMARY = cssVar('--text-primary');
  const TEXT_SECONDARY = cssVar('--text-secondary');
  const CARD_BORDER = cssVar('--card-border');

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
    styles: { fontSize: 8, cellPadding: 2.5, textColor: TEXT_PRIMARY, fillColor: CARD_BG },
    headStyles: {
      fillColor: INPUT_BG,
      textColor: TEXT_SECONDARY,
      fontStyle: 'bold',
      fontSize: 7.5,
    },
    alternateRowStyles: { fillColor: INPUT_BG },
    tableLineColor: CARD_BORDER,
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

  const cardBgHex = hex(cssVar('--card-bg'));

  try {
    const canvas = await html2canvas(el, { backgroundColor: cardBgHex, scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const imgW = COL_W;
    const imgH = (canvas.height / canvas.width) * imgW;

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
  const PRIMARY = getPrimaryColor();

  // Set page background to match theme
  const CONTENT_BG = cssVar('--content-bg');
  doc.setFillColor(...CONTENT_BG);
  doc.rect(0, 0, PAGE_W, 297, 'F');

  let y = addHeader(doc, comparing);

  // ── Input Parameters ──
  y = addSectionTitle(doc, 'Input Parameters', y);
  if (comparing) {
    y = addInputParams(doc, valuesA, y, 'Scenario A', PRIMARY);
    y = addInputParams(doc, valuesB, y, 'Scenario B', BRAND_ORANGE);
  } else {
    y = addInputParams(doc, valuesA, y, null, PRIMARY);
  }

  // ── Results Summary ──
  y = addSectionTitle(doc, 'Results Summary', y);
  if (comparing) {
    y = addResults(doc, scenarioA, y, 'Scenario A', PRIMARY);
    y = addResults(doc, scenarioB, y, 'Scenario B', BRAND_ORANGE);
  } else {
    y = addResults(doc, scenarioA, y, null, PRIMARY);
  }

  // ── Chart ──
  y = addSectionTitle(doc, 'Cumulative Cash Flow Chart', y);
  y = await addChart(doc, 'cashflow-chart', y);

  // ── Monthly Breakdown ──
  if (y > 240) {
    doc.addPage();
    // Re-fill background on new page
    doc.setFillColor(...CONTENT_BG);
    doc.rect(0, 0, PAGE_W, 297, 'F');
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
