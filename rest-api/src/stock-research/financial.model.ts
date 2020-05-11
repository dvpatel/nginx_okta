export interface Financial {
    reportDate: string;
    grossProfit: number;
    costOfRevenue: number;
    operatingRevenue: number;
    totalRevenue: number;
    operatingIncome: number;
    netIncome: number;
    researchAndDevelopment: number;
    operatingExpense: number;
    currentAssets: number;
    totalAssets: number;
    totalLiabilities: number;
    currentCash: number;
    currentDebt: number;
    totalCash: number;
    totalDebt: number;
    shareholderEquity: number;
    cashChange: number;
    cashFlow: number;
    operatingGainsLosses?: any;
}

export interface Financials {
    symbol: string;
    financials: Financial[];
}
