
export const createDateRange = (days: number) => {
  const dates = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    
    dates.push({
      date,
      nextDate,
      dateStr: date.toISOString().split('T')[0],
      displayDate: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    });
  }
  return dates;
};

export const filterRecordsByDate = (records: any[], date: Date, nextDate: Date, dateFields: string[]) => {
  return records.filter(record => {
    for (const field of dateFields) {
      const recordDate = record[field];
      if (recordDate) {
        const parsedDate = new Date(recordDate);
        return parsedDate >= date && parsedDate < nextDate;
      }
    }
    return false;
  });
};
