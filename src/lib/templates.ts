// Word versions of the guide templates (content.ts → guides, blocks of type 'template'), so people can edit them.
// The text is the same as on the page: one paragraph per line, plus a footer line naming sponsuno.ch.
// GuidePage shows the file size next to the download link; scripts/prerender.mjs writes the files to dist/vorlagen/.
// No dependency: a .docx is a ZIP of a few XML files. Entries are stored uncompressed with a fixed date, so the
// same text always gives the same bytes (reproducible builds, stable size label). Runs at build time only (and in dev).

import { guidePage, guides, type GuideBlock, type GuideId } from '../content';

export type TemplateBlock = Extract<GuideBlock, { type: 'template' }>;

/** Folder of the Word files on the site and in dist/ */
export const TEMPLATE_DIR = 'vorlagen/';
export const DOCX_TYPE = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

/** Path (relative to the site root) and bytes of a template's Word file */
export function templateFile(id: GuideId, block: TemplateBlock): { path: string; bytes: Uint8Array } {
  return {
    path: `${TEMPLATE_DIR}${block.file}`,
    bytes: docx(block.label, block.text, guidePage.templateFooter(guides[id].title)),
  };
}

/** Every template of every guide as a Word file (scripts/prerender.mjs) */
export function templateFiles(): { path: string; bytes: Uint8Array }[] {
  return (Object.keys(guides) as GuideId[]).flatMap((id) =>
    guides[id].sections
      .flatMap((section) => section.blocks)
      .filter((block): block is TemplateBlock => block.type === 'template')
      .map((block) => templateFile(id, block)),
  );
}

const W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const R = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const PKG = 'http://schemas.openxmlformats.org/package/2006';
const XML = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';

const esc = (text: string): string => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const paragraph = (text: string, style?: string): string =>
  `<w:p>${style ? `<w:pPr><w:pStyle w:val="${style}"/></w:pPr>` : ''}${text ? `<w:r><w:t xml:space="preserve">${esc(text)}</w:t></w:r>` : ''}</w:p>`;

/** A4 Word document: Arial 11 pt, proofing language de-CH, one paragraph per line of `text`, `footer` in small grey */
function docx(title: string, text: string, footer: string): Uint8Array {
  const body = text.split('\n').map((line) => paragraph(line)).join('');
  return zip([
    ['[Content_Types].xml', `${XML}<Types xmlns="${PKG}/content-types">`
      + `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>`
      + `<Default Extension="xml" ContentType="application/xml"/>`
      + `<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>`
      + `<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>`
      + `<Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/>`
      + `<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>`
      + `</Types>`],
    ['_rels/.rels', `${XML}<Relationships xmlns="${PKG}/relationships">`
      + `<Relationship Id="rId1" Type="${R}/officeDocument" Target="word/document.xml"/>`
      + `<Relationship Id="rId2" Type="${PKG}/relationships/metadata/core-properties" Target="docProps/core.xml"/>`
      + `</Relationships>`],
    ['docProps/core.xml', `${XML}<cp:coreProperties xmlns:cp="${PKG}/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/">`
      + `<dc:title>${esc(title)}</dc:title><dc:language>de-CH</dc:language></cp:coreProperties>`],
    ['word/_rels/document.xml.rels', `${XML}<Relationships xmlns="${PKG}/relationships">`
      + `<Relationship Id="rId1" Type="${R}/styles" Target="styles.xml"/>`
      + `<Relationship Id="rId2" Type="${R}/footer" Target="footer1.xml"/>`
      + `</Relationships>`],
    ['word/document.xml', `${XML}<w:document xmlns:w="${W}" xmlns:r="${R}"><w:body>${body}`
      + `<w:sectPr><w:footerReference w:type="default" r:id="rId2"/><w:pgSz w:w="11906" w:h="16838"/>`
      + `<w:pgMar w:top="1417" w:right="1417" w:bottom="1134" w:left="1417" w:header="709" w:footer="567" w:gutter="0"/></w:sectPr>`
      + `</w:body></w:document>`],
    ['word/styles.xml', `${XML}<w:styles xmlns:w="${W}"><w:docDefaults>`
      + `<w:rPrDefault><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:eastAsia="Arial" w:cs="Arial"/><w:sz w:val="22"/><w:szCs w:val="22"/><w:lang w:val="de-CH"/></w:rPr></w:rPrDefault>`
      + `<w:pPrDefault><w:pPr><w:spacing w:after="0" w:line="276" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>`
      + `<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style>`
      + `<w:style w:type="paragraph" w:styleId="Footer"><w:name w:val="footer"/><w:basedOn w:val="Normal"/><w:rPr><w:color w:val="595959"/><w:sz w:val="16"/><w:szCs w:val="16"/></w:rPr></w:style>`
      + `</w:styles>`],
    ['word/footer1.xml', `${XML}<w:ftr xmlns:w="${W}">${paragraph(footer, 'Footer')}</w:ftr>`],
  ]);
}

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(data: Uint8Array): number {
  let c = 0xffffffff;
  for (const byte of data) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/** ZIP archive with stored (uncompressed) entries, all dated 2026-11-01 00:00 */
function zip(files: [name: string, content: string][]): Uint8Array {
  const DOS_DATE = ((2026 - 1980) << 9) | (11 << 5) | 1;
  const encoder = new TextEncoder();
  const local: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;

  for (const [name, content] of files) {
    const nameBytes = encoder.encode(name);
    const data = encoder.encode(content);
    const crc = crc32(data);

    const head = new DataView(new ArrayBuffer(30));
    head.setUint32(0, 0x04034b50, true); // local file header
    head.setUint16(4, 20, true); // version needed: 2.0
    head.setUint16(10, 0, true); // time 00:00
    head.setUint16(12, DOS_DATE, true);
    head.setUint32(14, crc, true);
    head.setUint32(18, data.length, true); // compressed size = size (stored)
    head.setUint32(22, data.length, true);
    head.setUint16(26, nameBytes.length, true);
    local.push(new Uint8Array(head.buffer), nameBytes, data);

    const entry = new DataView(new ArrayBuffer(46));
    entry.setUint32(0, 0x02014b50, true); // central directory header
    entry.setUint16(4, 20, true); // version made by
    entry.setUint16(6, 20, true); // version needed
    entry.setUint16(14, DOS_DATE, true);
    entry.setUint32(16, crc, true);
    entry.setUint32(20, data.length, true);
    entry.setUint32(24, data.length, true);
    entry.setUint16(28, nameBytes.length, true);
    entry.setUint32(42, offset, true); // offset of the local header
    central.push(new Uint8Array(entry.buffer), nameBytes);

    offset += 30 + nameBytes.length + data.length;
  }

  const centralSize = central.reduce((sum, part) => sum + part.length, 0);
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true); // end of central directory
  end.setUint16(8, files.length, true);
  end.setUint16(10, files.length, true);
  end.setUint32(12, centralSize, true);
  end.setUint32(16, offset, true);

  const parts = [...local, ...central, new Uint8Array(end.buffer)];
  const out = new Uint8Array(offset + centralSize + 22);
  let at = 0;
  for (const part of parts) {
    out.set(part, at);
    at += part.length;
  }
  return out;
}
