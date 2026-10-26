import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    private apiUrl = 'http://localhost:8081/api/v1/orders';

    constructor(private http: HttpClient) { }

    placeOrder(userId: number): Observable<any> {
        return this.http.post(`${this.apiUrl}/orderItem/${userId}`, null, {
            withCredentials: true
        });
    }

    getOrders(userId: number): Observable<any> {
        return this.http.get(`${this.apiUrl}/user/${userId}`, {
            withCredentials: true
        });
    }
}