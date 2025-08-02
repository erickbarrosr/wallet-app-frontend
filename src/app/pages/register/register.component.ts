import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
  standalone: true
})
export class RegisterComponent {
  email: string = '';
  name: string = '';

  constructor(private router: Router) {}

  async onRegister() {
    if (this.name.length < 3) {
      alert('Nome deve conter mais de 3 caracters.');
      return;
    }

    if (this.email.length < 5 || !this.email.includes('@')) {
      alert('Email inválido!');
      return;
    }

    try {
      const data = {
        email: this.email,
        name: this.name,
      };

      const response = await fetch(
        'https://mp-wallet-app-api.herokuapp.com/users',
        {
          method: 'POST',
          mode: 'cors',
          cache: 'no-cache',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      );

      const user = await response.json();

      if (response.ok) {
        localStorage.setItem('@WalletApp:userEmail', user.email);
        localStorage.setItem('@WalletApp:userName', user.name);
        localStorage.setItem('@WalletApp:userId', user.id);
        this.router.navigate(['/home']);
      } else {
        alert('Falha ao cadastrar usuário.');
      }
    } catch (error) {
      alert('Falha ao cadastrar usuário.');
      console.error(error);
    }
  }
}
