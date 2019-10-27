(function () {
  'use strict';

  var MS_IN_MINUTES = 60 * 1000;

  var formatTime = function (date) {
    return date.toISOString().replace(/-|:|\.\d+/g, '');
  };

  var calculateEndTime = function (event) {
    return event.end ?
      formatTime(event.end) :
      formatTime(new Date(event.start.getTime() + (event.duration * MS_IN_MINUTES)));
  };

  var calendarGenerators = {
    google: function (event) {
      var startTime = formatTime(event.start);
      var endTime = calculateEndTime(event);

      var href = encodeURI([
        'https://www.google.com/calendar/render',
        '?action=TEMPLATE',
        '&text=' + (event.title || ''),
        '&dates=' + (startTime || ''),
        '/' + (endTime || ''),
        '&details=' + (event.description || ''),
        '&location=' + (event.address || ''),
        '&sprop=&sprop=name:'
      ].join(''));

      console.log("ics >>>> ", href);
      return href;
    },

    yahoo: function (event) {
      var eventDuration = event.end ?
        ((event.end.getTime() - event.start.getTime()) / MS_IN_MINUTES) :
        event.duration;

      // Yahoo: convert the duration from minutes to hh:mm
      var yahooHourDuration = eventDuration < 600 ?
        '0' + Math.floor((eventDuration / 60)) :
        Math.floor((eventDuration / 60)) + '';

      var yahooMinuteDuration = eventDuration % 60 < 10 ?
        '0' + eventDuration % 60 :
        eventDuration % 60 + '';

      var yahooEventDuration = yahooHourDuration + yahooMinuteDuration;

      // Remove timezone from event time
      var st = formatTime(new Date(event.start - (event.start.getTimezoneOffset() *
        MS_IN_MINUTES))) || '';

      var href = encodeURI([
        'http://calendar.yahoo.com/?v=60&view=d&type=20',
        '&title=' + (event.title || ''),
        '&st=' + st,
        '&dur=' + (yahooEventDuration || ''),
        '&desc=' + (event.description || ''),
        '&in_loc=' + (event.address || '')
      ].join(''));

      console.log("ics >>>> ", href);
      return href;
    },

    ics: function (event) {
      var startTime = formatTime(event.start);
      var endTime = calculateEndTime(event);

      var href = encodeURI(
        'data:text/calendar;charset=utf8,' + [
          'BEGIN:VCALENDAR',
          'VERSION:2.0',
          'BEGIN:VEVENT',
          'URL:' + 'document.URL',
          'DTSTART:' + (startTime || ''),
          'DTEND:' + (endTime || ''),
          'SUMMARY:' + (event.title || ''),
          'DESCRIPTION:' + (event.description || ''),
          'LOCATION:' + (event.address || ''),
          'END:VEVENT',
          'END:VCALENDAR'].join('\n'));

      console.log("ics >>>> ", href);
      return href;
    },

    ical: function (event) {
      return this.ics(event);
    },

    outlook: function (event) {
      return this.ics(event);
    }
  };

  // Make sure we have the necessary event data, such as start time and event duration
  var validParams = function (params) {
    return params.data !== undefined && params.data.start !== undefined &&
      (params.data.end !== undefined || params.data.duration !== undefined);
  };

  var generateCalendars = function (event) {
    if (!validParams(event)) {
      console.log('Event details missing.');
      return;
    }

    return {
      google: calendarGenerators.google(event),
      yahoo: calendarGenerators.yahoo(event),
      ical: calendarGenerators.ical(event),
      outlook: calendarGenerators.outlook(event)
    };
  };


  global.addToCalendar = generateCalendars;
})();

var myCalendar = addToCalendar({
  title: 'Get on the front page of HN',     // Event title
  start: new Date('2019-11-12'),   // Event start date
  duration: 120,                            // Event duration (IN MINUTES)
  // If an end time is set, this will take precedence over duration
  end: new Date('2019-11-12'),
  address: 'The internet',
  description: 'Get on the front page of HN, then prepare for world domination.'
});