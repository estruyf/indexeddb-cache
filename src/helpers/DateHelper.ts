import { DateInterval } from "../enums";

export class DateHelper {

  /**
   * Adds a value to a date
   *
   * @param date The date to which we will add units, done in local time
   * @param interval The name of the interval to add, one of: ['year', 'quarter', 'month', 'week', 'day', 'hour', 'minute', 'second']
   * @param units The amount to add to date of the given interval
   */
  public static dateAdd(date: string, interval: DateInterval, units: number): Date | undefined {
    let ret = new Date(date); // don't change original date
    switch (interval) {
      case DateInterval.year: 
        ret.setFullYear(ret.getFullYear() + units); 
        break;
      case DateInterval.quarter: 
        ret.setMonth(ret.getMonth() + 3 * units); 
        break;
      case DateInterval.month: 
        ret.setMonth(ret.getMonth() + units); 
        break;
      case DateInterval.week: 
        ret.setDate(ret.getDate() + 7 * units); 
        break;
      case DateInterval.day: 
        ret.setDate(ret.getDate() + units); 
        break;
      case DateInterval.hour: 
        ret.setTime(ret.getTime() + units * 3600000); 
        break;
      case DateInterval.minute: 
        ret.setTime(ret.getTime() + units * 60000); 
        break;
      case DateInterval.second: 
        ret.setTime(ret.getTime() + units * 1000); 
        break;
      default: 
        return undefined;
    }
    return ret;
  }
}