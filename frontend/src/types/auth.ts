export interface Token {
    access_token: string;
    token_type: "bearer";
  }
  
  export interface LoginCredentials {
    email: string;
    password: string;
  }