import { create } from 'zustand';

type Quarter = 1 | 2 | 3 | 4 | 'all';

interface PeriodState {
    year: number;
    quarter: Quarter;
    setYear: (year: number) => void;
    setQuarter: (quarter: Quarter) => void;
}

// Calcular el trimestre actual
const getCurrentQuarter = (): Quarter => {
    const month = new Date().getMonth() + 1; // 1-12
    if (month <= 3) return 1;
    if (month <= 6) return 2;
    if (month <= 9) return 3;
    return 4;
};

export const usePeriodStore = create<PeriodState>((set) => ({
    year: new Date().getFullYear(),
    quarter: getCurrentQuarter(),
    setYear: (year) => set({ year }),
    setQuarter: (quarter) => set({ quarter }),
}));
