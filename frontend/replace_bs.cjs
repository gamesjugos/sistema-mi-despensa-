const fs = require('fs');
const path = require('path');

const filesToUpdate = [
    'src/pages/Nomina.tsx',
    'src/pages/Cestatickets.tsx',
    'src/pages/Employees.tsx',
    'src/pages/Dashboard.tsx',
    'src/components/ReceiptModal.tsx'
];

filesToUpdate.forEach(file => {
    let content = fs.readFileSync(path.join(__dirname, file), 'utf8');
    
    // Replace ${numFormat with Bs. {numFormat
    content = content.replace(/\$\{numFormat/g, 'Bs. {numFormat');

    // Replace headers and labels containing ($)
    content = content.replace(/\(\$\)/g, '(Bs.)');
    content = content.replace(/Bono \$/g, 'Bono Bs.');

    // Specific Excel format replacements
    content = content.replace(/'"\$"\#,##0\.00'/g, `'"Bs." #,##0.00'`);
    
    // In Dashboard.tsx there is `${emp.empresa === 'MI_DESPENSA...` which is inside a backtick, DO NOT REPLACE backtick templates inside JS.
    // The replace(/\$\{numFormat/g) only catches literal $ before {numFormat, usually in JSX or if it was inside a template literal it would break the template literal.
    // Wait, in JS `${numFormat(...)` inside backticks evaluates the variable. If we replace it with `Bs. {numFormat(...)`, it would break backticks.
    // Let's check if there are backticks with ${numFormat}. The only backticks are for classNames or URLs, numFormat is usually used in JSX text directly.

    // Let's be safer and replace literal >$ with >Bs. 
    content = content.replace(/>\$/g, '>Bs. ');
    content = content.replace(/:\s*<\/span>\s*<span[^>]*>\$/g, (match) => match.replace('$', 'Bs. '));
    // Replace text in spans safely
    content = content.replace(/<span>\$/g, '<span>Bs. ');

    fs.writeFileSync(path.join(__dirname, file), content, 'utf8');
});
console.log('Replaced symbols');
