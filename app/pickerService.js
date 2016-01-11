'use strict';

import _ from 'lodash';
import moment from 'moment';

export default class PickerService {
    constructor() {
        'ngInject';

        this.hours = [
            { value: 0, label: '00:00' },
            { value: 1, label: '01:00' },
            { value: 2, label: '02:00' },
            { value: 3, label: '03:00' },
            { value: 4, label: '04:00' },
            { value: 5, label: '05:00' },
            { value: 6, label: '06:00' },
            { value: 7, label: '07:00' },
            { value: 8, label: '08:00' },
            { value: 9, label: '09:00' },
            { value: 10, label: '10:00' },
            { value: 11, label: '11:00' },
            { value: 12, label: '12:00' },
            { value: 13, label: '13:00' },
            { value: 14, label: '14:00' },
            { value: 15, label: '15:00' },
            { value: 16, label: '16:00' },
            { value: 17, label: '17:00' },
            { value: 18, label: '18:00' },
            { value: 19, label: '19:00' },
            { value: 20, label: '20:00' },
            { value: 21, label: '21:00' },
            { value: 22, label: '22:00' },
            { value: 23, label: '23:00' }
        ];

        this.durations = [
            { value: 1, unit: 'hours', label: '1 hour' },
            { value: 2, unit: 'hours', label: '2 hours' },
            { value: 3, unit: 'hours', label: '3 hours' },
            { value: 6, unit: 'hours', label: '6 hours' },
            { value: 12, unit: 'hours', label: '12 hours' },
            { value: 1, unit: 'days', label: '1 day' },
            { value: 2, unit: 'days', label: '2 days' },
            { value: 3, unit: 'days', label: '3 days' },
            { value: 7, unit: 'days', label: '7 days' }
        ];

        this.defaultDictionary = [
            { label: 'Last Hour', duration: { unit: 'hours', value: 1 }},
            { label: 'Last 24 Hours', duration: { unit: 'days', value: 1 }},
            { label: 'Yesterday', duration: { unit: 'days', value: 1, offset: 1 } },
            { label: 'Last 7 Days', duration: { unit: 'weeks', value: 1 }},
            { label: 'Custom Range', custom: true }
        ];
    }

    browserTimezone (dateInput) {
        var dateObject = dateInput || new Date(),
            dateString = dateObject + "",
            tzAbbr = (
                // Works for the majority of modern browsers
                dateString.match(/\(([^\)]+)\)$/) ||
                    // IE outputs date strings in a different format:
                dateString.match(/([A-Z]+) [\d]{4}$/)
            );
        if (tzAbbr) {
            // Old Firefox uses the long timezone name (e.g., "Central
            // Daylight Time" instead of "CDT")
            tzAbbr = tzAbbr[1].match(/[A-Z]/g).join("");
        }

        if (!tzAbbr) {
            tzAbbr = '';
        }
        return tzAbbr;
    }

    timeDifference(from, to) {
        const fromHelper = new moment(from);
        const toHelper = new moment(to);
        const hours = toHelper.diff(fromHelper, 'hours');
        if (hours > 23) {
            const days = toHelper.diff(fromHelper, 'days');
            return { unit: 'days', value: days, label: `${days} days` };
        } else {
            return { unit: 'hours', value: hours, label: `${hours} hours` };
        }
    }
}