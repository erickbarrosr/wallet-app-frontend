import { Injectable } from '@angular/core';

interface User {
  email: string;
  name: string;
  id: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://mp-wallet-app-api.herokuapp.com/users';

  constructor() { }

  async validateUser(email: string): Promise<User> {
    try {
      const response = await fetch(`${this.apiUrl}?email=${email}`);
      if (!response.ok) {
        throw new Error('Failed to validate user');
      }
      const user = await response.json();
      return user;
    } catch (error) {
      console.error('Error validating user:', error);
      throw error;
    }
  }
}
