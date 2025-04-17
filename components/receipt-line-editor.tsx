"use client"
import { useCallback } from "react"
import { Column, DataGrid, textEditor } from "react-data-grid"
import { Button } from "@/components/ui/button"
import { useReceipt } from "./receipt-context"
import { LineType } from "@/types/line-type"
import type { ILine } from "@/types"
import { formatCurrency } from "@/lib/utils"
import { useTheme } from "next-themes"

interface ReceiptLineEditorProps {
    goToNextTab: () => void
}

export function ReceiptLineEditor({ goToNextTab }: ReceiptLineEditorProps) {
  const { receipt, setLines } = useReceipt()
  const { resolvedTheme } = useTheme()
  const rows = receipt?.lines || []

  const columns: Column<ILine>[] = [
    {
      key: "name",
      name: "Item Name",
      width: 300,
      renderEditCell: textEditor,
    },
    {
      key: "price",
      name: "Price",
      editable: true,
      width: 100,
      renderCell: ({ row }: { row: ILine }) => (
        <div className="text-right">{formatCurrency(row.price)}</div>
      ),
      renderEditCell: ({ row, onRowChange }: { row: ILine; onRowChange: (row: ILine) => void }) => (
        <input
          type="number"
          step="0.01"
          value={row.price}
          onChange={(e) => onRowChange({ ...row, price: parseFloat(e.target.value) })}
          className="w-full h-full px-2 py-1 border rounded text-right"
        />
      ),
    },
    {
      key: "lineType",
      name: "Type",
      editable: true,
      width: 100,
      renderCell: ({ row }: { row: ILine }) => row.lineType === LineType.ITEM ? "Item" : "Fee",
      renderEditCell: ({ row, onRowChange }: { row: ILine; onRowChange: (row: ILine) => void }) => (
        <select
          value={row.lineType}
          onChange={(e) => onRowChange({ ...row, lineType: e.target.value as LineType })}
          className="w-full h-full px-2 py-1 border rounded"
        >
          <option value={LineType.ITEM}>Item</option>
          <option value={LineType.FEE}>Fee</option>
        </select>
      ),
    },
  ]

  const handleRowsChange = useCallback((newRows: ILine[]) => {
    setLines(newRows)
  }, [setLines])

  if (!receipt) {
    return <div>No receipt data available</div>
  }

  return (
    <div className="space-y-4">
      <div className="h-[400px] border rounded-md overflow-hidden">
        <DataGrid
          columns={columns}
          rows={rows}
          onRowsChange={handleRowsChange}
          className={`h-full ${resolvedTheme === 'dark' ? 'rdg-dark' : 'rdg-light'}`}
        />
      </div>
      <div className="flex justify-end">
        <Button onClick={goToNextTab}>Save Changes And Continue</Button>
      </div>
    </div>
  )
} 