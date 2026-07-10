import { useDiagnosticRecords } from '@/hooks/useDiagnostic';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import { formatLocalDateString } from '@/lib/date-utils';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';

export function DiagnosticHistory() {
  const { data: records = [], isLoading } = useDiagnosticRecords();

  const handleDownloadPDF = (record: any) => {
    // Implementación rápida y estilizada usando window.print()
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Auditoría - ${record.prospectName}</title>
        <style>
          body { font-family: 'Inter', system-ui, sans-serif; color: #18181b; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 40px 20px; }
          .header { text-align: center; border-bottom: 2px solid #e4e4e7; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { margin: 0; color: #09090b; font-size: 28px; }
          .header p { color: #52525b; margin-top: 5px; }
          .section { margin-bottom: 30px; }
          h2 { color: #2563eb; font-size: 20px; border-bottom: 1px solid #e4e4e7; padding-bottom: 8px; }
          pre { font-family: inherit; white-space: pre-wrap; background: #f4f4f5; padding: 20px; border-radius: 8px; border: 1px solid #e4e4e7; font-size: 15px;}
          .plan-box { background: #ecfdf5; border: 1px solid #a7f3d0; padding: 20px; border-radius: 8px; text-align: center;}
          .plan-box h3 { margin: 0 0 10px 0; color: #065f46; }
          .plan-price { font-family: monospace; font-size: 24px; font-weight: bold; color: #047857; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Reporte de Auditoría Operativa</h1>
          <p>Generado para: <strong>${record.prospectName}</strong> (${record.prospectWhatsapp})</p>
          <p>Fecha: ${formatLocalDateString(record.dateLimaISO, "dd 'de' MMMM, yyyy")}</p>
        </div>

        <div class="section">
          <h2>Análisis Generado</h2>
          <pre>${record.reportText}</pre>
        </div>

        ${record.plan ? `
        <div class="section plan-box">
          <h3>Plan Recomendado</h3>
          <p style="font-size: 18px; font-weight: bold; margin:0">${record.plan.name}</p>
          <p class="plan-price">${formatCurrency(record.plan.price)} / mes</p>
        </div>
        ` : ''}
        
        <script>
          window.onload = function() { window.print(); window.close(); }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  if (isLoading) return <div className="animate-pulse h-64 bg-white/50 rounded-2xl"></div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden animate-in fade-in duration-500">
      <Table>
        <TableHeader className="bg-zinc-50/50">
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Prospecto</TableHead>
            <TableHead>Plan Ofrecido</TableHead>
            <TableHead className="text-right">Exportar</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-12 text-zinc-500">
                <FileText className="w-8 h-8 mx-auto mb-3 text-zinc-300" />
                No hay diagnósticos guardados en el historial.
              </TableCell>
            </TableRow>
          ) : (
            records.map(record => (
              <TableRow key={record.id} className="hover:bg-zinc-50/50">
                <TableCell className="font-medium text-zinc-600 capitalize whitespace-nowrap">
                  {formatLocalDateString(record.dateLimaISO, "dd MMM yyyy")}
                </TableCell>
                <TableCell>
                  <div className="font-bold text-zinc-900">{record.prospectName}</div>
                  <div className="text-xs text-zinc-500 font-mono mt-0.5">{record.prospectWhatsapp}</div>
                </TableCell>
                <TableCell>
                  {record.plan ? (
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                      {record.plan.name}
                    </Badge>
                  ) : (
                    <span className="text-sm text-zinc-400">Solo Análisis</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-zinc-200 hover:bg-zinc-100 rounded-xl text-zinc-700"
                    onClick={() => handleDownloadPDF(record)}
                  >
                    <Download className="w-4 h-4 mr-2" /> PDF
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}