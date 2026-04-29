import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";
import { Artwork } from "@/types";

interface ExportButtonProps {
  artworks: Artwork[];
}

export function ExportButton({ artworks }: ExportButtonProps) {
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  const exportToExcel = async () => {
    setExporting(true);
    try {
      // Prepare data for export
      const exportData = artworks.map((artwork) => ({
        Title: artwork.title,
        Artist: artwork.artist,
        Year: artwork.year || '',
        Medium: artwork.medium || '',
        Dimensions: artwork.dimensions || '',
        Price: artwork.price || '',
        'Purchase Price': artwork.purchase_price || '',
        Status: artwork.status || '',
        Location: artwork.location || '',
        'Seller Name': artwork.seller_name || '',
        'Seller Contact': artwork.seller_contact || '',
        Description: artwork.description || '',
        Tags: artwork.tags ? artwork.tags.join(', ') : '',
        'On Consignment': artwork.on_consignment ? 'Yes' : 'No',
        'Commission Rate': artwork.commission_rate || '',
        'Created At': new Date(artwork.created_at).toLocaleDateString(),
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Auto-size columns
      const colWidths = Object.keys(exportData[0] || {}).map((key) => ({
        wch: Math.max(
          key.length,
          ...exportData.map((row) => String((row as any)[key] || '').length)
        ) + 2,
      }));
      ws['!cols'] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Artworks');

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `artworks_export_${timestamp}.xlsx`;

      // Write file
      XLSX.writeFile(wb, filename);

      toast({
        title: "Export Successful",
        description: `Exported ${artworks.length} artworks to ${filename}`,
      });
    } catch (error: any) {
      toast({
        title: "Export Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  const exportToCSV = async () => {
    setExporting(true);
    try {
      // Prepare data for export
      const exportData = artworks.map((artwork) => ({
        Title: artwork.title,
        Artist: artwork.artist,
        Year: artwork.year || '',
        Medium: artwork.medium || '',
        Dimensions: artwork.dimensions || '',
        Price: artwork.price || '',
        'Purchase Price': artwork.purchase_price || '',
        Status: artwork.status || '',
        Location: artwork.location || '',
        'Seller Name': artwork.seller_name || '',
        'Seller Contact': artwork.seller_contact || '',
        Description: artwork.description || '',
        Tags: artwork.tags ? artwork.tags.join(', ') : '',
        'On Consignment': artwork.on_consignment ? 'Yes' : 'No',
        'Commission Rate': artwork.commission_rate || '',
        'Created At': new Date(artwork.created_at).toLocaleDateString(),
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);
      XLSX.utils.book_append_sheet(wb, ws, 'Artworks');

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `artworks_export_${timestamp}.csv`;

      // Write CSV file
      XLSX.writeFile(wb, filename, { bookType: 'csv' });

      toast({
        title: "Export Successful",
        description: `Exported ${artworks.length} artworks to ${filename}`,
      });
    } catch (error: any) {
      toast({
        title: "Export Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="rounded-full border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/20"
          disabled={exporting || artworks.length === 0}
        >
          {exporting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Export
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={exportToExcel}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export as Excel (.xlsx)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToCSV}>
          <FileText className="h-4 w-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
