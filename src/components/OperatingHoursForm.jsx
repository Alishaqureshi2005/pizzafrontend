import React from 'react';
import { FaClock } from 'react-icons/fa';

const daysOfWeek = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
];

const OperatingHoursForm = ({ operatingHours, onChange }) => {
  const handleTimeChange = (day, type, value) => {
    onChange({
      ...operatingHours,
      [day]: {
        ...operatingHours[day],
        [type]: value
      }
    });
  };

  const handleDayToggle = (day, isChecked) => {
    if (isChecked) {
      // When checking the box, set default times
      onChange({
        ...operatingHours,
        [day]: {
          open: '09:00',
          close: '17:00'
        }
      });
    } else {
      // When unchecking, clear the times
      onChange({
        ...operatingHours,
        [day]: {
          open: '',
          close: ''
        }
      });
    }
  };

  const isDayOpen = (day) => {
    return operatingHours[day]?.open && operatingHours[day]?.close;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center mb-4">
        <FaClock className="text-gray-500 mr-2" />
        <h3 className="text-lg font-semibold">Operating Hours</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {daysOfWeek.map((day) => (
          <div key={day} className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <label className="capitalize font-medium text-gray-700">{day}</label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isDayOpen(day)}
                  onChange={(e) => handleDayToggle(day, e.target.checked)}
                  className="form-checkbox h-4 w-4 text-blue-600"
                />
                <span className="text-sm text-gray-600">Open</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Opening Time
                </label>
                <input
                  type="time"
                  value={operatingHours[day]?.open || ''}
                  onChange={(e) => handleTimeChange(day, 'open', e.target.value)}
                  className="form-input w-full rounded border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  disabled={!isDayOpen(day)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Closing Time
                </label>
                <input
                  type="time"
                  value={operatingHours[day]?.close || ''}
                  onChange={(e) => handleTimeChange(day, 'close', e.target.value)}
                  className="form-input w-full rounded border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  disabled={!isDayOpen(day)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OperatingHoursForm; 