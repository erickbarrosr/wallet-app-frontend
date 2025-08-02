import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';

interface Finance {
  id: string;
  title: string;
  date: string;
  value: number;
  category: string;
}

interface Category {
  id: string;
  name: string;
}

@Component({
  selector: 'app-home',
  imports: [FormsModule, RouterLink, CommonModule, CurrencyPipe, DatePipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  standalone: true
})
export class HomeComponent implements OnInit {
  finances: Finance[] = [];
  categories: Category[] = [];
  userName: string = '';
  userInitials: string = '';
  userId: string = '';
  userEmail: string = '';
  selectedDate: string = '';
  totalIncome: number = 0;
  totalExpense: number = 0;
  totalBalance: number = 0;
  isModalOpen: boolean = false;
  formData = {
    title: '',
    value: 0,
    date: '',
    category: ''
  };

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.checkUserAuthenticated();
    this.getUserInfo();
    this.setCurrentDate();
    this.onLoadCategories();
    this.onLoadFinancesData();
  }

  checkUserAuthenticated(): void {
    const userId = localStorage.getItem('@WalletApp:userId');
    if (!userId) {
      this.router.navigate(['/']);
    }
  }

  getUserInfo(): void {
    this.userId = localStorage.getItem('@WalletApp:userId') || '';
    this.userEmail = localStorage.getItem('@WalletApp:userEmail') || '';
    this.userName = localStorage.getItem('@WalletApp:userName') || '';
    this.userInitials = this.userName.split(' ')
      .map(name => name.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  }

  setCurrentDate(): void {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    this.selectedDate = `${year}-${month}`;
  }

  async onLoadCategories(): Promise<void> {
    try {
      const response = await fetch('https://mp-wallet-app-api.herokuapp.com/categories');
      const data = await response.json();
      this.categories = data;
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }

  async onLoadFinancesData(): Promise<void> {
    try {
      const dateArray = this.selectedDate.split('-');
      const year = dateArray[0];
      const month = dateArray[1];
      const response = await fetch(
        `https://mp-wallet-app-api.herokuapp.com/finances?userId=${this.userId}&month=${month}&year=${year}`
      );
      const data = await response.json();
      this.finances = data;
      this.calculateTotals();
    } catch (error) {
      console.error('Error loading finances:', error);
    }
  }

  calculateTotals(): void {
    this.totalIncome = this.finances
      .filter(finance => finance.value > 0)
      .reduce((acc, finance) => acc + finance.value, 0);

    this.totalExpense = this.finances
      .filter(finance => finance.value < 0)
      .reduce((acc, finance) => acc + finance.value, 0);

    this.totalBalance = this.totalIncome + this.totalExpense;
  }

  onLogout(): void {
    localStorage.clear();
    this.router.navigate(['/']);
  }

  onOpenModal(): void {
    this.isModalOpen = true;
  }

  onCloseModal(): void {
    this.isModalOpen = false;
    this.resetFormData();
  }

  resetFormData(): void {
    this.formData = {
      title: '',
      value: 0,
      date: '',
      category: ''
    };
  }

  async onCreateFinanceRelease(): Promise<void> {
    try {
      const { title, value, date, category } = this.formData;
      
      if (!title || !date || !category) {
        alert('Preencha todos os campos!');
        return;
      }

      const data = {
        title,
        value,
        date,
        category,
        userId: this.userId
      };

      const response = await fetch(
        'https://mp-wallet-app-api.herokuapp.com/finances',
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

      if (response.ok) {
        this.onCloseModal();
        this.onLoadFinancesData();
      } else {
        alert('Erro ao adicionar lançamento.');
      }
    } catch (error) {
      console.error('Error creating finance release:', error);
      alert('Erro ao adicionar lançamento.');
    }
  }

  async onDeleteItem(id: string): Promise<void> {
    try {
      const response = await fetch(`https://mp-wallet-app-api.herokuapp.com/finances/${id}`, {
        method: 'DELETE',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
          email: this.userEmail,
        },
      });

      if (response.ok) {
        this.onLoadFinancesData();
      } else {
        alert('Erro ao deletar o item.');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Erro ao deletar o item.');
    }
  }
}
