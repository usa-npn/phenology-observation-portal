import {Injectable} from '@angular/core';

@Injectable()
export class DateService {
  // for summarized
  public months:string[] = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];
  
  public rangeType:string;
  public startDay:number;
  public endDay:number;
  public startMonth:string;
  public endMonth:string;
  public startYear:number = 2010;
  public endYear:number = 2015;
  
  // for raw
  public startDate:string;// = '2012-01-01';
  public endDate:string;// = '2012-12-31';
  
  // for site lvl
  public dataPrecision:number;
  
  public periodInterest:number;

  public reset() {
      this.rangeType = null;
      this.startDay = null;
      this.endDay = null;
      this.startMonth = null;
      this.endMonth = null;
      this.startYear = 2010;
      this.endYear = 2015;

        // for raw
      this.startDate = null;
      this.endDate = null;

        // for site lvl
      this.dataPrecision = 30;
      
      this.periodInterest = 7;
  }
}
