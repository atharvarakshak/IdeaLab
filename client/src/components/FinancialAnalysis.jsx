import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import { motion } from "framer-motion";
import { DollarSign, TrendingUp, Clock, Target } from "lucide-react";

const FinancialAnalysis = ({ data }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value) => {
    return `${value.toFixed(2)}%`;
  };

  if (!data) {
    return <div>Loading...</div>;
  }

  const columnHelper = createColumnHelper();
  const columns = [
    columnHelper.accessor("metric", {
      header: "Metric",
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    }),
    columnHelper.accessor("year1", {
      header: "Year 1",
      cell: (info) => (
        <span className={info.row.original.colorClass}>
          {formatCurrency(info.getValue())}
        </span>
      ),
    }),
    columnHelper.accessor("year2", {
      header: "Year 2",
      cell: (info) => (
        <span className={info.row.original.colorClass}>
          {formatCurrency(info.getValue())}
        </span>
      ),
    }),
    columnHelper.accessor("year3", {
      header: "Year 3",
      cell: (info) => (
        <span className={info.row.original.colorClass}>
          {formatCurrency(info.getValue())}
        </span>
      ),
    }),
  ];

  const tableData = [
    {
      metric: "Revenue",
      year1: data.incomeStatementProjection.revenue[0],
      year2: data.incomeStatementProjection.revenue[1],
      year3: data.incomeStatementProjection.revenue[2],
      colorClass: "text-green-600 font-semibold",
    },
    {
      metric: "COGS",
      year1: data.incomeStatementProjection.cogs[0],
      year2: data.incomeStatementProjection.cogs[1],
      year3: data.incomeStatementProjection.cogs[2],
      colorClass: "text-red-600",
    },
    {
      metric: "Gross Profit",
      year1: data.incomeStatementProjection.grossProfit[0],
      year2: data.incomeStatementProjection.grossProfit[1],
      year3: data.incomeStatementProjection.grossProfit[2],
      colorClass: "text-blue-600 font-semibold",
    },
    {
      metric: "Net Profit",
      year1: data.incomeStatementProjection.netProfit[0],
      year2: data.incomeStatementProjection.netProfit[1],
      year3: data.incomeStatementProjection.netProfit[2],
      colorClass: "text-purple-600 font-semibold",
    },
  ];

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
      >
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/50 dark:to-indigo-900/50 border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Runway & Burn Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Monthly Burn Rate
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(data.monthlyBurnRate)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Runway (Months)
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {data.runway.toFixed(1)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/50 dark:to-emerald-900/50 border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-green-600" />
              Customer Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">CAC</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(data.customerMetrics.cac)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">LTV</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(data.customerMetrics.ltv)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-purple-600" />
              3-Year Income Statement Projection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="px-6 py-4 whitespace-nowrap"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Profitability Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4  bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/50 dark:to-emerald-900/50">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Return on Equity
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {formatPercentage(data.profitabilityMetrics.returnOnEquity)}
                </p>
              </div>
              <div className="p-4  bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/50 dark:to-indigo-900/50">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Gross Margin
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatPercentage(data.profitabilityMetrics.grossMargin[0])}
                </p>
              </div>
              <div className="p-4  bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/50 dark:to-pink-900/50">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Net Profit Margin
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatPercentage(
                    data.profitabilityMetrics.netProfitMargin[0]
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default FinancialAnalysis;
