import { DateRange } from "react-date-range";

const DatePicker = ({datesValue, handleDatesValue}) => {
  return (
    <DateRange
      ranges={[datesValue]}
      onChange={handleDatesValue}

      date={new Date()}
      minDate={datesValue.startDate}
      maxDate={datesValue.endDate}
      
      rangeColors={["#F43F5E"]}
      direction="vertical"
      showDateDisplay={true}
    />
  );
};

export default DatePicker;
