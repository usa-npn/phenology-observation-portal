import { FormGroup } from '@angular/forms';

// import {Control, ControlGroup} from "@angular/common";

// Examples
// // SINGLE FIELD VALIDATORS
// export function emailValidator(control: Control): {[key: string]: any} {
//     var emailRegexp = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
//     if (control.value && !emailRegexp.test(control.value)) {
//         return {invalidEmail: true};
//     }
// }
//
// //CONTROL GROUP VALIDATORS
// export function matchingPasswords(passwordKey: string, confirmPasswordKey: string) {
//     return (group: ControlGroup): {[key: string]: any} => {
//         let password = group.controls[passwordKey];
//         let confirmPassword = group.controls[confirmPasswordKey];
//
//         if (password.value !== confirmPassword.value) {
//             return {
//                 mismatchedPasswords: true
//             };
//         }
//     }
// }

//todo fix these
export function validateRawDateRange(fg: FormGroup) {
    const start = fg.get('startDate').value;
    const end = fg.get('endDate').value;
    return start !== null && end !== null && start <= end
        ? null
        : { invalidDateRange: true };
}

export function validateYearRange(fg: FormGroup) {
    const start = fg.get('startYear').value;
    const end = fg.get('endYear').value;
    return start !== null && end !== null && start <= end
        ? null
        : { invalidDateRange: true };
}

export function validateDateRange(group) {
    // let startYear:Control = <Control> group.controls['startDateGroup']['controls']['year'];
    // let startMonth:Control = <Control> group.controls['startDateGroup']['controls']['month'];
    // let startDay:Control = <Control> group.controls['startDateGroup']['controls']['day'];
    // let endYear:Control = <Control> group.controls['endDateGroup']['controls']['year'];
    // let endMonth:Control = <Control> group.controls['endDateGroup']['controls']['month'];
    // let endDay:Control = <Control> group.controls['endDateGroup']['controls']['day'];

    // if (!startYear || !startMonth || !startDay || !endYear || !endMonth || !endDay) {
    //     return {invalidDate: true};
    // }
    
    // let months:string[] = [
    //     "January",
    //     "February",
    //     "March",
    //     "April",
    //     "May",
    //     "June",
    //     "July",
    //     "August",
    //     "September",
    //     "October",
    //     "November",
    //     "December"
    // ];
    // let startDate = new Date(startYear.value, months.indexOf(startMonth.value), startDay.value);
    // let endDate = new Date(endYear.value, months.indexOf(endMonth.value), endDay.value);

    // if (startDate > endDate) {
    //     return {
    //         invalidDate: true
    //     };
    // }
}

export function validateDay(group) {
    // let dayControl:Control = <Control> group.controls['day'];
    // let monthControl:Control = <Control> group.controls['month'];

    // if (!dayControl || !dayControl.value) {
    //     return {invalidDay: true};
    // }
    
    // if(monthControl.value === "September" ||
    //     monthControl.value === "April" ||
    //     monthControl.value === "June" ||
    //     monthControl.value === "November") {
    
    //     if (dayControl.value < 1 || dayControl.value > 30) {
    //         dayControl.setErrors({invalidDay: true});
    //         return {invalidDay: true};
    //     }
    // }
    
    // if(monthControl.value === "February") {
    
    //     if (dayControl.value < 1 || dayControl.value > 29) {
    //         dayControl.setErrors({invalidDay: true});
    //         return {invalidDay: true};
    //     }
    // }
    
    // if (dayControl.value < 1 || dayControl.value > 31) {
    //     dayControl.setErrors({invalidDay: true});
    //     return {invalidDay: true};
    // }
    
    // if (dayControl.value >= 1 && dayControl.value <= 31) {
    //     dayControl.setErrors(null);
    // }
}