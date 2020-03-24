const fs = require('fs');
const yaml = require('js-yaml');
const plist = require('plist');

const inputYamlTMLanguageFile1 = "./syntaxes/iapp.YAML-tmLanguage";
const outputTMLanguageFile1 = "./out/syntaxes/iapp.tmLanguage";

console.log('reading iApp YAML Language File');
const yamlTMLanguageText1 = fs.readFileSync(inputYamlTMLanguageFile1, "utf8");
const data1 = yaml.safeLoad(yamlTMLanguageText1);

console.log('writing iApp Textmate Language File');
const tmLanguageText1 = plist.build(data1);
fs.mkdirSync('./out/syntaxes', { recursive: true }, (err) => {
    return;
});
fs.writeFileSync(outputTMLanguageFile1, tmLanguageText1, "utf8");

const inputYamlTMLanguageFile2 = "./syntaxes/apl.YAML-tmLanguage";
const outputTMLanguageFile2 = "./out/syntaxes/apl.tmLanguage";

console.log('reading APL YAML Language File');
const yamlTMLanguageText2 = fs.readFileSync(inputYamlTMLanguageFile2, "utf8");
const data2 = yaml.safeLoad(yamlTMLanguageText2);

console.log('writing APL Textmate Language File');
const tmLanguageText2 = plist.build(data2);
fs.mkdirSync('./out/syntaxes', { recursive: true }, (err) => {
    return;
});
fs.writeFileSync(outputTMLanguageFile2, tmLanguageText2, "utf8");

console.log('complete');
