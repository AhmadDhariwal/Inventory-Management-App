import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SupplierService } from '../../shared/services/supplier.service';
import { Supplier } from '../../shared/models/inventory/supplier.model';

@Component({
  selector: 'app-supplier-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './supplier-form.component.html',
  styleUrl: './supplier-form.component.scss'
})
export class SupplierFormComponent implements OnInit {
  supplierForm: FormGroup;
  isEditMode = false;
  supplierId: string | null = null;
  loading = false;
  submitting = false;

  paymentTermsOptions = [
    { value: 'CASH', label: 'Cash' },
    { value: 'NET_15', label: 'Net 15 Days' },
    { value: 'NET_30', label: 'Net 30 Days' },
    { value: 'NET_60', label: 'Net 60 Days' }
  ];

  constructor(
    private fb: FormBuilder,
    private supplierService: SupplierService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.supplierForm = this.createForm();
  }

  ngOnInit(): void {
    this.supplierId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.supplierId;

    if (this.isEditMode && this.supplierId) {
      this.loadSupplier(this.supplierId);
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      contactperson: ['', [Validators.maxLength(100)]],
      email: ['', [Validators.email, Validators.maxLength(100)]],
      phone: ['', [Validators.maxLength(20)]],
      address: ['', [Validators.maxLength(500)]],
      paymentterms: ['CASH', [Validators.required]],
      isactive: [true]
    });
  }

  loadSupplier(id: string): void {
    this.loading = true;
    this.supplierService.getSupplierById(id).subscribe({
      next: (supplier) => {
        this.supplierForm.patchValue(supplier);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading supplier:', error);
        this.loading = false;
        this.router.navigate(['/suppliers']);
      }
    });
  }

  onSubmit(): void {
    if (this.supplierForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.submitting = true;
    const supplierData = this.supplierForm.value;

    const operation = this.isEditMode
      ? this.supplierService.updateSupplier(this.supplierId!, supplierData)
      : this.supplierService.createSupplier(supplierData);

    operation.subscribe({
      next: () => {
        this.submitting = false;
        this.router.navigate(['/suppliers']);
      },
      error: (error) => {
        console.error('Error saving supplier:', error);
        this.submitting = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/suppliers']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.supplierForm.controls).forEach(key => {
      const control = this.supplierForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.supplierForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${this.getFieldLabel(fieldName)} is required`;
      if (field.errors['email']) return 'Please enter a valid email address';
      if (field.errors['minlength']) return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      if (field.errors['maxlength']) return `${this.getFieldLabel(fieldName)} cannot exceed ${field.errors['maxlength'].requiredLength} characters`;
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      name: 'Supplier name',
      contactperson: 'Contact person',
      email: 'Email',
      phone: 'Phone',
      address: 'Address',
      paymentterms: 'Payment terms'
    };
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.supplierForm.get(fieldName);
    return !!(field?.invalid && field.touched);
  }
}
