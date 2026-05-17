from __future__ import annotations

from datetime import datetime
from io import BytesIO


def _escape_pdf_text(value: str) -> str:
    return (
        value.replace("\\", "\\\\")
        .replace("(", "\\(")
        .replace(")", "\\)")
        .encode("ascii", "ignore")
        .decode("ascii")
    )


def build_simple_pdf(title: str, lines: list[str]) -> bytes:
    safe_lines = [title, *lines]
    text_commands = ["BT", "/F1 12 Tf", "50 760 Td", "16 TL"]
    first = True
    for line in safe_lines:
        escaped = _escape_pdf_text(line)
        if first:
            text_commands.append(f"({escaped}) Tj")
            first = False
        else:
            text_commands.append(f"T* ({escaped}) Tj")
    text_commands.append("ET")
    content = "\n".join(text_commands).encode("ascii", "ignore")

    objects = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
        b"<< /Length " + str(len(content)).encode("ascii") + b" >>\nstream\n" + content + b"\nendstream",
    ]

    buffer = BytesIO()
    buffer.write(b"%PDF-1.4\n")
    offsets = [0]
    for index, obj in enumerate(objects, start=1):
        offsets.append(buffer.tell())
        buffer.write(f"{index} 0 obj\n".encode("ascii"))
        buffer.write(obj)
        buffer.write(b"\nendobj\n")

    xref_start = buffer.tell()
    buffer.write(f"xref\n0 {len(objects) + 1}\n".encode("ascii"))
    buffer.write(b"0000000000 65535 f \n")
    for offset in offsets[1:]:
        buffer.write(f"{offset:010d} 00000 n \n".encode("ascii"))
    buffer.write(
        f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\nstartxref\n{xref_start}\n%%EOF".encode(
            "ascii"
        )
    )
    return buffer.getvalue()


def build_excel_xml(title: str, rows: list[list[str]]) -> bytes:
    header = [
        '<?xml version="1.0"?>',
        '<?mso-application progid="Excel.Sheet"?>',
        '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" '
        'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">',
        f'<Worksheet ss:Name="{title[:28] or "Report"}"><Table>',
    ]
    body = []
    for row in rows:
        cells = "".join(
            f'<Cell><Data ss:Type="String">{str(value)}</Data></Cell>' for value in row
        )
        body.append(f"<Row>{cells}</Row>")
    footer = ["</Table></Worksheet>", "</Workbook>"]
    xml = "\n".join(header + body + footer)
    return xml.encode("utf-8")


def report_lines_from_payload(payload: dict) -> list[str]:
    lines = [
        f"Generated: {datetime.utcnow().isoformat()}Z",
        f"Report type: {payload.get('report_type', 'General Risk Report')}",
        "",
        payload.get("executive_summary", "Executive summary is not available."),
        "",
        f"Total assets: {payload.get('summary', {}).get('total_assets', 0)}",
        f"Critical risks: {payload.get('summary', {}).get('critical_risks', 0)}",
        f"Expected loss: {payload.get('summary', {}).get('expected_loss', 0)}",
    ]
    for risk in payload.get("top_risks", [])[:5]:
        lines.append(
            f"Risk #{risk.get('id')} {risk.get('risk_level')} residual {risk.get('residual_risk')}"
        )
    return lines
