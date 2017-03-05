# VPlanParser

A [Node.js](https://nodejs.org/en/) module, that parses an untis substitution plan from an automatically generated subst_00X.htm file.

## Installation

`npm i -S mpggu/vplanparser`

## API

### Parameters

The parameters that instantiate a new `VPlanParser`

| Name | Description | Type | Default |
| ---- | ----------- | ---- | ------- |
| data | The XML content of the substitution plan to parse (e.g. the `subst_001.htm` file) | string | |
| encoding? | The encoding of the data. The generated file is usually encoded to `ISO-8859-1` | string | `"UTF-8"`

### Properties

| Name | Description | Type |
| ---- | ----------- | ---- |
| .date | The date that the substitution plan is describing | Date |
| .lastEdited | When the substitution plan was last edited | Date |
| .raw | The raw XML content of the original file | string |
| .table | All the parsed substitution objects. The keys are determined by the <\table> headings. | Object[] |

### Methods

**.search(key, query)** : Object[]

- `key` : string - What key to look for in each object, e.g. "klasse"
- `query` : string - What value the specified key should have.

Searches the table for a key-value pair and returns all elements that match it. It's not a direct comparison, but rather a fuzzy search. '9B' will return objects with the value `9ABC`

### Example

```js
const VPlanParser = require('VPlanParser');
const vplan = new VPlanParser(fs.readFileSync('./subst_001.htm'));

vplan.table[2];
/*
{
  klasse: '09A',
  stunde: '2',
  fach: 'Mu',
  vertreter: 'Hg',
  lehrer: 'Bts',
  raum: 'A25',
  art: 'Vertr.'
}
*/

vplan.search('klasse', 'Q1');
/*
[
  {
    klasse: 'Q1/Q2',
    stunde: '3 - 4',
    fach: '',
    vertreter: '+',
    lehrer: 'Mz',
    raum: 'E01',
    art: 'EVA'
  },
  ....
  {
    klasse: 'Q1/Q2',
    stunde: '10 - 11',
    fach: '',
    vertreter: '+',
    lehrer: 'Ste',
    raum: 'A16',
    art: 'EVA'
  }
]
*/