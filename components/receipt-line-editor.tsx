"use client";
import { useCallback, useState } from "react";
import { Column, DataGrid, textEditor } from "react-data-grid";
import { Button } from "@/components/ui/button";
import { useReceipt } from "./receipt-context";
import { LineType } from "@/types/line-type";
import type { ILine, IReceiptImage } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { useTheme } from "next-themes";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

interface ReceiptLineEditorProps {
  goToNextTab: () => void;
}

interface ImageViewerProps {
  images: IReceiptImage[];
}

function ImageViewer({ images }: ImageViewerProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(true);

  const goToPrevious = () => {
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const goToNext = () => {
    setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  if (!images.length) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border-r">
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="icon">
          {isOpen ? (
            <PanelLeftClose className="h-4 w-4" />
          ) : (
            <PanelLeftOpen className="h-4 w-4" />
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="w-[300px]">
        <div className="relative p-4">
          <AspectRatio ratio={3 / 4} className="bg-muted">
            <img
              src={images[currentImageIndex].imageUrl}
              alt={`Receipt ${currentImageIndex + 1}`}
              className="object-contain w-full h-full"
            />
          </AspectRatio>
          {images.length > 1 && (
            <div className="absolute inset-x-0 bottom-0 flex justify-between p-2">
              <Button variant="ghost" size="icon" onClick={goToPrevious}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={goToNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function ReceiptLineEditor({ goToNextTab }: ReceiptLineEditorProps) {
  const { receipt, setLines } = useReceipt();
  const { resolvedTheme } = useTheme();
  const rows = receipt?.lines || [];
  const images = receipt?.images || [];

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
      renderEditCell: ({
        row,
        onRowChange,
      }: {
        row: ILine;
        onRowChange: (row: ILine) => void;
      }) => (
        <input
          type="number"
          step="0.01"
          value={row.price}
          onChange={(e) =>
            onRowChange({ ...row, price: parseFloat(e.target.value) })
          }
          className="w-full h-full px-2 py-1 border rounded text-right"
        />
      ),
    },
    {
      key: "lineType",
      name: "Type",
      editable: true,
      width: 100,
      renderCell: ({ row }: { row: ILine }) =>
        row.lineType === LineType.ITEM ? "Item" : "Fee",
      renderEditCell: ({
        row,
        onRowChange,
      }: {
        row: ILine;
        onRowChange: (row: ILine) => void;
      }) => (
        <select
          value={row.lineType}
          onChange={(e) =>
            onRowChange({ ...row, lineType: e.target.value as LineType })
          }
          className="w-full h-full px-2 py-1 border rounded"
        >
          <option value={LineType.ITEM}>Item</option>
          <option value={LineType.FEE}>Fee</option>
        </select>
      ),
    },
  ];

  const handleRowsChange = useCallback(
    (newRows: ILine[]) => {
      setLines(newRows);
    },
    [setLines]
  );

  if (!receipt) {
    return <div>No receipt data available</div>;
  }

  return (
    <div>
      <div className="flex">
        <ImageViewer images={images} />
        <div className="flex-1 space-y-4 p-4">
          <div className="h-full border rounded-md overflow-hidden">
            <DataGrid
              columns={columns}
              rows={rows}
              onRowsChange={handleRowsChange}
              className={`h-full ${
                resolvedTheme === "dark" ? "rdg-dark" : "rdg-light"
              }`}
            />
          </div>
          <div>Total: {formatCurrency(rows.reduce((acc, row) => acc + row.price, 0))}</div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={goToNextTab}>Save Changes And Continue</Button>
      </div>
    </div>
  );
}
