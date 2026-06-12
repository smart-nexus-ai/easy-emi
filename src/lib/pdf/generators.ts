import { jsPDF } from 'jspdf';
import { ShopInfo, Provider, TermsSet, EMIRow } from '../types';
import { NotoSansBengaliBase64 } from './fonts/NotoSansBengali';

/**
 * Pre-processes Bengali Unicode strings for jsPDF rendering (reorders left-vowels and splits multi-part vowels).
 */
export function preprocessBengali(text: string): string {
  if (!text) return text;
  
  const isConsonant = (ch: string) => {
    const code = ch.charCodeAt(0);
    return (code >= 0x0995 && code <= 0x09B9) || 
           (code >= 0x09DC && code <= 0x09DF) || 
           code === 0x09F0 || code === 0x09F1 || 
           code === 0x09CE;
  };

  const chars = Array.from(text);
  const result: string[] = [];
  
  let i = 0;
  while (i < chars.length) {
    const ch = chars[i];
    
    // Check if it's one of the target vowels
    if (ch === '\u09bf' || ch === '\u09c7' || ch === '\u09c8' || ch === '\u09cb' || ch === '\u09cc') {
      // Find the start of the preceding consonant cluster in the result array we are building
      let j = result.length - 1;
      while (j >= 0) {
        if (isConsonant(result[j])) {
          if (j > 0 && result[j - 1] === '\u09cd') {
            j -= 2;
          } else {
            break;
          }
        } else {
          j++;
          break;
        }
      }
      if (j < 0) j = 0;
      
      // Now insert the vowel or parts of it
      if (ch === '\u09bf' || ch === '\u09c7' || ch === '\u09c8') {
        // Simple left vowel: insert at j
        result.splice(j, 0, ch);
      } else if (ch === '\u09cb') {
        // Split o-kar: insert e-kar at j, and a-kar at the current end
        result.splice(j, 0, '\u09c7');
        result.push('\u09be');
      } else if (ch === '\u09cc') {
        // Split au-kar: insert e-kar at j, and au-length-mark at the current end
        result.splice(j, 0, '\u09c7');
        result.push('\u09d7');
      }
      i++;
    } else {
      result.push(ch);
      i++;
    }
  }
  
  return result.join('');
}

interface PDFGenerationParams {
  shopInfo: ShopInfo | null;
  provider: Provider;
  termsSet: TermsSet | null;
  schedule: EMIRow[];
  addTotal: boolean;
  totalAmount: number;
}

/**
 * Centered, colorful shop header generator
 */
function drawShopHeader(doc: jsPDF, shopInfo: ShopInfo | null, titleY: number): number {
  const shopName = preprocessBengali(shopInfo?.name || 'My Electronics Store');
  const shopPhone = shopInfo?.phone ? preprocessBengali(`Phone: ${shopInfo.phone}`) : '';
  const shopAddress = shopInfo?.address || '';

  // 1. Centered Shop Title in Vibrant Blue using Bengali font
  doc.setTextColor(30, 136, 229);
  doc.setFont('NotoSansBengali', 'normal');
  doc.setFontSize(18);
  doc.text(shopName, 105, titleY, { align: 'center' });

  let y = titleY + 6.5;

  // 2. Centered Phone Number in Vibrant Blue using Bengali font
  if (shopPhone) {
    doc.setTextColor(30, 136, 229);
    doc.setFont('NotoSansBengali', 'normal');
    doc.setFontSize(10.5);
    doc.text(shopPhone, 105, y, { align: 'center' });
    y += 5.5;
  }

  // 3. Centered Address in Vibrant Blue using Bengali font
  if (shopAddress) {
    doc.setTextColor(30, 136, 229);
    doc.setFont('NotoSansBengali', 'normal');
    doc.setFontSize(10);
    const splitAddress = doc.splitTextToSize(preprocessBengali(shopAddress), 160);
    splitAddress.forEach((line: string) => {
      doc.text(line, 105, y, { align: 'center' });
      y += 5;
    });
  }

  // Restore text color and font to default dark slate and helvetica
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'normal');

  return y;
}

/**
 * Common table drawer helper to generate colorful table headers and grids
 */
function drawTable(
  doc: jsPDF,
  startY: number,
  schedule: EMIRow[],
  addTotal: boolean,
  totalAmount: number
): { endY: number } {
  let y = startY;

  // Table head background - Solid Blue matching screenshot
  doc.setFillColor(30, 136, 229);
  doc.setDrawColor(180, 180, 180);
  doc.rect(15, y, 180, 8, 'F');
  doc.rect(15, y, 180, 8, 'S');

  // White text for headers
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);

  // exact headers from screenshot: Advanced Date | Online Date | EMI | Remark
  doc.text('Advanced Date', 18, y + 5.5);
  doc.text('Online Date', 63, y + 5.5);
  doc.text('EMI', 108, y + 5.5);
  doc.text('Remark', 148, y + 5.5);

  y += 8;

  // Draw table row cells in neutral Slate text color
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  schedule.forEach((row) => {
    // Light border box for each cell
    doc.setDrawColor(180, 180, 180);
    doc.rect(15, y, 180, 7.5, 'S');

    // Values alignment
    doc.text(row.advanceDate, 18, y + 5);
    doc.text(row.emiDate, 63, y + 5);

    const amountFormatted = `Rs. ${row.amount.toFixed(2)}`;
    doc.text(amountFormatted, 108, y + 5);
    doc.text('', 148, y + 5); // Kept empty for pen notes

    // Vertical dividers precisely matching columns
    doc.line(60, y, 60, y + 7.5);
    doc.line(105, y, 105, y + 7.5);
    doc.line(145, y, 145, y + 7.5);

    y += 7.5;
  });

  // Optional Grant Total row
  if (addTotal) {
    doc.setFont('helvetica', 'bold');
    doc.setDrawColor(180, 180, 180);
    doc.rect(15, y, 180, 7.5, 'S');
    doc.text('Total Scheduled Amount', 18, y + 5);

    const totalFormatted = `Rs. ${totalAmount.toFixed(2)}`;
    doc.text(totalFormatted, 108, y + 5);

    // separator lines
    doc.line(60, y, 60, y + 7.5);
    doc.line(105, y, 105, y + 7.5);
    doc.line(145, y, 145, y + 7.5);

    y += 7.5;
  }

  return { endY: y };
}

/**
 * Layout helper to render terms set rules lists in PDF
 */
function drawTermsSection(
  doc: jsPDF,
  startY: number,
  termsSet: TermsSet | null,
  providerName: string
): { endY: number } {
  let y = startY;
  if (!termsSet) return { endY: y };

  const boxX = 15;
  const boxWidth = 180;

  // Measure dynamic height needed
  let heightNeeded = 14; 

  if (termsSet.description) {
    doc.setFont('NotoSansBengali', 'normal');
    const splitDesc = doc.splitTextToSize(preprocessBengali(termsSet.description), 170);
    heightNeeded += splitDesc.length * 4.5;
  }

  if (termsSet.rules && termsSet.rules.length > 0) {
    doc.setFont('NotoSansBengali', 'normal');
    termsSet.rules.forEach((rule) => {
      if (!rule.trim()) return;
      const splitRule = doc.splitTextToSize(preprocessBengali(rule.trim()), 160);
      heightNeeded += splitRule.length * 4.5 + 2;
    });
  }

  // Draw rounded terms container box
  doc.setDrawColor(180, 180, 180);
  doc.setFillColor(255, 255, 255);
  (doc as any).roundedRect(boxX, y, boxWidth, heightNeeded, 4, 4, 'S');

  let innerY = y + 5.5;

  // Terms Title centered, underlined blue using Bengali font (since providerName is user content)
  doc.setFont('NotoSansBengali', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(30, 136, 229);
  const termsTitle = preprocessBengali(`${providerName} (Terms & Conditions)`);
  doc.text(termsTitle, 105, innerY, { align: 'center' });

  // Draw underline for title
  const titleWidth = doc.getTextWidth(termsTitle);
  doc.line(105 - (titleWidth / 2), innerY + 0.8, 105 + (titleWidth / 2), innerY + 0.8);

  innerY += 6;

  // Description (user content -> Bengali font)
  if (termsSet.description) {
    doc.setFont('NotoSansBengali', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    const splitDesc = doc.splitTextToSize(preprocessBengali(termsSet.description), 170);
    splitDesc.forEach((line: string) => {
      doc.text(line, 105, innerY, { align: 'center' });
      innerY += 4.5;
    });
    innerY += 1.5;
  }

  // Rules (user content -> Bengali font)
  if (termsSet.rules && termsSet.rules.length > 0) {
    doc.setTextColor(30, 41, 59);

    termsSet.rules.forEach((rule, idx) => {
      if (!rule.trim()) return;

      // Keep index number as helvetica bold
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text(`${idx + 1}.`, 19, innerY);

      // Rule text as NotoSansBengali normal
      doc.setFont('NotoSansBengali', 'normal');
      doc.setFontSize(8.5);
      const ruleText = preprocessBengali(rule.trim());
      const splitRule = doc.splitTextToSize(ruleText, 164);

      splitRule.forEach((line: string) => {
        doc.text(line, 23, innerY);
        innerY += 4.5;
      });
      innerY += 1.5;
    });
  }

  // Revert back to helvetica normal
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);

  return { endY: y + heightNeeded };
}

/**
 * 1. CLASSIC TEMPLATE
 * Centered colored header theme, colorful table bands, beautiful clean look.
 */
export function generateClassicPDF(params: PDFGenerationParams): jsPDF {
  const doc = new jsPDF('p', 'mm', 'a4');
  doc.addFileToVFS('NotoSansBengali.ttf', NotoSansBengaliBase64);
  doc.addFont('NotoSansBengali.ttf', 'NotoSansBengali', 'normal');

  // Shop Header - gorgeous centered, blue styled
  const headerEndY = drawShopHeader(doc, params.shopInfo, 18);

  // Table
  const { endY: tableEndY } = drawTable(doc, headerEndY + 8, params.schedule, params.addTotal, params.totalAmount);

  // Terms Set
  const { endY: termsEndY } = drawTermsSection(doc, tableEndY + 8, params.termsSet, params.provider.name);

  // Signature Block - elegantly right-aligned exactly like screenshot
  const sigY = Math.max(termsEndY + 12, 260);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Customer Signature: _____________________', 195, sigY, { align: 'right' });

  return doc;
}

/**
 * 2. MODERN TEMPLATE
 * Colorful, stylish header structure, layout accents.
 */
export function generateModernPDF(params: PDFGenerationParams): jsPDF {
  const doc = new jsPDF('p', 'mm', 'a4');
  doc.addFileToVFS('NotoSansBengali.ttf', NotoSansBengaliBase64);
  doc.addFont('NotoSansBengali.ttf', 'NotoSansBengali', 'normal');

  // Sleek header top bar accent strip
  doc.setFillColor(30, 136, 229);
  doc.rect(15, 12, 180, 2, 'F');

  // Shop Header
  const headerEndY = drawShopHeader(doc, params.shopInfo, 20);

  // Divider
  doc.setDrawColor(220, 220, 220);
  doc.line(15, headerEndY + 3, 195, headerEndY + 3);

  // Table
  const { endY: tableEndY } = drawTable(doc, headerEndY + 9, params.schedule, params.addTotal, params.totalAmount);

  // Terms and conditions
  const { endY: termsEndY } = drawTermsSection(doc, tableEndY + 8, params.termsSet, params.provider.name);

  // Signature Block
  const sigY = Math.max(termsEndY + 12, 260);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Customer Signature: _____________________', 195, sigY, { align: 'right' });

  return doc;
}

/**
 * 3. COMPACT TEMPLATE
 * Designed to save vertical space.
 */
export function generateCompactPDF(params: PDFGenerationParams): jsPDF {
  const doc = new jsPDF('p', 'mm', 'a4');
  doc.addFileToVFS('NotoSansBengali.ttf', NotoSansBengaliBase64);
  doc.addFont('NotoSansBengali.ttf', 'NotoSansBengali', 'normal');

  // Shop Header
  const headerEndY = drawShopHeader(doc, params.shopInfo, 14);

  // Table
  const { endY: tableEndY } = drawTable(doc, headerEndY + 6, params.schedule, params.addTotal, params.totalAmount);

  // Terms Set
  const { endY: termsEndY } = drawTermsSection(doc, tableEndY + 6, params.termsSet, params.provider.name);

  // Signature
  const sigY = Math.max(termsEndY + 10, 262);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('Customer Signature: _____________________', 195, sigY, { align: 'right' });

  return doc;
}

/**
 * Custom table drawer for ELEGANT style with alternating row colors and deep indigo accents
 */
function drawElegantTable(
  doc: jsPDF,
  startY: number,
  schedule: EMIRow[],
  addTotal: boolean,
  totalAmount: number
): { endY: number } {
  let y = startY;

  // Header background - Premium Royal Indigo
  doc.setFillColor(39, 49, 137);
  doc.setDrawColor(180, 185, 210);
  doc.rect(15, y, 180, 8.5, 'F');
  doc.rect(15, y, 180, 8.5, 'S');

  // White helvetica text for headers
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);

  doc.text('Advanced Date', 18, y + 5.5);
  doc.text('Online Date', 63, y + 5.5);
  doc.text('EMI', 108, y + 5.5);
  doc.text('Remark/Status', 148, y + 5.5);

  y += 8.5;

  // Draw rows with alternating row colors
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  schedule.forEach((row, index) => {
    // Fill alternating soft blue/slate background on even indexes
    if (index % 2 === 0) {
      doc.setFillColor(243, 245, 253);
      doc.rect(15, y, 180, 7.5, 'F');
    }

    doc.setTextColor(15, 23, 42);
    doc.setDrawColor(200, 205, 225);
    doc.rect(15, y, 180, 7.5, 'S');

    // Values alignment
    doc.text(row.advanceDate, 18, y + 5);
    doc.text(row.emiDate, 63, y + 5);

    const amountFormatted = `Rs. ${row.amount.toFixed(2)}`;
    doc.text(amountFormatted, 108, y + 5);
    doc.text('', 148, y + 5); // Empty for pen notes

    // Vertical dividers in complementary soft tint
    doc.line(60, y, 60, y + 7.5);
    doc.line(105, y, 105, y + 7.5);
    doc.line(145, y, 145, y + 7.5);

    y += 7.5;
  });

  // Grant Total row
  if (addTotal) {
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(235, 238, 253);
    doc.rect(15, y, 180, 8, 'F');
    doc.rect(15, y, 180, 8, 'S');
    doc.setTextColor(39, 49, 137);
    doc.text('Total Scheduled Amount', 18, y + 5.5);

    const totalFormatted = `Rs. ${totalAmount.toFixed(2)}`;
    doc.text(totalFormatted, 108, y + 5.5);

    doc.line(60, y, 60, y + 8);
    doc.line(105, y, 105, y + 8);
    doc.line(145, y, 145, y + 8);

    y += 8;
  }

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'normal');
  return { endY: y };
}

/**
 * Left-bordered tinted sidebar style terms box for ELEGANT theme
 */
function drawElegantTermsSection(
  doc: jsPDF,
  startY: number,
  termsSet: TermsSet | null,
  providerName: string
): { endY: number } {
  let y = startY;
  if (!termsSet) return { endY: y };

  const boxX = 15;
  const boxWidth = 180;
  
  // Measure dynamic height needed
  let heightNeeded = 14; 

  if (termsSet.description) {
    doc.setFont('NotoSansBengali', 'normal');
    const splitDesc = doc.splitTextToSize(preprocessBengali(termsSet.description), 168);
    heightNeeded += splitDesc.length * 4.5;
  }

  if (termsSet.rules && termsSet.rules.length > 0) {
    doc.setFont('NotoSansBengali', 'normal');
    termsSet.rules.forEach((rule) => {
      if (!rule.trim()) return;
      const splitRule = doc.splitTextToSize(preprocessBengali(rule.trim()), 158);
      heightNeeded += splitRule.length * 4.5 + 2;
    });
  }

  // Draw background panel for Elegant Theme
  doc.setFillColor(248, 249, 254);
  doc.rect(boxX, y, boxWidth, heightNeeded, 'F');

  // Draw elegant left vertical accent bar (thick cobalt)
  doc.setFillColor(39, 49, 137);
  doc.rect(boxX, y, 1.5, heightNeeded, 'F');

  // Draw remaining borders very lightly
  doc.setDrawColor(210, 215, 230);
  doc.line(boxX + 1.5, y, boxX + boxWidth, y); // Top border
  doc.line(boxX + boxWidth, y, boxX + boxWidth, y + heightNeeded); // Right border
  doc.line(boxX + 1.5, y + heightNeeded, boxX + boxWidth, y + heightNeeded); // Bottom border

  let innerY = y + 5.5;

  // Title
  doc.setFont('NotoSansBengali', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(39, 49, 137);
  const termsTitle = preprocessBengali(`${providerName} - Terms & Conditions`);
  doc.text(termsTitle, boxX + 6, innerY);

  innerY += 6;

  // Description
  if (termsSet.description) {
    doc.setFont('NotoSansBengali', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    const splitDesc = doc.splitTextToSize(preprocessBengali(termsSet.description), 168);
    splitDesc.forEach((line: string) => {
      doc.text(line, boxX + 6, innerY);
      innerY += 4.5;
    });
    innerY += 1.5;
  }

  // Rules
  if (termsSet.rules && termsSet.rules.length > 0) {
    doc.setTextColor(30, 41, 59);

    termsSet.rules.forEach((rule, idx) => {
      if (!rule.trim()) return;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text(`${idx + 1}.`, boxX + 6, innerY);

      doc.setFont('NotoSansBengali', 'normal');
      doc.setFontSize(8.5);
      const ruleText = preprocessBengali(rule.trim());
      const splitRule = doc.splitTextToSize(ruleText, 160);

      splitRule.forEach((line: string) => {
        doc.text(line, boxX + 11, innerY);
        innerY += 4.5;
      });
      innerY += 1.5;
    });
  }

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);

  return { endY: y + heightNeeded };
}

/**
 * 4. ELEGANT TEMPLATE
 * Royal Indigo styling, alternating custom colored layout matrix, modern thick borders and side-accented guidelines.
 */
export function generateElegantPDF(params: PDFGenerationParams): jsPDF {
  const doc = new jsPDF('p', 'mm', 'a4');
  doc.addFileToVFS('NotoSansBengali.ttf', NotoSansBengaliBase64);
  doc.addFont('NotoSansBengali.ttf', 'NotoSansBengali', 'normal');

  // Rich header with complementary top ribbon strip
  doc.setFillColor(39, 49, 137);
  doc.rect(15, 10, 180, 2.5, 'F');

  // Shop Header - elegant layout
  const shopName = preprocessBengali(params.shopInfo?.name || 'My Electronics Store');
  const shopPhone = params.shopInfo?.phone ? preprocessBengali(`Phone: ${params.shopInfo.phone}`) : '';
  const shopAddress = params.shopInfo?.address || '';

  doc.setTextColor(39, 49, 137);
  doc.setFont('NotoSansBengali', 'normal');
  doc.setFontSize(19);
  doc.text(shopName, 105, 20, { align: 'center' });

  let y = 26.5;
  if (shopPhone) {
    doc.setTextColor(51, 65, 85);
    doc.setFont('NotoSansBengali', 'normal');
    doc.setFontSize(10.5);
    doc.text(shopPhone, 105, y, { align: 'center' });
    y += 5.5;
  }

  if (shopAddress) {
    doc.setTextColor(71, 85, 105);
    doc.setFont('NotoSansBengali', 'normal');
    doc.setFontSize(9.5);
    const splitAddress = doc.splitTextToSize(preprocessBengali(shopAddress), 160);
    splitAddress.forEach((line: string) => {
      doc.text(line, 105, y, { align: 'center' });
      y += 5;
    });
  }

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);

  // Decorative border lines separating header and table
  doc.setDrawColor(39, 49, 137);
  doc.setLineWidth(0.35);
  doc.line(15, y + 2, 195, y + 2);
  doc.line(15, y + 3, 195, y + 3);

  // Table
  const { endY: tableEndY } = drawElegantTable(doc, y + 8, params.schedule, params.addTotal, params.totalAmount);

  // Terms and conditions
  const { endY: termsEndY } = drawElegantTermsSection(doc, tableEndY + 9, params.termsSet, params.provider.name);

  // Signature Block
  const sigY = Math.max(termsEndY + 12, 260);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Customer Signature: _____________________', 195, sigY, { align: 'right' });

  return doc;
}

/**
 * Custom table drawer for MINIMALIST style with zero vertical lines & clean underline borders
 */
function drawMinimalistTable(
  doc: jsPDF,
  startY: number,
  schedule: EMIRow[],
  addTotal: boolean,
  totalAmount: number
): { endY: number } {
  let y = startY;

  // Primary thin horizontal line before header
  doc.setDrawColor(15, 15, 15);
  doc.setLineWidth(0.4);
  doc.line(15, y, 195, y);

  // Header texts
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);

  doc.text('ADVANCED DATE', 18, y + 5.5);
  doc.text('ONLINE DATE', 63, y + 5.5);
  doc.text('EMI', 108, y + 5.5);
  doc.text('REMARK/STATUS', 148, y + 5.5);

  y += 8.5;

  // Thin line closing the header row
  doc.line(15, y, 195, y);
  y += 2.5;

  // Row entries
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setLineWidth(0.15);
  doc.setDrawColor(220, 220, 220);

  schedule.forEach((row) => {
    doc.setTextColor(33, 41, 54);

    // Render values without any box grids
    doc.text(row.advanceDate, 18, y + 4.5);
    doc.text(row.emiDate, 63, y + 4.5);

    const amountFormatted = `Rs. ${row.amount.toFixed(2)}`;
    doc.text(amountFormatted, 108, y + 4.5);
    doc.text('', 148, y + 4.5);

    // Simple horizontal separator
    doc.line(15, y + 7, 195, y + 7);
    y += 9.5;
  });

  // Grand Total row
  if (addTotal) {
    y -= 1.5; // Backtrack slightly
    doc.setLineWidth(0.3);
    doc.setDrawColor(15, 15, 15);
    doc.line(15, y, 195, y); // Top line of totals

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('TOTAL SCHEDULED AMOUNT', 18, y + 5.5);

    const totalFormatted = `Rs. ${totalAmount.toFixed(2)}`;
    doc.text(totalFormatted, 108, y + 5.5);

    doc.line(15, y + 8.5, 195, y + 8.5); // Double line ledger bottom border
    doc.line(15, y + 9.2, 195, y + 9.2);

    y += 12;
  }

  doc.setFont('helvetica', 'normal');
  return { endY: y };
}

/**
 * Editorial-style minimalist terms container with zero box outlines
 */
function drawMinimalistTermsSection(
  doc: jsPDF,
  startY: number,
  termsSet: TermsSet | null,
  providerName: string
): { endY: number } {
  let y = startY;
  if (!termsSet) return { endY: y };

  const boxX = 15;
  
  // Premium divider accent line
  doc.setLineWidth(0.3);
  doc.setDrawColor(15, 15, 15);
  doc.line(boxX, y, 195, y);

  y += 6.5;

  // Title in clean Bengali font uppercase
  doc.setFont('NotoSansBengali', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  const termsTitle = preprocessBengali(`${providerName.toUpperCase()} TERMS AND CONDITIONS`);
  doc.text(termsTitle, boxX, y);

  y += 6;

  // Description
  if (termsSet.description) {
    doc.setFont('NotoSansBengali', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    const splitDesc = doc.splitTextToSize(preprocessBengali(termsSet.description), 175);
    splitDesc.forEach((line: string) => {
      doc.text(line, boxX, y);
      y += 4.5;
    });
    y += 2.5;
  }

  // Rules lists
  if (termsSet.rules && termsSet.rules.length > 0) {
    doc.setTextColor(51, 65, 85);

    termsSet.rules.forEach((rule) => {
      if (!rule.trim()) return;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text('*', boxX, y + 0.5); // Elegant bullet point list formatting

      doc.setFont('NotoSansBengali', 'normal');
      doc.setFontSize(8);
      const ruleText = preprocessBengali(rule.trim());
      const splitRule = doc.splitTextToSize(ruleText, 170);

      splitRule.forEach((line: string) => {
        doc.text(line, boxX + 4, y);
        y += 4.5;
      });
      y += 1.5;
    });
  }

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);

  return { endY: y };
}

/**
 * 5. MINIMALIST TEMPLATE
 * Ultra clean high-fashion visual style. Zero filled background cards or heavy boxes. Uses sophisticated lines, 
 * letter-spacing look, bullet list indicators, and abundant negative space.
 */
export function generateMinimalistPDF(params: PDFGenerationParams): jsPDF {
  const doc = new jsPDF('p', 'mm', 'a4');
  doc.addFileToVFS('NotoSansBengali.ttf', NotoSansBengaliBase64);
  doc.addFont('NotoSansBengali.ttf', 'NotoSansBengali', 'normal');

  // Shop Header - centered but styled minimally
  const shopName = preprocessBengali(params.shopInfo?.name?.toUpperCase() || 'MY ELECTRONICS STORE');
  const shopPhone = params.shopInfo?.phone ? preprocessBengali(`PHONE: ${params.shopInfo.phone}`) : '';
  const shopAddress = params.shopInfo?.address || '';

  doc.setTextColor(15, 23, 42);
  doc.setFont('NotoSansBengali', 'normal');
  doc.setFontSize(16);
  doc.text(shopName, 105, 22, { align: 'center' });

  let y = 28.5;
  if (shopPhone) {
    doc.setTextColor(71, 85, 105);
    doc.setFont('NotoSansBengali', 'normal');
    doc.setFontSize(9.5);
    doc.text(shopPhone, 105, y, { align: 'center' });
    y += 5.5;
  }

  if (shopAddress) {
    doc.setTextColor(100, 116, 139);
    doc.setFont('NotoSansBengali', 'normal');
    doc.setFontSize(9);
    const splitAddress = doc.splitTextToSize(preprocessBengali(shopAddress), 160);
    splitAddress.forEach((line: string) => {
      doc.text(line, 105, y, { align: 'center' });
      y += 5;
    });
  }

  // Table
  const { endY: tableEndY } = drawMinimalistTable(doc, y + 8, params.schedule, params.addTotal, params.totalAmount);

  // Terms Set
  const { endY: termsEndY } = drawMinimalistTermsSection(doc, tableEndY + 7, params.termsSet, params.provider.name);

  // Signature (minimalist and elegant single thin border)
  const sigY = Math.max(termsEndY + 14, 260);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Customer Signature: _______________________', 195, sigY, { align: 'right' });

  return doc;
}
