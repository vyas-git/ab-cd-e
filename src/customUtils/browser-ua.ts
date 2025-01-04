import Browser from 'bowser';

export class UAParser {
  static ua: Browser.Parser.ParsedResult;

  static getParsedUA(): Browser.Parser.ParsedResult {
    if (!UAParser.ua) {
      UAParser.ua = Browser.parse(navigator.userAgent);
    }
    return UAParser.ua;
  }
}
