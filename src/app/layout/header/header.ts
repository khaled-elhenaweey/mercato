import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth/auth-service';
import { RouterLink } from '@angular/router';
import { SearchBar } from '../../shared/components/search-bar/search-bar';

@Component({
  selector: 'app-header',
  imports: [MatIconModule, RouterLink, SearchBar],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  public authService = inject(AuthService);
}
