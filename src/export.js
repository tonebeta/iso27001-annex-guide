import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, WidthType, AlignmentType, BorderStyle, HeadingLevel } from "docx";
import ExcelJS from "exceljs";

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function computeStats(grouped, checkedItems) {
  let total = 0, checked = 0;
  grouped.forEach(g => g.items.forEach(i => { total++; if (checkedItems[i.id]) checked++; }));
  return { total, checked };
}

const fallback = { label: "?" };

// ── Markdown ──

export function exportMarkdown(grouped, checkedItems, roleMap, freqMap) {
  const date = today();
  const lines = [`# ISO 27001:2022 Annex A 檢核表`, ``, `匯出日期：${date}`, ``];

  const { total, checked } = computeStats(grouped, checkedItems);
  lines.push(`> 共 ${total} 項，已完成 ${checked} 項 (${total ? Math.round(checked / total * 100) : 0}%)`, ``);

  grouped.forEach(group => {
    lines.push(`## ${group.control} ${group.controlName}`, ``);
    lines.push(`| 狀態 | 頻率 | 角色 | 任務 | 完成時間 |`);
    lines.push(`|------|------|------|------|----------|`);
    group.items.forEach(item => {
      const status = checkedItems[item.id] ? "✅" : "⬜";
      const freq = freqMap[item.freq] || fallback;
      const role = roleMap[item.role] || fallback;
      const done = formatDate(checkedItems[item.id]);
      lines.push(`| ${status} | ${freq.label} | ${role.label} | ${item.task} | ${done} |`);
    });
    lines.push(``);
  });

  const blob = new Blob([lines.join("\n")], { type: "text/markdown;charset=utf-8" });
  download(blob, `iso27001-checklist-${date}.md`);
}

// ── DOCX ──

export async function exportDocx(grouped, checkedItems, roleMap, freqMap) {
  const date = today();
  const sections = [];

  const { total, checked } = computeStats(grouped, checkedItems);

  sections.push(
    new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "ISO 27001:2022 Annex A 檢核表", bold: true, font: "Noto Sans TC" })] }),
    new Paragraph({ children: [new TextRun({ text: `匯出日期：${date}`, font: "Noto Sans TC" })] }),
    new Paragraph({ children: [new TextRun({ text: `共 ${total} 項，已完成 ${checked} 項 (${total ? Math.round(checked / total * 100) : 0}%)`, font: "Noto Sans TC" })] }),
    new Paragraph({ text: "" }),
  );

  const borderStyle = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
  const cellBorders = { top: borderStyle, bottom: borderStyle, left: borderStyle, right: borderStyle };

  grouped.forEach(group => {
    sections.push(
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: `${group.control} ${group.controlName}`, bold: true, font: "Noto Sans TC" })] }),
    );

    const headerRow = new TableRow({
      tableHeader: true,
      children: ["狀態", "頻率", "角色", "任務", "完成時間"].map(h =>
        new TableCell({
          borders: cellBorders,
          shading: { fill: "F0F0F0" },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: h, bold: true, font: "Noto Sans TC", size: 20 })] })],
        })
      ),
    });

    const dataRows = group.items.map(item => {
      const freq = freqMap[item.freq] || fallback;
      const role = roleMap[item.role] || fallback;
      const isChecked = !!checkedItems[item.id];
      const cells = [
        isChecked ? "✓" : "—",
        freq.label,
        role.label,
        item.task,
        formatDate(checkedItems[item.id]),
      ];
      return new TableRow({
        children: cells.map((text, idx) =>
          new TableCell({
            borders: cellBorders,
            width: idx === 3 ? { size: 50, type: WidthType.PERCENTAGE } : undefined,
            children: [new Paragraph({ children: [new TextRun({ text, font: "Noto Sans TC", size: 20 })] })],
          })
        ),
      });
    });

    sections.push(
      new Table({ rows: [headerRow, ...dataRows], width: { size: 100, type: WidthType.PERCENTAGE } }),
      new Paragraph({ text: "" }),
    );
  });

  const doc = new Document({
    sections: [{ children: sections }],
  });
  const blob = await Packer.toBlob(doc);
  download(blob, `iso27001-checklist-${date}.docx`);
}

// ── Excel ──

export async function exportExcel(grouped, checkedItems, roleMap, freqMap) {
  const date = today();
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Annex A Checklist");

  const headers = ["控制項", "控制名稱", "ID", "頻率", "角色", "任務", "狀態", "完成時間"];
  const headerRow = ws.addRow(headers);
  headerRow.font = { bold: true };
  headerRow.eachCell(cell => { cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF0F0F0" } }; });

  ws.columns = [
    { width: 10 },  // 控制項
    { width: 22 },  // 控制名稱
    { width: 10 },  // ID
    { width: 10 },  // 頻率
    { width: 8 },   // 角色
    { width: 65 },  // 任務
    { width: 10 },  // 狀態
    { width: 20 },  // 完成時間
  ];

  grouped.forEach(group => {
    group.items.forEach(item => {
      const freq = freqMap[item.freq] || fallback;
      const role = roleMap[item.role] || fallback;
      ws.addRow([
        group.control,
        group.controlName,
        item.id,
        freq.label,
        role.label,
        item.task,
        checkedItems[item.id] ? "已完成" : "未完成",
        formatDate(checkedItems[item.id]),
      ]);
    });
  });

  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  download(blob, `iso27001-checklist-${date}.xlsx`);
}

// ── Download helper ──

function download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
