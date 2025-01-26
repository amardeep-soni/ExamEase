import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  isMenuOpen = false;
  isMobileMenuOpen = false;
  isUserDropdownOpen = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const userDropdown = document.getElementById('userDropdown');
    const userCircle = document.getElementById('userCircle');
    
    if (!userDropdown?.contains(event.target as Node) && 
        !userCircle?.contains(event.target as Node)) {
      this.isUserDropdownOpen = false;
    }
  }

  toggleUserDropdown(event: Event) {
    event.stopPropagation();
    this.isUserDropdownOpen = !this.isUserDropdownOpen;
  }

  get isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  get username(): string | null {
    const email = this.authService.getUsername();
    if (!email) return null;
    return email.split('@')[0]; // Get the part before @
  }

  get userInitial(): string {
    const username = this.username;
    return username ? username.slice(0, 2).toUpperCase() : '';
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  logout() {
    this.isUserDropdownOpen = false;
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
