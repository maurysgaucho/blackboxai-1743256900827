// DOM Elements
const themeToggle = document.getElementById('themeToggle');
const invoiceForm = document.getElementById('invoiceForm');
const previewSection = document.getElementById('invoicePreview');

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    // Theme toggle functionality
    themeToggle.addEventListener('click', toggleTheme);
    
    // Check for saved theme preference
    if (localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    }

    // Initialize form and preview sections
    initInvoiceForm();
    initPreviewSection();
});

function toggleTheme() {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
}

function initInvoiceForm() {
    const addItemBtn = document.getElementById('addItemBtn');
    const itemsContainer = document.getElementById('itemsContainer');
    const invoiceForm = document.getElementById('invoiceForm');
    const taxRateInput = document.getElementById('taxRate');

    // Add new item row
    addItemBtn.addEventListener('click', () => {
        const itemId = Date.now();
        const itemHtml = `
            <div id="item-${itemId}" class="invoice-item grid grid-cols-12 gap-4">
                <div class="col-span-5">
                    <input type="text" class="form-input item-description" placeholder="Description" required>
                </div>
                <div class="col-span-2">
                    <input type="number" class="form-input item-quantity" placeholder="Qty" min="1" value="1" required>
                </div>
                <div class="col-span-2">
                    <input type="number" class="form-input item-price" placeholder="Price" min="0" step="0.01" required>
                </div>
                <div class="col-span-2 flex items-center">
                    <span class="item-total text-gray-700 dark:text-gray-300">0.00</span>
                </div>
                <div class="col-span-1 flex items-center justify-end">
                    <button type="button" class="text-red-500 hover:text-red-700 dark:hover:text-red-400 remove-item">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        itemsContainer.insertAdjacentHTML('beforeend', itemHtml);
    });

    // Remove item row
    itemsContainer.addEventListener('click', (e) => {
        if (e.target.closest('.remove-item')) {
            const itemElement = e.target.closest('.invoice-item');
            const itemIndex = Array.from(itemsContainer.children).indexOf(itemElement);
            currentInvoice.removeItem(itemIndex);
            itemElement.remove();
            updateInvoicePreview();
        }
    });

    // Calculate item totals when values change
    itemsContainer.addEventListener('input', (e) => {
        if (e.target.classList.contains('item-quantity') || 
            e.target.classList.contains('item-price')) {
            const itemElement = e.target.closest('.invoice-item');
            const quantity = parseFloat(itemElement.querySelector('.item-quantity').value) || 0;
            const price = parseFloat(itemElement.querySelector('.item-price').value) || 0;
            const total = (quantity * price).toFixed(2);
            itemElement.querySelector('.item-total').textContent = total;
        }
    });

    // Handle form submission
    invoiceForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveInvoice();
    });

    // Update tax rate
    taxRateInput.addEventListener('change', () => {
        currentInvoice.taxRate = parseFloat(taxRateInput.value) / 100;
        updateInvoicePreview();
    });
}

function initPreviewSection() {
    const previewSection = document.getElementById('invoicePreview');
    
    // Initial empty preview
    previewSection.innerHTML = `
        <div class="text-center py-8 text-gray-500 dark:text-gray-400">
            <i class="fas fa-file-invoice text-4xl mb-2"></i>
            <p>Invoice preview will appear here</p>
        </div>
    `;
}

function updateInvoicePreview() {
    const previewSection = document.getElementById('invoicePreview');
    const invoiceData = currentInvoice.getInvoiceData();
    
    // Generate items HTML
    const itemsHtml = invoiceData.items.map(item => `
        <tr class="border-b border-gray-200 dark:border-gray-700">
            <td class="py-2">${item.description || 'Item'}</td>
            <td class="py-2 text-right">${item.quantity}</td>
            <td class="py-2 text-right">$${item.price.toFixed(2)}</td>
            <td class="py-2 text-right">$${(item.quantity * item.price).toFixed(2)}</td>
        </tr>
    `).join('');

    // Generate preview HTML
    previewSection.innerHTML = `
        <div id="invoice-print" class="bg-white dark:bg-gray-800 p-6">
            <div class="flex justify-between items-start mb-8">
                <div>
                    <h2 class="text-2xl font-bold text-gray-800 dark:text-white">INVOICE</h2>
                    <p class="text-gray-600 dark:text-gray-300">#${invoiceData.number}</p>
                </div>
                <div class="text-right">
                    <p class="text-gray-600 dark:text-gray-300">Date: ${invoiceData.date}</p>
                </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                    <h3 class="text-lg font-medium mb-2 text-gray-800 dark:text-white">Bill To:</h3>
                    <p class="text-gray-700 dark:text-gray-300">${invoiceData.client.name || 'Client Name'}</p>
                    <p class="text-gray-700 dark:text-gray-300">${invoiceData.client.email || 'Email'}</p>
                    <p class="text-gray-700 dark:text-gray-300">${invoiceData.client.phone || 'Phone'}</p>
                    <p class="text-gray-700 dark:text-gray-300">${invoiceData.client.address || 'Address'}</p>
                </div>
            </div>
            
            <div class="overflow-x-auto">
                <table class="min-w-full">
                    <thead>
                        <tr class="border-b border-gray-200 dark:border-gray-700">
                            <th class="text-left py-2">Description</th>
                            <th class="text-right py-2">Qty</th>
                            <th class="text-right py-2">Price</th>
                            <th class="text-right py-2">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>
            </div>
            
            <div class="mt-8 text-right">
                <div class="inline-block text-left">
                    <p class="text-gray-700 dark:text-gray-300 mb-1">Subtotal: $${invoiceData.subtotal?.toFixed(2) || '0.00'}</p>
                    <p class="text-gray-700 dark:text-gray-300 mb-1">Tax (${(invoiceData.taxRate * 100).toFixed(2)}%): $${invoiceData.taxAmount?.toFixed(2) || '0.00'}</p>
                    <p class="text-xl font-bold text-gray-800 dark:text-white mt-2">Total: $${invoiceData.total?.toFixed(2) || '0.00'}</p>
                </div>
            </div>
            
            <div class="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400 text-sm">
                <p>Thank you for your business!</p>
            </div>
        </div>
        
        <div class="mt-6 flex justify-end space-x-2">
            <button id="printInvoiceBtn" class="btn-secondary">
                <i class="fas fa-print mr-2"></i>Print
            </button>
            <button id="downloadPdfBtn" class="btn-primary">
                <i class="fas fa-file-pdf mr-2"></i>Download PDF
            </button>
        </div>
    `;

    // Add event listeners for print and download
    document.getElementById('printInvoiceBtn')?.addEventListener('click', printInvoice);
    document.getElementById('downloadPdfBtn')?.addEventListener('click', downloadPdf);
}

// Invoice class to handle invoice data and calculations
class Invoice {
    constructor() {
        this.items = [];
        this.client = {};
        this.invoiceNumber = this.generateInvoiceNumber();
        this.date = new Date().toISOString().split('T')[0];
        this.taxRate = 0.15; // Default tax rate 15%
    }

    generateInvoiceNumber() {
        const timestamp = Date.now();
        return `INV-${timestamp}`;
    }

    addItem(item) {
        this.items.push(item);
        this.calculateTotals();
    }

    removeItem(index) {
        this.items.splice(index, 1);
        this.calculateTotals();
    }

    calculateTotals() {
        this.subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        this.taxAmount = this.subtotal * this.taxRate;
        this.total = this.subtotal + this.taxAmount;
    }

    setClientDetails(details) {
        this.client = details;
    }

    getInvoiceData() {
        return {
            number: this.invoiceNumber,
            date: this.date,
            client: this.client,
            items: this.items,
            subtotal: this.subtotal,
            taxAmount: this.taxAmount,
            total: this.total
        };
    }
}

// Create a new invoice instance
const currentInvoice = new Invoice();

// Save invoice data
function saveInvoice() {
    // Get client details
    currentInvoice.setClientDetails({
        name: document.getElementById('clientName').value,
        email: document.getElementById('clientEmail').value,
        phone: document.getElementById('clientPhone').value,
        address: document.getElementById('clientAddress').value
    });

    // Get all items
    const itemElements = document.querySelectorAll('.invoice-item');
    currentInvoice.items = Array.from(itemElements).map(item => ({
        description: item.querySelector('.item-description').value,
        quantity: parseFloat(item.querySelector('.item-quantity').value),
        price: parseFloat(item.querySelector('.item-price').value)
    }));

    // Calculate totals
    currentInvoice.calculateTotals();
    updateInvoicePreview();

    // Save to local storage
    localStorage.setItem('currentInvoice', JSON.stringify(currentInvoice));
    showToast('Invoice saved successfully!');
}

// Print invoice
function printInvoice() {
    window.print();
}

// Download PDF
function downloadPdf() {
    const invoiceData = currentInvoice.getInvoiceData();
    generatePDF(invoiceData);
    showToast('PDF generated successfully!');
}

// Show toast notification
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg animate-fade-in-out';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Load saved invoice if exists
function loadSavedInvoice() {
    const savedInvoice = localStorage.getItem('currentInvoice');
    if (savedInvoice) {
        const data = JSON.parse(savedInvoice);
        Object.assign(currentInvoice, data);
        
        // Populate client fields
        document.getElementById('clientName').value = data.client.name || '';
        document.getElementById('clientEmail').value = data.client.email || '';
        document.getElementById('clientPhone').value = data.client.phone || '';
        document.getElementById('clientAddress').value = data.client.address || '';
        
        // Set tax rate
        document.getElementById('taxRate').value = (data.taxRate * 100).toFixed(2);
        
        updateInvoicePreview();
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    loadSavedInvoice();
});
