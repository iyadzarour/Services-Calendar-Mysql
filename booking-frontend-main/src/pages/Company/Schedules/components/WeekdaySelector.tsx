import React from 'react';
import { Button } from 'antd';
import { WeekDay } from "../../../../Schema";
import { withTranslation } from 'react-i18next';
import i18n from "../../../../locales/i18n";

interface WeekdaySelectorProps {
  selectedDays: WeekDay[];
  setSelectedDays: (selectedDays: WeekDay[]) => void;
  disabled?: boolean;
}

const WeekdaySelector: React.FC<WeekdaySelectorProps> = ({ selectedDays, setSelectedDays, disabled = false }) => {

  const handleDayClick = (day: WeekDay) => {
    const updatedSelectedDays = selectedDays.includes(day)
      ? selectedDays.filter((selectedDay) => selectedDay !== day)
      : [...selectedDays, day];

    setSelectedDays(updatedSelectedDays);
  };

  const handleAllDaysClick = () => {
    const allDays = Object.values(WeekDay);

    if (selectedDays.length === allDays.length) {
      setSelectedDays([]);
    } else {
      setSelectedDays(allDays);
    }
  };

  const mapping = {
      Monday: i18n.t('monday'),
      Tuesday: i18n.t('tuesday'),
      Wednesday: i18n.t('wednesday'),
      Thursday: i18n.t('thursday'),
      Friday: i18n.t('friday'),
      Saturday: i18n.t('saturday'),
      Sunday: i18n.t('sunday'),
  }

  return (
    <div>
      {Object.values(WeekDay).map((day, index) => (
        <Button
          key={day}
          className= {index === 0 ? "mr-1" : "mx-1"}
          type={selectedDays.includes(day) ? 'primary' : 'default'}
          onClick={() => disabled ? {} : handleDayClick(day)}
        >
          {mapping[day]}
        </Button>
      ))}
      <Button
        type={selectedDays.length === Object.values(WeekDay).length ? 'primary' : 'default'}
        onClick={() => disabled ? {} : handleAllDaysClick()}
        className="mx-1"
      >
        {i18n.t('all_days')}
      </Button>
    </div>
  );
};

export default withTranslation()(WeekdaySelector);
