import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

export interface LoginResponse {
    userId: number
    userName: string;
    message: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = 'http://localhost:8081/api/v1/userAuth';

    constructor(private http: HttpClient) { }

    register(userName: string, password: string): Observable<any> {
            return this.http.post(`${this.apiUrl}/register`, { userName, password },
            {
                responseType: 'text' // Expecting a plain text response
            }
        );
    }

    login(userName: string, password: string): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { userName, password },
            { withCredentials: true }
        );
    }
}