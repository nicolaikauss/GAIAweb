// @ts-nocheck
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileUpload } from "./FileUpload";
import { DataPreview } from "./DataPreview";
import { ColumnMapper } from "./ColumnMapper";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from "xlsx";
import { ArrowLeft, ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import { csvRowSchema, sanitizeCsvCell } from "@/lib/validations";

interface ImportWizardProps {
  open: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

const DB_FIELDS = [
  { value: "title", label: "Title", required: true },
  { value: "artist", label: "Artist", required: true },
  { value: "year", label: "Year", required: false },
  { value: "medium", label: "Medium", required: false },
  { value: "dimensions", label: "Dimensions", required: false },
  { value: "price", label: "Price", required: false },
  { value: "purchase_price", label: "Purchase Price", required: false },
  { value: "seller_name", label: "Seller Name", required: false },
  { value: "seller_contact", label: "Seller Contact", required: false },
  { value: "location", label: "Location", required: false },
  { value: "description", label: "Description", required: false },
  { value: "status", label: "Status", required: false },
];

export function ImportWizard({ open, onClose, onImportComplete }: ImportWizardProps) {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<any[][]>([]);
  const [mapping, setMapping] = useState<{ [key: string]: string }>({});
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    try {
      const data = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(data);
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

      if (jsonData.length > 0) {
        const fileHeaders = jsonData[0] as string[];
        const fileRows = jsonData.slice(1) as any[][];
        
        setHeaders(fileHeaders);
        setRows(fileRows);

        // Auto-map columns with matching names
        const autoMapping: { [key: string]: string } = {};
        fileHeaders.forEach(header => {
          const normalizedHeader = header.toLowerCase().replace(/[^a-z0-9]/g, '');
          const matchingField = DB_FIELDS.find(f => 
            f.value.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedHeader ||
            f.label.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedHeader
          );
          if (matchingField) {
            autoMapping[header] = matchingField.value;
          }
        });
        setMapping(autoMapping);
        setStep(2);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to parse file. Please ensure it's a valid CSV or Excel file.",
        variant: "destructive",
      });
    }
  };

  const handleImport = async () => {
    setImporting(true);
    setStep(4);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const artwork: any = { user_id: user.id };

        // Map and sanitize CSV data to database fields
        headers.forEach((header, index) => {
          const dbField = mapping[header];
          if (dbField && row[index] !== undefined && row[index] !== null && row[index] !== '') {
            const sanitizedValue = sanitizeCsvCell(row[index]);
            if (dbField === 'year' || dbField === 'price' || dbField === 'purchase_price') {
              const numValue = Number(sanitizedValue);
              if (!isNaN(numValue)) {
                artwork[dbField] = numValue;
              }
            } else {
              artwork[dbField] = sanitizedValue;
            }
          }
        });

        // Validate row with schema
        const validation = csvRowSchema.safeParse(artwork);
        if (!validation.success) {
          errors.push(`Row ${i + 2}: ${validation.error.errors[0].message}`);
          errorCount++;
          continue;
        }

        // Set defaults
        artwork.status = artwork.status || 'available';
        artwork.tags = [];

        const { error } = await supabase
          .from("artworks")
          .insert(artwork);

        if (error) {
          errors.push(`Row ${i + 2}: ${error.message}`);
          errorCount++;
        } else {
          successCount++;
        }

        setProgress(((i + 1) / rows.length) * 100);
      }

      toast({
        title: "Import Complete",
        description: `Successfully imported ${successCount} artworks. ${errorCount > 0 ? `${errorCount} failed.` : ''}`,
        variant: errorCount > 0 ? "destructive" : "default",
      });

      if (errors.length > 0) {
        console.log("Import errors:", errors);
      }

      setTimeout(() => {
        onImportComplete();
        handleClose();
      }, 1500);

    } catch (error: any) {
      toast({
        title: "Import Failed",
        description: error.message,
        variant: "destructive",
      });
      setImporting(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setFile(null);
    setHeaders([]);
    setRows([]);
    setMapping({});
    setProgress(0);
    setImporting(false);
    onClose();
  };

  const canProceedToMapping = file && headers.length > 0 && rows.length > 0;
  const canProceedToImport = Object.values(mapping).filter(v => v).length > 0 &&
    DB_FIELDS.filter(f => f.required).every(f => Object.values(mapping).includes(f.value));

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Import Artworks</DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {[
            { num: 1, label: "Upload" },
            { num: 2, label: "Preview" },
            { num: 3, label: "Map Columns" },
            { num: 4, label: "Import" },
          ].map((s, i) => (
            <div key={s.num} className="flex items-center flex-1">
              <div className={`flex items-center gap-2 ${step >= s.num ? 'text-blue-600' : 'text-slate-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                  step > s.num ? 'bg-green-500 text-white' : 
                  step === s.num ? 'bg-blue-600 text-white' : 
                  'bg-slate-200'
                }`}>
                  {step > s.num ? <CheckCircle className="w-5 h-5" /> : s.num}
                </div>
                <span className="font-medium hidden sm:inline">{s.label}</span>
              </div>
              {i < 3 && (
                <div className={`flex-1 h-0.5 mx-2 ${step > s.num ? 'bg-green-500' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[300px]">
          {step === 1 && (
            <FileUpload
              onFileSelect={handleFileSelect}
              selectedFile={file}
              onClear={() => setFile(null)}
            />
          )}

          {step === 2 && (
            <DataPreview
              headers={headers}
              rows={rows}
              totalRows={rows.length}
            />
          )}

          {step === 3 && (
            <ColumnMapper
              csvHeaders={headers}
              dbFields={DB_FIELDS}
              mapping={mapping}
              onMappingChange={setMapping}
            />
          )}

          {step === 4 && (
            <div className="text-center py-12">
              <Loader2 className="h-16 w-16 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-lg font-medium text-slate-800 mb-2">Importing artworks...</p>
              <p className="text-sm text-slate-600 mb-4">Please wait while we process your data</p>
              <Progress value={progress} className="w-full max-w-md mx-auto" />
              <p className="text-sm text-slate-500 mt-2">{Math.round(progress)}%</p>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        {step < 4 && (
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => step > 1 ? setStep(step - 1) : handleClose()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {step === 1 ? "Cancel" : "Back"}
            </Button>
            
            {step < 3 && (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={step === 1 && !canProceedToMapping}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}

            {step === 3 && (
              <Button
                onClick={handleImport}
                disabled={!canProceedToImport || importing}
              >
                Import {rows.length} Artworks
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
