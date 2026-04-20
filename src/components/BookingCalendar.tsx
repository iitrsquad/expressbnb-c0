import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isAvailable: boolean;
  price: number;
  isToday: boolean;
  isSelected: boolean;
  isInRange: boolean;
}

interface BookingCalendarProps {
  propertyId: string;
  basePrice: number;
  onDateRangeSelect?: (checkIn: Date | null, checkOut: Date | null, totalPrice: number) => void;
}

export default function BookingCalendar({ propertyId, basePrice, onDateRangeSelect }: BookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
  const [calendarData, setCalendarData] = useState<Map<string, { isAvailable: boolean; price: number }>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayNamesShort = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  useEffect(() => {
    fetchCalendarData();
  }, [propertyId, currentMonth]);

  const fetchCalendarData = async () => {
    setIsLoading(true);
    try {
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

      const startDate = new Date(startOfMonth);
      startDate.setDate(startDate.getDate() - 7);

      const endDate = new Date(endOfMonth);
      endDate.setDate(endDate.getDate() + 7);

      const { data, error } = await supabase
        .from('property_calendar')
        .select('date, is_available, price_override')
        .eq('property_id', propertyId)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0]);

      if (error) throw error;

      const dataMap = new Map<string, { isAvailable: boolean; price: number }>();

      data?.forEach(entry => {
        dataMap.set(entry.date, {
          isAvailable: entry.is_available,
          price: entry.price_override || basePrice
        });
      });

      setCalendarData(dataMap);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCalendarDays = (): CalendarDay[] => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < startingDayOfWeek; i++) {
      const date = new Date(year, month, -startingDayOfWeek + i + 1);
      const dateStr = date.toISOString().split('T')[0];
      const calData = calendarData.get(dateStr);

      days.push({
        date,
        isCurrentMonth: false,
        isAvailable: calData?.isAvailable ?? true,
        price: calData?.price ?? basePrice,
        isToday: false,
        isSelected: false,
        isInRange: false
      });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      const calData = calendarData.get(dateStr);
      const isToday = date.getTime() === today.getTime();
      const isPast = date < today;

      days.push({
        date,
        isCurrentMonth: true,
        isAvailable: !isPast && (calData?.isAvailable ?? true),
        price: calData?.price ?? basePrice,
        isToday,
        isSelected: isDateSelected(date),
        isInRange: isDateInRange(date)
      });
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      const dateStr = date.toISOString().split('T')[0];
      const calData = calendarData.get(dateStr);

      days.push({
        date,
        isCurrentMonth: false,
        isAvailable: calData?.isAvailable ?? true,
        price: calData?.price ?? basePrice,
        isToday: false,
        isSelected: false,
        isInRange: false
      });
    }

    return days;
  };

  const isDateSelected = (date: Date): boolean => {
    if (!checkInDate && !checkOutDate) return false;

    const dateTime = date.getTime();
    if (checkInDate && dateTime === checkInDate.getTime()) return true;
    if (checkOutDate && dateTime === checkOutDate.getTime()) return true;

    return false;
  };

  const isDateInRange = (date: Date): boolean => {
    if (!checkInDate || !checkOutDate) return false;

    const dateTime = date.getTime();
    return dateTime > checkInDate.getTime() && dateTime < checkOutDate.getTime();
  };

  const handleDateClick = (day: CalendarDay) => {
    if (!day.isAvailable || !day.isCurrentMonth) return;

    const clickedDate = new Date(day.date);
    clickedDate.setHours(0, 0, 0, 0);

    if (!checkInDate || (checkInDate && checkOutDate)) {
      setCheckInDate(clickedDate);
      setCheckOutDate(null);
      if (onDateRangeSelect) {
        onDateRangeSelect(clickedDate, null, 0);
      }
    } else if (clickedDate > checkInDate) {
      setCheckOutDate(clickedDate);
      const total = calculateTotalPrice(checkInDate, clickedDate);
      if (onDateRangeSelect) {
        onDateRangeSelect(checkInDate, clickedDate, total);
      }
    } else {
      setCheckInDate(clickedDate);
      setCheckOutDate(null);
      if (onDateRangeSelect) {
        onDateRangeSelect(clickedDate, null, 0);
      }
    }
  };

  const calculateTotalPrice = (start: Date, end: Date): number => {
    let total = 0;
    const current = new Date(start);

    while (current < end) {
      const dateStr = current.toISOString().split('T')[0];
      const calData = calendarData.get(dateStr);
      total += calData?.price ?? basePrice;
      current.setDate(current.getDate() + 1);
    }

    return total;
  };

  const getTotalNights = (): number => {
    if (!checkInDate || !checkOutDate) return 0;
    const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getTotalPrice = (): number => {
    if (!checkInDate || !checkOutDate) return 0;
    return calculateTotalPrice(checkInDate, checkOutDate);
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const calendarDays = getCalendarDays();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 md:p-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <button
          onClick={goToPreviousMonth}
          className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
        </button>

        <h3 className="text-base sm:text-lg font-semibold text-gray-900">
          <span className="hidden sm:inline">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
          <span className="sm:hidden">{monthNames[currentMonth.getMonth()].slice(0, 3)} {currentMonth.getFullYear()}</span>
        </h3>

        <button
          onClick={goToNextMonth}
          className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
          aria-label="Next month"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-1 sm:mb-2">
        {dayNames.map((day, index) => (
          <div key={day} className="text-center text-[10px] sm:text-xs font-medium text-gray-500 py-1 sm:py-2">
            <span className="hidden sm:inline">{day}</span>
            <span className="sm:hidden">{dayNamesShort[index]}</span>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
          {Array.from({ length: 42 }).map((_, i) => (
            <div key={i} className="aspect-square bg-gray-100 animate-pulse rounded-md sm:rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
          {calendarDays.map((day, index) => {
            const isDisabled = !day.isAvailable || !day.isCurrentMonth;

            return (
              <button
                key={index}
                onClick={() => handleDateClick(day)}
                disabled={isDisabled}
                className={`
                  aspect-square p-0.5 sm:p-1 rounded-md sm:rounded-lg relative transition-all touch-manipulation
                  ${day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                  ${day.isToday ? 'ring-1 sm:ring-2 ring-blue-500' : ''}
                  ${day.isSelected ? 'bg-blue-600 text-white' : ''}
                  ${day.isInRange ? 'bg-blue-100' : ''}
                  ${!day.isSelected && !day.isInRange && day.isAvailable && day.isCurrentMonth ? 'hover:bg-gray-100 active:bg-gray-200' : ''}
                  ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                `}
              >
                <div className="flex flex-col items-center justify-center h-full gap-0 sm:gap-0.5">
                  <span className="text-xs sm:text-sm font-medium leading-none">{day.date.getDate()}</span>
                  {day.isCurrentMonth && day.isAvailable && (
                    <span className={`text-[9px] sm:text-xs leading-none ${day.isSelected ? 'text-white' : 'text-gray-500'}`}>
                      ₹{day.price > 999 ? `${Math.round(day.price / 1000)}k` : day.price}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {(checkInDate || checkOutDate) && (
        <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
          <div className="space-y-2 sm:space-y-3">
            {checkInDate && (
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-600">Check-in:</span>
                <span className="font-medium text-gray-900">
                  {checkInDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            )}

            {checkOutDate && (
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-600">Check-out:</span>
                <span className="font-medium text-gray-900">
                  {checkOutDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            )}

            {checkInDate && checkOutDate && (
              <>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">{getTotalNights()} night{getTotalNights() > 1 ? 's' : ''}</span>
                  <span className="font-medium text-gray-900">₹{getTotalPrice().toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-sm sm:text-base font-semibold pt-2 sm:pt-3 border-t border-gray-200">
                  <span className="text-gray-900">Total Price</span>
                  <span className="text-blue-600">₹{getTotalPrice().toLocaleString()}</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-gray-500">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-600 rounded flex-shrink-0" />
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-100 rounded flex-shrink-0" />
          <span>In range</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-200 rounded flex-shrink-0" />
          <span>Unavailable</span>
        </div>
      </div>
    </div>
  );
}
