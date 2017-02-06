# VPlanParser

Parses an untis substitution plan from an automatically generated subst_001.htm file.

`npm i -S mpggu/vplanparser`

```js
const VPlanParser = require('VPlanParser');
const vplan = new VPlanParser(fs.readFileSync('./subst_001.htm'));

vplan.search('klasse', '9A');
/*
[ { klasse: '09A',
    stunde: '2',
    fach: 'Mu',
    vertreter: 'Hg',
    lehrer: 'Bts',
    raum: 'A25',
    art: 'Vertr.' } ]
*/

vplan.search('raum', 'N24');
/*
 [{ klasse: '09B',
    stunde: '5 - 6',
    fach: 'PoWi',
    vertreter: 'Hen',
    lehrer: 'Hen',
    raum: 'N24',
    art: 'Raum-Vtr.' } ]
*/

vplan.search('klasse', 'q');
/*
  { klasse: 'Q1/Q2',
    stunde: '3 - 4',
    fach: '',
    vertreter: '+',
    lehrer: 'Mz',
    raum: 'E01',
    art: 'EVA' },
  ....
  { klasse: 'Q1/Q2',
    stunde: '10 - 11',
    fach: '',
    vertreter: '+',
    lehrer: 'Ste',
    raum: 'A16',
    art: 'EVA' } ] 
*/
```