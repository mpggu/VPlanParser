const cheerio = require('cheerio');
const moment = require('moment');
const iconv = require('iconv-lite');


class VPlanParser {

  /**
   * Creates an instance of Vertretungsplan.
   *
   * @param {string} data The XML content of the VPlan to parse, e.g. fs.readFileSync('subst_001.htm')
   * @param {string} encoding Encoding of the data. Defaults to UTF-8 (Raw file is ISO-8859-1)
   *
   * @prop {Date} date The date that the VPlan is describing
   * @prop {Date} lastEdited When the VPlan was last edited
   * @prop {string} raw The raw XML content of the original file
   * @prop {Array} table Substitution objects. Keys are determined by the table headings.
   *
   * @memberOf Vertretungsplan
   */
  constructor(data, encoding = 'UTF-8') {
    this.raw = data;

    const $ = cheerio.load(iconv.decode(new Buffer(data), encoding), {
      decodeEntities: false,
    });

    this.loadMeta($);
    this.loadInfo($);
  }

  /**
   * Gets meta information (Date of the plan, last time edited)
   *
   * @param {Object} $ cheerio instance
   *
   * @private
   * @memberOf Vertretungsplan
   */
  loadMeta($) {
    const dateString = $('.mon_title').html().split(' ')[0];
    const lastEdited = $('.mon_head tr').children().last()
                      .text()
                      .split('Stand: ')[1].trim();

    this.date = moment(dateString, 'D-M-YYYY').clone();
    this.lastEdited = moment(lastEdited, 'DD-MM-YYYY HH:mm').clone();
  }

  /**
   * Gets the actual substitutions from the VPlan
   *
   * @param {Object} $ cheerio instance
   *
   * @private
   * @memberOf Vertretungsplan
   */
  loadInfo($) {
    const table = this.convertTableToObject($.html($('table.mon_list')));

    this.table = table.map(t => {
      // Q3/Q4BiEffFkJaeKorTüVolWil -> Q3/Q4
      if (t.klasse.startsWith('Q')) {
        t.klasse = t.klasse.substring(0, 5);
      } else if (t.klasse.startsWith('0')) {
        t.klasse = t.klasse.substring(1);
      }

      return t;
    });
  }

  /**
   * Converts the subtitution table to an Object
   *
   * @param {string} html The table to convert as html
   * @returns {Object} The converted table
   *
   * @private
   * @memberOf Vertretungsplan
   */
  convertTableToObject(html) {
    const $ = cheerio.load(html);

    const tableAsObject = [];
    const columnHeadings = [];

    // Defines the column headings. As of now "Klasse(n),	Stunde,	Fach,	Vertreter, (Lehrer), Raum,	Art"
    $('table').find('tr').first()
    .find('th')
    .each((i, cell) => {
      let cellContent = $(cell).text().trim();

      switch (cellContent) {
        case 'Klasse(n)':
          cellContent = 'klasse';
          break;
        case '(Lehrer)':
          cellContent = 'lehrer';
          break;
        default:
          cellContent = cellContent.toLowerCase();
      }

      columnHeadings[i] = cellContent;
    });

    $('table').find('tr').each((i, row) => {
      tableAsObject[i] = {};
      $(row).find('td').each((j, cell) => {
        tableAsObject[i][columnHeadings[j]] = $(cell).text().trim();
      });
    });

    // Ignore the headings
    tableAsObject.shift();

    return tableAsObject;
  }

  /**
   * Gets all the substitutions affecting a certain key
   *
   * @param {string} key Where to search for, can be one of the column headings (klasse, stunde, fach, vertreter, lehrer, raum, art)
   * @param {any} query What to look for, e.g "9E", "Fk", "EVA"
   * @returns {Object[]} The filtered substitutions
   *
   * @memberOf Vertretungsplan
   */
  search(key, query) {
    if (query.includes(' ')) {
      return new Error('The search is limited to one group');
    }
    key = key.toLowerCase();
    query = query.toLowerCase().split('');

    return this.table.filter(t => {
      const k = t[key].toLowerCase();

      for (let i = 0; i < query.length; i++) {
        if (!k.includes(query[i])) return false;
      }
      return true;
    });
  }
}

module.exports = VPlanParser;
