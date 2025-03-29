// PDF Generator using jsPDF
function generatePDF(invoiceData) {
    // Load jsPDF library dynamically
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.onload = () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Add invoice header with logo
        let yPos = 20;
        if (invoiceData.client.logo) {
            try {
                const logoData = invoiceData.client.logo.split(',')[1];
                const img = new Image();
                img.src = invoiceData.client.logo;
                
                // Add logo to PDF (scaled to 50px height)
                doc.addImage(logoData, 'JPEG', 20, yPos, 0, 50);
                yPos += 60; // Adjust vertical position for other elements
            } catch (e) {
                console.error('Error adding logo to PDF:', e);
            }
        }
        
        doc.setFontSize(20);
        doc.text('INVOICE', 105, yPos, { align: 'center' });
        yPos += 10;
        doc.setFontSize(12);
        doc.text(`#${invoiceData.number}`, 105, 30, { align: 'center' });
        doc.text(`Date: ${invoiceData.date}`, 105, 35, { align: 'center' });

        // Add client details
        doc.setFontSize(14);
        doc.text('Bill To:', 20, 50);
        doc.setFontSize(12);
        doc.text(invoiceData.client.name || 'Client Name', 20, 60);
        doc.text(invoiceData.client.email || 'Email', 20, 70);
        doc.text(invoiceData.client.phone || 'Phone', 20, 80);
        doc.text(invoiceData.client.address || 'Address', 20, 90);

        // Add invoice items table
        doc.setFontSize(14);
        doc.text('Items', 20, 110);
        
        // Table headers
        doc.setFontSize(12);
        doc.text('Description', 20, 120);
        doc.text('Qty', 100, 120);
        doc.text('Price', 130, 120);
        doc.text('Amount', 160, 120);
        
        // Table rows
        let y = 130;
        invoiceData.items.forEach(item => {
            doc.text(item.description || 'Item', 20, y);
            doc.text(item.quantity.toString(), 100, y);
            doc.text(`$${item.price.toFixed(2)}`, 130, y);
            doc.text(`$${(item.quantity * item.price).toFixed(2)}`, 160, y);
            y += 10;
        });

        // Add totals
        doc.setFontSize(12);
        doc.text(`Subtotal: $${invoiceData.subtotal?.toFixed(2) || '0.00'}`, 130, y + 20);
        doc.text(`Tax (${(invoiceData.taxRate * 100).toFixed(2)}%): $${invoiceData.taxAmount?.toFixed(2) || '0.00'}`, 130, y + 30);
        doc.setFontSize(14);
        doc.text(`Total: $${invoiceData.total?.toFixed(2) || '0.00'}`, 130, y + 40);

        // Save the PDF
        doc.save(`invoice_${invoiceData.number}.pdf`);
    };
    document.head.appendChild(script);
}