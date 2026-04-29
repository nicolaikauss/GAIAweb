import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface ColumnMapping {
  [csvColumn: string]: string;
}

interface ColumnMapperProps {
  csvHeaders: string[];
  dbFields: { value: string; label: string; required?: boolean }[];
  mapping: ColumnMapping;
  onMappingChange: (mapping: ColumnMapping) => void;
}

export function ColumnMapper({ csvHeaders, dbFields, mapping, onMappingChange }: ColumnMapperProps) {
  const handleMappingChange = (csvColumn: string, dbField: string) => {
    onMappingChange({
      ...mapping,
      [csvColumn]: dbField === "skip" ? "" : dbField
    });
  };

  const requiredFields = dbFields.filter(f => f.required);
  const mappedRequiredFields = requiredFields.filter(f => 
    Object.values(mapping).includes(f.value)
  );
  const allRequiredMapped = mappedRequiredFields.length === requiredFields.length;

  return (
    <div className="space-y-4">
      {allRequiredMapped ? (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            All required fields are mapped. Ready to import!
          </AlertDescription>
        </Alert>
      ) : (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please map all required fields: {requiredFields.filter(f => !Object.values(mapping).includes(f.value)).map(f => f.label).join(", ")}
          </AlertDescription>
        </Alert>
      )}

      <Card className="p-6">
        <div className="space-y-4">
          {csvHeaders.map((header, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="flex-1">
                <Label className="text-sm font-medium text-slate-700">
                  CSV Column: <span className="font-semibold">{header}</span>
                </Label>
              </div>
              <div className="flex-1">
                <Select
                  value={mapping[header] || "skip"}
                  onValueChange={(value) => handleMappingChange(header, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select field..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="skip">
                      <span className="text-slate-400">Skip this column</span>
                    </SelectItem>
                    {dbFields.map((field) => (
                      <SelectItem key={field.value} value={field.value}>
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
