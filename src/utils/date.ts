import {
  isSameWeek,
  setYear,
  startOfToday,
  getYear,
  isSameDay,
  isAfter,
  endOfToday,
  differenceInCalendarDays,
} from "date-fns";

export const isWeekOf = (date: Date) => {
  return isSameWeek(setYear(date, getYear(startOfToday())), startOfToday(), {
    weekStartsOn: 1,
  });
};

export const isDayOf = (date: Date) => {
  return isSameDay(date, setYear(startOfToday(), getYear(date)));
};

export const isAfterToday = (date: Date) => {
  return isAfter(date, setYear(endOfToday(), getYear(date)));
};

export const relativeDaysTillAnniversary = (date: Date) => {
  const days = differenceInCalendarDays(
    setYear(date, getYear(Date.now())),
    Date.now()
  );
  if (days === 0) {
    return "is today";
  } else if (days === 1) {
    return "is tomorrow";
  } else if (days === -1) {
    return "was yesterday";
  } else if (days > 0) {
    return `is in ${days} days`;
  } else {
    return `was ${days} ago`;
  }
};
