import {Component, OnInit, AfterViewInit, ChangeDetectorRef, ViewChild, Directive, ElementRef, Input, Output, EventEmitter} from "@angular/core";
// import {ControlGroup, FormBuilder, Validators, FORM_DIRECTIVES, FORM_PROVIDERS} from "@angular/common";
import {Router} from "@angular/router";
import {NpnPortalService} from "../npn-portal.service";
import {DateService} from "./date.service";
import {validateRawDateRange, validateDateRange, validateDay, validateYearRange} from './validators';
import { BsModalComponent } from 'ng2-bs3-modal';
// import { MODAL_DIRECTIVES, ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import { FormControl, FormBuilder, Validators } from '@angular/forms';

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
    templateUrl: 'date-range.html',
    styleUrls: ['date-range.component.css']
    // providers: [FORM_PROVIDER],
})
export class DateRangeComponent implements OnInit, AfterViewInit {

    constructor(private _npnPortalService: NpnPortalService,
                private _dateService: DateService,
                private _router: Router,
                private fb: FormBuilder,
                private cdr: ChangeDetectorRef) {
      
    }

    

    @ViewChild('invalidDateRangeModal')

    invalidDateRangeModal: BsModalComponent;
    
    rangeType:string;
    
    modalErrorMessage:string;

    dateForm = this.fb.group({
        startDateGroup:  this.fb.group({
            year: ['', Validators.required],
            month: ['', Validators.required],
            day: ['', Validators.required]
        },  {validator: validateDay}),
        endDateGroup:  this.fb.group({
            year: ['', Validators.required],
            month: ['', Validators.required],
            day: ['', Validators.required]
        },  {validator: validateDay}),
        dataPrecision: ['', Validators.required]
    },  {validator: validateDateRange});

    rawDateForm = this.fb.group({
        startDate: ['', Validators.required],
        endDate: ['', Validators.required]
    }, {validator: validateRawDateRange});

    magnitudePhenoForm = this.fb.group({
        startYear: ['', Validators.required],
        endYear: ['', Validators.required],
        periodInterest: ['', Validators.required],
        customPeriodInterest: ['', Validators.required]
    }, {validator: validateYearRange});

    startDateChange(event) {
        if (event.value && event.value.target && event.value.target.children[0]) {
            this.rawDateForm.patchValue({startDate: event.value.target.children[0].value});
        }
    }

    endDateChange(event) {
        if (event.value && event.value.target && event.value.target.children[0]) {
            this.rawDateForm.patchValue({endDate: event.value.target.children[0].value});
        }
    }
    
    isSelected(button) {
      return button == this.rangeType;
    }

    setRangeDates() {
      if (this.rangeType == 'calendar') {
        this.dateForm.controls.startDateGroup.patchValue({month: 'January'});
        this.dateForm.controls.endDateGroup.patchValue({month: 'December'});
        this.dateForm.controls.startDateGroup.patchValue({day: 1});
        this.dateForm.controls.endDateGroup.patchValue({day: 31});
      }
      else if (this.rangeType == 'water') {
        this.dateForm.controls.startDateGroup.patchValue({month: 'October'});
        this.dateForm.controls.endDateGroup.patchValue({month: 'September'});
        this.dateForm.controls.startDateGroup.patchValue({day: 1});
        this.dateForm.controls.endDateGroup.patchValue({day: 30});
      }
      else if (this.rangeType == 'summer') {
        this.dateForm.controls.startDateGroup.patchValue({month: 'July'});
        this.dateForm.controls.endDateGroup.patchValue({month: 'June'});
        this.dateForm.controls.startDateGroup.patchValue({day: 1});
        this.dateForm.controls.endDateGroup.patchValue({day: 30});
      }
    }

  
    setRangeType(type:string) {
        this.rangeType = type;
        this.setRangeDates();
    }

    showCustomPeriodInterest() {
        return this.magnitudePhenoForm.controls.periodInterest.value == -1;
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
    
    getRecentYears() {
        var today = new Date();
        var year = today.getFullYear();
        let years:number[] = [];
        for(var i = 2008; i <= year; i++) {
            years.push(i);
        }
        return years; 
    }    

    isDateRangeValid() :boolean {
        let startDate = this.rawDateForm.controls.startDate.value;
        let endDate = this.rawDateForm.controls.endDate.value;
        if (this.getDownloadType() === 'raw') {
            if(!startDate) {
                this.modalErrorMessage = "You have entered an invalid date range. Please enter a start date.";
                this.invalidDateRangeModal.open();
                return false;
            }
            if(!endDate) {
                this.modalErrorMessage = "You have entered an invalid date range. Please enter an end date.";
                this.invalidDateRangeModal.open();
                return false;
            }
            if(endDate <= startDate) {
                this.modalErrorMessage = "Please make the end date come after the start date.";
                this.invalidDateRangeModal.open();
                return false;
            }
        }
        else if (this.getDownloadType() !== 'magnitude'){
            // if(!this.dateForm.valid || !this.startDateGroup.valid || !this.endDateGroup.valid) {
            //     if(!this.startDateGroup.valid && !this.endDateGroup.valid)
            //         this.modalErrorMessage = "You have entered an invalid date range. Please enter a valid start and end days.";
            //     if(!this.startDateGroup.valid)
            //         this.modalErrorMessage = "You have entered an invalid date range. Please enter a valid start day.";
            //     else if(!this.endDateGroup.valid)
            //         this.modalErrorMessage = "You have entered an invalid date range. Please enter a valid end day.";
            //     else
            //         this.modalErrorMessage = "Please make the end date come after the start date.";
            //     // this.invalidDateRangeModal.open();
            //     return false;
            // }
        }else{
            let startYear = this.magnitudePhenoForm.controls.startYear.value;
            let endYear = this.magnitudePhenoForm.controls.endYear.value;
            if(!startYear) {
                this.modalErrorMessage = "You have entered an invalid date range. Please enter a start year.";
                this.invalidDateRangeModal.open();
                return false;
            }
            if(!endYear) {
                this.modalErrorMessage = "You have entered an invalid date range. Please enter an end year.";
                this.invalidDateRangeModal.open();
                return false;
            }
            if(endYear < startYear) {
                this.modalErrorMessage = "Please make the end year come after the start year.";
                this.invalidDateRangeModal.open();
                return false;
            }
        }
        return true;
    }

  submit() {
      if(this.getDownloadType() === 'raw' 
            && !this.rawDateForm.controls.startDate.value 
            && !this.rawDateForm.controls.endDate.value) {
          return;
      }

      if (!this.isDateRangeValid())
          return;

        if(this.getDownloadType() == 'magnitude'){
            let startYear = this.magnitudePhenoForm.controls.startYear.value;
            let endYear = this.magnitudePhenoForm.controls.endYear.value;

            this._dateService.startYear = startYear;
            this._dateService.endYear = endYear;
            
            let periodToSet = (this.magnitudePhenoForm.controls.periodInterest.value != -1) ? this.magnitudePhenoForm.controls.periodInterest.value : this.magnitudePhenoForm.controls.customPeriodInterest.value;
            this._dateService.periodInterest = periodToSet;
            this._npnPortalService.periodInterest = periodToSet;

            this._dateService.startDate = new Date(startYear, 0, 1).toISOString().split('T')[0];

            this._dateService.endDate = new Date(endYear, 11, 31).toISOString().split('T')[0];
        }
      else if (this.getDownloadType() != 'raw') {
        let startYear = this.dateForm.controls.startDateGroup.value.year;
        let endYear = this.dateForm.controls.endDateGroup.value.year;
        let startMonth = this.dateForm.controls.startDateGroup.value.month;
        let endMonth = this.dateForm.controls.endDateGroup.value.month;
        let startDay = this.dateForm.controls.startDateGroup.value.day;
        let endDay = this.dateForm.controls.endDateGroup.value.day;

          this._dateService.rangeType = this.rangeType;
          this._dateService.startDay = startDay;
          this._dateService.endDay = endDay;
          this._dateService.startMonth = startMonth;
          this._dateService.endMonth = endMonth;
          this._dateService.startYear = startYear;
          this._dateService.endYear = endYear;

          this._npnPortalService.rangeType = this.rangeType;
          this._npnPortalService.startDay = startDay;
          this._npnPortalService.endDay = endDay;
          this._npnPortalService.startMonth = startMonth;
          this._npnPortalService.endMonth = endMonth;
          this._npnPortalService.startYear = startYear;
          this._npnPortalService.endYear = endYear;

          this._dateService.startDate = new Date(startYear, this._dateService.months.indexOf(startMonth), startDay).toISOString().split('T')[0];
          this._dateService.endDate = new Date(endYear, this._dateService.months.indexOf(endMonth), endDay).toISOString().split('T')[0];

          if (this.getDownloadType() === 'siteLevelSummarized') {
              this._dateService.dataPrecision = this.dateForm.controls.dataPrecision.value;
              this._npnPortalService.dataPrecision = this.dateForm.controls.dataPrecision.value;
          }
          else {
              this._dateService.dataPrecision = null;
              this._npnPortalService.dataPrecision = null;
          }
          
          if(this.getDownloadType() == 'magnitude'){
              
              let periodToSet = (this.magnitudePhenoForm.controls.periodInterest.value != -1) ? this.magnitudePhenoForm.controls.periodInterest.value : this.magnitudePhenoForm.controls.customPeriodInterest.value;
              this._dateService.periodInterest = periodToSet;
              this._npnPortalService.periodInterest = periodToSet;
          }else{
              this._dateService.periodInterest = null;
              this._npnPortalService.periodInterest = null;
          }
          
      }

      if (this.getDownloadType() === 'raw') {
        this._dateService.startDate = this.rawDateForm.controls.startDate.value;
        this._dateService.endDate = this.rawDateForm.controls.endDate.value;
      }
      
      this._npnPortalService.startDate = this._dateService.startDate;
      this._npnPortalService.endDate = this._dateService.endDate;
      
      this._npnPortalService.setObservationCount();
  }
  
  checkCustomPeriodRange(){
      if(this.magnitudePhenoForm.controls.customPeriodInterest.value > 366){
          this.magnitudePhenoForm.controls.customPeriodInterest.setValue(366);
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
      
        this.rawDateForm.patchValue({
          startDate: this._dateService.startDate,
          endDate: this._dateService.endDate
        });

        this.magnitudePhenoForm.patchValue({
            startYear: this._dateService.startYear,
            endYear: this._dateService.endYear,
            periodInterest: (this._dateService.periodInterest == 7 || this._dateService.periodInterest == 14 || this._dateService.periodInterest == 30 || this._dateService.periodInterest == null) ? this._dateService.periodInterest : -1,
            customPeriodInterest: this._dateService.periodInterest
        });
        
        this.dateForm.controls.startDateGroup.patchValue(
        {   
            month: this._dateService.startMonth,
            day: this._dateService.startDay,
            year: this._dateService.startYear,
        });

        this.dateForm.controls.endDateGroup.patchValue(
        {   
            month: this._dateService.endMonth,
            day: this._dateService.endDay,
            year: this._dateService.endYear,
        });

        if(this.getDownloadType() == 'siteLevelSummarized') {
            this.dateForm.controls.dataPrecision.patchValue(this._dateService.dataPrecision);
            if (!this.dateForm.controls.dataPrecision.value) {
                this.dateForm.controls.dataPrecision.patchValue(30);
            }
        }

        if(this.getDownloadType() == 'magnitude') {
            this.magnitudePhenoForm.controls.periodInterest.patchValue(this._dateService.periodInterest);
            if (!this.magnitudePhenoForm.controls.periodInterest.value) {
                this.magnitudePhenoForm.controls.periodInterest.patchValue(7);
            }
        }
      
        this.rangeType = this._dateService.rangeType;
        if (!this.rangeType) {
            this.setRangeType('calendar');
        }      
  }
    
    ngAfterViewInit() {
    }
}
