import {Component, OnInit, AfterViewInit, ChangeDetectorRef, ViewChild, Directive, ElementRef, Input, Output, EventEmitter} from "@angular/core";
import {ControlGroup, FormBuilder, Validators, FORM_DIRECTIVES, FORM_PROVIDERS} from "@angular/common";
import {Router, ROUTER_DIRECTIVES} from "@angular/router";
import {NpnPortalService} from "../npn-portal.service";
import {DateService} from "./date.service";
import {validateRawDateRange, validateDateRange, validateDay, validateYearRange} from './validators';
import { MODAL_DIRECTIVES, ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';

declare var $: any;

@Directive({
    selector: '[datePicker]'
})
export class DatePicker implements OnInit {
    @Output() dateChange = new EventEmitter();
    private element: ElementRef;

    constructor(element: ElementRef) {
        this.element = element;
    }

    public ngOnInit(): void {
        var that = this;
        $(this.element.nativeElement).datetimepicker({format: 'YYYY-MM-DD', ignoreReadonly: true});
        $(this.element.nativeElement).on("dp.change", function (e) {
            that.dateChange.emit({
                value: e
            })
        });
    }
}

@Component({
    templateUrl: 'app/date-range/date-range.html',
    styleUrls: ['app/date-range/date-range.component.css'],
    directives: [ROUTER_DIRECTIVES, MODAL_DIRECTIVES, DatePicker, FORM_DIRECTIVES],
    providers: [FORM_PROVIDERS],
})
export class DateRangeComponent implements OnInit, AfterViewInit {

    startDateChange(event) {
        if (event.value && event.value.target && event.value.target.children[0])
            this.startDate = event.value.target.children[0].value;
        this.cdr.detectChanges();
    }

    endDateChange(event) {
        if (event.value && event.value.target && event.value.target.children[0])
            this.endDate = event.value.target.children[0].value;
        this.cdr.detectChanges();
    }

    @ViewChild('invalidDateRangeModal')
    invalidDateRangeModal: ModalComponent;
    
    rawDateForm: ControlGroup;
    
    dateForm: ControlGroup;
    startDateGroup: ControlGroup;
    endDateGroup: ControlGroup;
    
    dateYearForm : ControlGroup;
    

    startDate:string;
    endDate:string;
    
    rangeType:string;
    startDay:number;
    endDay:number;
    startMonth:string = "June";
    endMonth:string;
    startYear:number;
    endYear:number;
    
    dataPrecision:number;
    periodInterest:number;
    customPeriodInterest:number;

    modalErrorMessage:string;
    
    constructor(private _npnPortalService: NpnPortalService,
                private _dateService: DateService,
                private _router: Router,
                private builder: FormBuilder,
                private cdr: ChangeDetectorRef) {
      
      // this.dateForm = builder.group({
      //     startDateGroup:  builder.group({
      //         year: ['', Validators.required],
      //         month: ['', Validators.required],
      //         day: ['', Validators.required]
      //     },  {validator: validateDay}),
      //     endDateGroup:  builder.group({
      //         year: ['', Validators.required],
      //         month: ['', Validators.required],
      //         day: ['', Validators.required]
      //     },  {validator: validateDay})
      // },  {validator: validateDateRange});
      //
      // this.rawDateForm = builder.group({
      //     startDate: ['', Validators.required],
      //     endDate: ['', Validators.required]
      // }, {validator: validateRawDateRange});
      //
      // this.startDateGroup = <ControlGroup> this.dateForm.controls['startDateGroup'];
      // this.endDateGroup = <ControlGroup> this.dateForm.controls['endDateGroup'];

  }
    
    isSelected(button) {
      return button == this.rangeType;
    }

    setRangeDates() {
      if (this.rangeType == 'calendar') {
        this.startMonth = 'January';
        this.endMonth = 'December';
        this.startDay = 1;
        this.endDay = 31;
      }
      else if (this.rangeType == 'water') {
        this.startMonth = 'October';
        this.endMonth = 'September';
        this.startDay = 1;
        this.endDay = 30;
      }
      else if (this.rangeType == 'summer') {
        this.startMonth = 'July';
        this.endMonth = 'June';
        this.startDay = 1;
        this.endDay = 30;
      }
    }

  
    setRangeType(type:string) {
        this.rangeType = type;
        this.setRangeDates();
        // this.cdr.detectChanges();
    }

    getDownloadType(){
        return this._npnPortalService.downloadType;
    }

    getMonths(){
        return this._dateService.months;
    }

    getDateRangeHeader(){
        return (this.getDownloadType() == "magnitude") ? "Period of Interest" : "Season Date Range";
    }
    
    getDateRangeLabel(){
        return (this.getDownloadType() == "magnitude") ? "Define the period of interest and years for your dataset." : "Define the season of interest and years for your dataset.";
    }    
    
    getYears() {
        var today = new Date();
        var year = today.getFullYear();
        let years:number[] = [];
        for(var i = 1950; i <= year; i++) {
            years.push(i);
        }
        return years;
    }

    isDateRangeValid() :boolean {
        if (this.getDownloadType() === 'raw') {
            if(!this.startDate) {
                this.modalErrorMessage = "You have entered an invalid date range. Please enter a start date.";
                this.invalidDateRangeModal.open();
                return false;
            }
            if(!this.endDate) {
                this.modalErrorMessage = "You have entered an invalid date range. Please enter an end date.";
                this.invalidDateRangeModal.open();
                return false;
            }
            if(this.endDate <= this.startDate) {
                this.modalErrorMessage = "Please make the end date comes after the start date.";
                this.invalidDateRangeModal.open();
                return false;
            }
        }
        else if (this.getDownloadType() !== 'magnitude'){
            if(!this.dateForm.valid || !this.startDateGroup.valid || !this.endDateGroup.valid) {
                if(!this.startDateGroup.valid && !this.endDateGroup.valid)
                    this.modalErrorMessage = "You have entered an invalid date range. Please enter a valid start and end days.";
                if(!this.startDateGroup.valid)
                    this.modalErrorMessage = "You have entered an invalid date range. Please enter a valid start day.";
                else if(!this.endDateGroup.valid)
                    this.modalErrorMessage = "You have entered an invalid date range. Please enter a valid end day.";
                else
                    this.modalErrorMessage = "Please make the end date come after the start date.";
                this.invalidDateRangeModal.open();
                return false;
            }
        }else{
            if(!this.startYear) {
                this.modalErrorMessage = "You have entered an invalid date range. Please enter a start year.";
                this.invalidDateRangeModal.open();
                return false;
            }
            if(!this.endYear) {
                this.modalErrorMessage = "You have entered an invalid date range. Please enter an end year.";
                this.invalidDateRangeModal.open();
                return false;
            }
            if(this.endYear < this.startYear) {
                this.modalErrorMessage = "Please make the end year comes after the start year.";
                this.invalidDateRangeModal.open();
                return false;
            }
        }
        return true;
    }

  submit() {
      if(this.getDownloadType() === 'raw' && !this.startDate && !this.endDate) {
          return;
      }

      if (!this.isDateRangeValid())
          return;

      if (this.getDownloadType() != 'raw') {
          this._dateService.rangeType = this.rangeType;
          this._dateService.startDate  = this.startDate;
          this._dateService.endDate = this.endDate;
          this._dateService.startDay = this.startDay;
          this._dateService.endDay = this.endDay;
          this._dateService.startMonth = this.startMonth;
          this._dateService.endMonth = this.endMonth;
          this._dateService.startYear = this.startYear;
          this._dateService.endYear = this.endYear;

          this._npnPortalService.rangeType = this.rangeType;
          this._npnPortalService.startDay = this.startDay;
          this._npnPortalService.endDay = this.endDay;
          this._npnPortalService.startMonth = this.startMonth;
          this._npnPortalService.endMonth = this.endMonth;
          this._npnPortalService.startYear = this.startYear;
          this._npnPortalService.endYear = this.endYear;

          this._dateService.startDate = new Date(this.startYear, this._dateService.months.indexOf(this.startMonth), this.startDay).toISOString().split('T')[0];
          this._dateService.endDate = new Date(this.endYear, this._dateService.months.indexOf(this.endMonth), this.endDay).toISOString().split('T')[0];

          if (this.getDownloadType() === 'siteLevelSummarized') {
              this._dateService.dataPrecision = this.dataPrecision;
              this._npnPortalService.dataPrecision = this.dataPrecision;
          }
          else {
              this._dateService.dataPrecision = null;
              this._npnPortalService.dataPrecision = null;
          }
          
          if(this.getDownloadType() == 'magnitude'){
              
              let periodToSet = (this.periodInterest != -1) ? this.periodInterest : this.customPeriodInterest;
              this._dateService.periodInterest = periodToSet;
              this._npnPortalService.periodInterest = periodToSet;
          }else{
              this._dateService.periodInterest = null;
              this._npnPortalService.periodInterest = null;
          }
          
      }

      if (this.getDownloadType() === 'raw') {
          this._dateService.startDate = this.startDate;
          this._dateService.endDate = this.endDate;
      }
      
      this._npnPortalService.startDate = this._dateService.startDate;
      this._npnPortalService.endDate = this._dateService.endDate;
      
      this._npnPortalService.setObservationCount();
  }
  
  checkCustomPeriodRange(){
      if(this.customPeriodInterest > 366){
          this.customPeriodInterest = 366;
      }
  }
    
    onSelect(page) {
        this._router.navigate( [page] );
    }

    
    continueWithoutSavingDate() {
        this._npnPortalService.activePage = '';
    }
    
  ngOnInit() {
      this._npnPortalService.resettingFilters = false;
      
      this.startDate = this._dateService.startDate;
      this.endDate = this._dateService.endDate;
      
      this.rangeType = this._dateService.rangeType;
      this.startDay = this._dateService.startDay;
      this.endDay = this._dateService.endDay;
      this.startMonth = this._dateService.startMonth;
      this.endMonth = this._dateService.endMonth;
      this.startYear = this._dateService.startYear;
      this.endYear = this._dateService.endYear;
      
      this.dataPrecision = this._dateService.dataPrecision;
      
      this.periodInterest = (this._dateService.periodInterest == 7 || this._dateService.periodInterest == 14 || this._dateService.periodInterest == 30 || this._dateService.periodInterest == null) ? this._dateService.periodInterest : -1;
      this.customPeriodInterest = this._dateService.periodInterest;
      
      if (!this.rangeType) {
          this.setRangeType('calendar');
      }
      
      if (!this.dataPrecision) {
          this.dataPrecision = 30;
      }
      
      if (!this.periodInterest){
          this.periodInterest = 7;
      }


      this.dateForm = this.builder.group({
          startDateGroup:  this.builder.group({
              year: ['', Validators.required],
              month: ['', Validators.required],
              day: ['', Validators.required]
          },  {validator: validateDay}),
          endDateGroup:  this.builder.group({
              year: ['', Validators.required],
              month: ['', Validators.required],
              day: ['', Validators.required]
          },  {validator: validateDay})
      },  {validator: validateDateRange});
      
      this.dateYearForm = this.builder.group({
          startYear: ['', Validators.required],
          endYear: ['', Validators.required]
      }, {validator: validateYearRange});

      this.rawDateForm = this.builder.group({
          startDate: ['', Validators.required],
          endDate: ['', Validators.required]
      }, {validator: validateRawDateRange});

      this.startDateGroup = <ControlGroup> this.dateForm.controls['startDateGroup'];
      this.endDateGroup = <ControlGroup> this.dateForm.controls['endDateGroup'];
           
  }
    
    ngAfterViewInit() {
        this.cdr.detectChanges();
    }
}
