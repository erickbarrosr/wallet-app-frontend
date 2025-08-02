import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  standalone: true
})
export class LoginComponent {
  email: string = '';

  constructor(private router: Router, private authService: AuthService) {}

  async onClickLogin() {
    if (this.email.length < 5 || !this.email.includes('@')) {
      alert('Email inválido!');
      return;
    }
    
    try {
      const user = await this.authService.validateUser(this.email);
      if (user) {
        localStorage.setItem('@WalletApp:userEmail', user.email);
        localStorage.setItem('@WalletApp:userName', user.name);
        localStorage.setItem('@WalletApp:userId', user.id);
        this.router.navigate(['/home']);
      }
    } catch (error) {
      alert('Falha ao validar e-mail.');
    }
  }
}
