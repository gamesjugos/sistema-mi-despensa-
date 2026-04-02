const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/components/ReceiptModal.tsx');
let content = fs.readFileSync(file, 'utf8');

// Replace lines like:
// <td className="border-b border-black p-2 text-right">Bs. {numFormat(calc.sueldoReal)}</td>
// to
// <td className="border-b border-black p-2"><div className="flex justify-between"><span>Bs.</span><span>{numFormat(calc.sueldoReal)}</span></div></td>
//
// And also for <th>
// <th className="p-3 text-right bg-gray-100 text-lg">Bs. {numFormat(calc.cestaticket1)}</th>
content = content.replace(
    /className="([^"]*)text-right([^"]*)">\s*Bs\.\s*\{numFormat\(([^)]+)\)\}\s*<\/(td|th)>/g,
    (match, p1, p2, inner, tag) => {
        // Remove text-right from class
        let newClass = (p1 + p2).replace(/\s+/g, ' ').trim();
        return `className="${newClass}"><div className="flex justify-between"><span>Bs.</span><span>{numFormat(${inner})}</span></div></${tag}>`;
    }
);

// One more check for exact matching cases like:
// <th className="border-t border-black p-2 text-right bg-gray-100">Bs. {numFormat(calc.subtotalIngresos + record.subsidios)}</th>
content = content.replace(
    /className="([^"]*)text-right([^"]*)">\s*Bs\.\s*\{numFormat\(([^)]+\))\}\s*<\/(td|th)>/g,
    (match, p1, p2, inner, tag) => {
        let newClass = (p1 + p2).replace(/\s+/g, ' ').trim();
        return `className="${newClass}"><div className="flex justify-between"><span>Bs.</span><span>{numFormat(${inner}}</span></div></${tag}>`; // inner has ')' since the regex caught it, wait, regex was ([^)]+\)). Actually `)` might be unbalanced. Let's just use a more generic replace. 
    }
);

fs.writeFileSync(file, content, 'utf8');
console.log('Replaced cell alignments in ReceiptModal');
