import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[appHasRole]',
  standalone: true
})
export class HasRoleDirective implements OnInit, OnDestroy {
  private subscription: Subscription = new Subscription();
  private requiredRoles: string[] = [];

  @Input() set appHasRole(roles: string | string[]) {
    this.requiredRoles = Array.isArray(roles) ? roles : [roles];
    this.updateView();
  }

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.subscription.add(
      this.authService.currentUser$.subscribe(() => {
        this.updateView();
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private updateView() {
    this.viewContainer.clear();
    
    if (this.authService.hasAnyRole(this.requiredRoles)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }
}