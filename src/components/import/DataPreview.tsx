import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface DataPreviewProps {
  headers: string[];
  rows: any[][];
  totalRows: number;
}

export function DataPreview({ headers, rows, totalRows }: DataPreviewProps) {
  return (
    <div className="space-y-4">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Showing first {Math.min(rows.length, 10)} rows of {totalRows} total rows
        </AlertDescription>
      </Alert>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                {headers.map((header, index) => (
                  <TableHead key={index} className="font-semibold text-slate-700">
                    {header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.slice(0, 10).map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <TableCell key={cellIndex} className="text-sm">
                      {cell === null || cell === undefined || cell === '' ? (
                        <span className="text-slate-400 italic">empty</span>
                      ) : (
                        String(cell)
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
